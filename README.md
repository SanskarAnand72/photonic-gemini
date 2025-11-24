# LUMIÈRE - AI Fashion Chatbot 🛍️✨

An intelligent fashion e-commerce chatbot powered by AI, featuring smart product search, conversational assistance, and virtual try-on capabilities.

![LUMIÈRE Banner](https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1200&h=400)

## 🌟 Features

### 🤖 AI-Powered Chatbot
- **Smart Query Classification** - Automatically detects greetings, general questions, and product searches
- **Conversational AI** - Powered by Groq's Llama 3.3 70B model for natural conversations
- **Voice Input** - Speak your queries using Web Speech API
- **Occasion-Based Styling** - Get recommendations for Party, Wedding, Casual, and Office occasions

### 🔍 Intelligent Product Search
- **Semantic Search** - Uses BAAI/bge-large-en-v1.5 embeddings (1024 dimensions)
- **Vector Database** - Pinecone integration for fast, accurate product retrieval
- **Real Product Data** - Fetches actual products with images, prices, and ratings
- **Deduplication** - Returns 5 unique, high-quality results per search

### 📸 Virtual Try-On (Beta)
- **Camera Integration** - Real-time camera feed
- **Product Overlay** - See how products look on you
- **Photo Capture** - Download photos with product overlay
- **Adjustable Opacity** - Control product visibility

### 🎨 Modern UI/UX
- **Beautiful Design** - Premium, futuristic interface
- **Responsive** - Works on desktop and mobile
- **Smooth Animations** - Framer Motion for delightful interactions
- **Dark Mode** - Sleek dark theme throughout

## 🚀 Tech Stack

### Frontend
- **React 18** - Modern UI library
- **Vite** - Lightning-fast build tool
- **Tailwind CSS v4** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Lucide React** - Beautiful icons
- **React Router** - Client-side routing

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **Pinecone** - Vector database for product search
- **Groq SDK** - LLM API for conversational AI
- **Hugging Face Transformers.js** - Local embeddings generation

### AI/ML
- **Groq Llama 3.3 70B** - Conversational AI
- **BAAI/bge-large-en-v1.5** - Text embeddings (1024 dims)
- **TensorFlow.js** - Face detection (Virtual Try-On)
- **MediaPipe FaceMesh** - Face landmark detection

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- Pinecone account (free tier)
- Groq API key (free tier)
- Hugging Face API key (free)

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/photonic-gemini.git
cd photonic-gemini
```

### 2. Install Dependencies

**Frontend:**
```bash
npm install
```

**Backend:**
```bash
cd server
npm install
cd ..
```

### 3. Environment Setup

Create `server/.env` file:
```env
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX=your_index_name
HUGGINGFACE_API_KEY=your_huggingface_api_key
GROQ_API_KEY=your_groq_api_key
PORT=5000
```

### 4. Pinecone Setup

1. Create a Pinecone index with **1024 dimensions**
2. Upload your product data with metadata:
   - `Product Summary` - Product name
   - `Image URL` - Product image
   - `Product Category` - Category (Shirt, Dress, etc.)
   - `Product Color` - Color
   - `Gender` - Target gender
   - `Product URL` - Product link

### 5. Run the Application

**Start Backend:**
```bash
cd server
node index.js
```

**Start Frontend (in a new terminal):**
```bash
npm run dev
```

Open http://localhost:5177 in your browser.

## 🎯 Usage

### Product Search
1. Open the chatbot (purple button)
2. Type or speak your query (e.g., "black shirt for men")
3. Browse the 5 best matching products
4. Click "View Details" or "Try On"

### Virtual Try-On
1. Search for a product
2. Click the camera icon on any product card
3. Allow camera access
4. Adjust opacity slider
5. Capture and download photos

### Occasion Styling
1. Select an occasion (Party, Wedding, Casual, Office)
2. Get curated product recommendations
3. Browse styled outfits

## 📁 Project Structure

```
photonic-gemini/
├── src/
│   ├── components/
│   │   ├── Chatbot/          # Chatbot UI components
│   │   ├── Hero/              # Landing page hero
│   │   ├── Navbar/            # Navigation bar
│   │   └── Product/           # Product cards
│   ├── pages/
│   │   ├── Home.jsx           # Main landing page
│   │   └── VirtualTryOn.jsx   # Virtual try-on page
│   ├── App.jsx                # Main app component
│   └── main.jsx               # Entry point
├── server/
│   ├── index.js               # Express server + AI logic
│   └── .env                   # Environment variables
├── public/                    # Static assets
└── package.json               # Dependencies
```

## 🔑 API Keys

### Get Your Free API Keys:

1. **Groq** - https://console.groq.com/
   - Sign up for free
   - Create API key
   - 14,400 requests/day free

2. **Pinecone** - https://www.pinecone.io/
   - Free tier: 1 index, 100K vectors
   - Create index with 1024 dimensions

3. **Hugging Face** - https://huggingface.co/
   - Sign up for free
   - Create access token
   - Unlimited inference

## 🛠️ Configuration

### Pinecone Index Setup
```javascript
// Dimension: 1024
// Metric: cosine
// Cloud: AWS (free tier)
// Region: us-east-1
```

### Embedding Model
```javascript
// Model: BAAI/bge-large-en-v1.5
// Dimensions: 1024
// Library: @huggingface/transformers
```

## 🐛 Troubleshooting

### Chatbot shows generic products
- Check Pinecone metadata field names
- Ensure fields: `Product Summary`, `Image URL`, `Product Category`

### Virtual Try-On not working
- Allow camera permissions in browser
- Use HTTPS or localhost
- Check browser console for errors

### Server errors
- Verify all API keys in `.env`
- Check Pinecone index dimensions (must be 1024)
- Ensure Node.js 18+

## 📝 License

MIT License - feel free to use for personal or commercial projects.

## 🤝 Contributing

Contributions welcome! Please open an issue or submit a pull request.

## 👨‍💻 Author

Created with ❤️ by [Your Name]

## 🙏 Acknowledgments

- Groq for fast LLM inference
- Pinecone for vector search
- Hugging Face for embeddings
- Levi's for product data

---

**⭐ Star this repo if you found it helpful!**
