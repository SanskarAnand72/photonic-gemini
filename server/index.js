const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Pinecone } = require('@pinecone-database/pinecone');
const Groq = require('groq-sdk');
const { pipeline } = require('@huggingface/transformers');

dotenv.config();

const app = express();
app.use(cors({
    origin: [
        'http://localhost:5177',
        'http://localhost:5000',
        /^https:\/\/.*\.vercel\.app$/
    ],
    credentials: true
}));
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Initialize Clients
const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
});
const index = pinecone.index(process.env.PINECONE_INDEX);

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

// Initialize embedding model (lazy loaded on first use)
let embedder = null;
async function getEmbedder() {
    if (!embedder) {
        console.log('Loading BAAI/bge-large-en-v1.5 model...');
        embedder = await pipeline('feature-extraction', 'Xenova/bge-large-en-v1.5');
        console.log('Model loaded successfully!');
    }
    return embedder;
}

// Product-related keywords for fallback detection
const PRODUCT_KEYWORDS = /\b(shirt|dress|pant|jean|jacket|coat|shoe|sneaker|boot|bag|watch|sunglass|hat|cap|skirt|blouse|sweater|hoodie|tshirt|t-shirt|top|bottom|outfit|clothing|wear|fashion|style|black|white|red|blue|green|yellow|pink|purple|orange|men|women|kids|casual|formal|party|wedding|office)\b/i;

// Classify query type using Groq
async function classifyQuery(message) {
    try {
        const classification = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `You are a query classifier for a fashion e-commerce chatbot. Classify the user's message into ONE of these categories:
- "greeting": Simple greetings like hi, hello, hey
- "general": General questions about the store, help, services, or conversational queries
- "product": Specific product searches or requests for clothing items

Respond with ONLY ONE WORD: greeting, general, or product`
                },
                {
                    role: "user",
                    content: message,
                },
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.1,
        });

        const result = classification.choices[0]?.message?.content?.toLowerCase().trim();
        console.log(`Query classification: "${message}" -> ${result}`);

        // Validate result
        if (['greeting', 'general', 'product'].includes(result)) {
            return result;
        }

        // Fallback: check for product keywords
        if (PRODUCT_KEYWORDS.test(message)) {
            return 'product';
        }

        return 'general';
    } catch (error) {
        console.error('Classification error:', error);
        // Fallback logic
        if (PRODUCT_KEYWORDS.test(message)) {
            return 'product';
        }
        return 'general';
    }
}

app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Classify the query
        const queryType = await classifyQuery(message);

        // Handle based on classification
        if (queryType === 'greeting') {
            // Greeting -> Warm welcome
            try {
                const chatCompletion = await groq.chat.completions.create({
                    messages: [
                        {
                            role: "system",
                            content: "You are a helpful, friendly, and stylish fashion assistant for a brand called 'LUMIÈRE'. Respond to the user's greeting warmly and ask how you can help them find their perfect style today. Keep it concise (2-3 sentences max)."
                        },
                        {
                            role: "user",
                            content: message,
                        },
                    ],
                    model: "llama-3.3-70b-versatile",
                });

                return res.json({
                    type: 'bot',
                    text: chatCompletion.choices[0]?.message?.content || "Hello! How can I help you today?",
                    products: []
                });
            } catch (groqError) {
                console.error("Groq API Error:", groqError);
                return res.json({
                    type: 'bot',
                    text: "Hello! 👋 I'm your personal fashion assistant. How can I help you find the perfect look today?",
                    products: []
                });
            }
        } else if (queryType === 'general') {
            // General question -> Conversational AI
            try {
                const chatCompletion = await groq.chat.completions.create({
                    messages: [
                        {
                            role: "system",
                            content: `You are a helpful fashion assistant for LUMIÈRE, a premium fashion brand. Answer questions about:
- What products we sell (shirts, dresses, pants, shoes, accessories for men and women)
- How to use the chatbot (just ask for products like "black shirt" or "red dress")
- Fashion advice and styling tips
- Our services

Keep responses concise (2-4 sentences). If they ask about specific products, encourage them to search (e.g., "Try asking for 'black shirt for men'").`
                        },
                        {
                            role: "user",
                            content: message,
                        },
                    ],
                    model: "llama-3.3-70b-versatile",
                });

                return res.json({
                    type: 'bot',
                    text: chatCompletion.choices[0]?.message?.content || "I can help you find the perfect outfit! Just tell me what you're looking for.",
                    products: []
                });
            } catch (groqError) {
                console.error("Groq API Error:", groqError);
                return res.json({
                    type: 'bot',
                    text: "I'm here to help you find amazing fashion items! You can ask me for specific products like 'black shirt' or 'red dress', and I'll show you our best matches.",
                    products: []
                });
            }
        } else {
            // Product search -> BAAI embeddings + Pinecone
            console.log(`Product search for: "${message}"`);

            const model = await getEmbedder();
            const output = await model(message, { pooling: 'mean', normalize: true });
            const vector = Array.from(output.data);

            console.log(`Generated embedding vector of length: ${vector.length}`);

            // Query Pinecone
            const queryResponse = await index.query({
                vector: vector,
                topK: 20, // Get more to ensure we have enough after filtering
                includeMetadata: true,
            });

            console.log(`Pinecone returned ${queryResponse.matches.length} matches`);

            // DEBUG: Log first match to see metadata structure
            if (queryResponse.matches.length > 0) {
                console.log('=== FIRST MATCH DEBUG ===');
                console.log('ID:', queryResponse.matches[0].id);
                console.log('Score:', queryResponse.matches[0].score);
                console.log('Metadata:', JSON.stringify(queryResponse.matches[0].metadata, null, 2));
                console.log('========================');
            }

            // Remove duplicates and format results
            const seenIds = new Set();
            const products = [];

            for (const match of queryResponse.matches) {
                // Skip duplicates
                if (seenIds.has(match.id)) {
                    console.log(`Skipping duplicate ID: ${match.id}`);
                    continue;
                }
                seenIds.add(match.id);

                // Skip low-quality matches (score threshold)
                if (match.score < 0.3) {
                    console.log(`Skipping low score (${match.score}): ${match.id}`);
                    continue;
                }

                // Skip products with missing critical metadata
                const hasValidMetadata = match.metadata?.["Product Summary"] || match.metadata?.text;
                const hasValidPrice = match.metadata?.Price || match.metadata?.price;
                const hasValidImage = match.metadata?.["Image URL"] || match.metadata?.image;

                if (!hasValidMetadata || !hasValidPrice || !hasValidImage) {
                    console.log(`Skipping product with missing metadata: ${match.id}`);
                    continue;
                }

                products.push({
                    id: match.id,
                    name: match.metadata?.["Product Summary"] || match.metadata?.text || "Fashion Item",
                    price: match.metadata?.Price || match.metadata?.price || "Contact for Price",
                    rating: match.metadata?.Rating || match.metadata?.rating || 4.5,
                    image: match.metadata?.["Image URL"] || match.metadata?.image || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=800",
                    score: match.score,
                    // Additional metadata for display
                    category: match.metadata?.["Product Category"] || "",
                    color: match.metadata?.["Product Color"] || "",
                    gender: match.metadata?.Gender || "",
                    url: match.metadata?.["Product URL"] || ""
                });

                // Stop at 5 unique products
                if (products.length >= 5) {
                    break;
                }
            }

            console.log(`Returning ${products.length} unique products`);

            let botText = "Here are the best matches I found for you:";
            if (products.length === 0) {
                botText = "Sorry, this product is currently not in our stock. Would you like to try searching for something else?";
            }

            return res.json({
                type: 'bot',
                text: botText,
                products: products
            });
        }

    } catch (error) {
        console.error("Error processing request:", error);

        // Check for Pinecone Dimension Mismatch
        if (error.message && error.message.includes('dimension')) {
            return res.status(400).json({
                error: "Configuration Error: Pinecone index dimension mismatch.",
                type: 'bot',
                text: "⚠️ Configuration Error: The Pinecone index dimensions don't match. Expected 1024 dimensions for BAAI/bge-large-en-v1.5.",
                products: []
            });
        }

        res.status(500).json({
            error: error.message || "Internal Server Error",
            type: 'bot',
            text: "I encountered an error while processing your request. Please try again.",
            products: []
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Note: The embedding model will be downloaded on first product search (may take a few minutes)');
});
