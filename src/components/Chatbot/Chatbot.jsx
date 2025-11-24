import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Mic, Image as ImageIcon, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from '../Product/ProductCard';
import { API_URL } from '../../config';

const OCCASIONS = [
    { id: 'party', label: '🎉 Party', query: 'party outfit' },
    { id: 'wedding', label: '💍 Wedding', query: 'wedding guest' },
    { id: 'casual', label: '☕ Casual', query: 'casual wear' },
    { id: 'office', label: '💼 Office', query: 'office wear' },
];

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'bot',
            text: "Hi there! I'm your personal fashion assistant. Looking for something specific or need styling advice?",
            products: []
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen, isTyping]);

    const toggleChat = () => setIsOpen(!isOpen);

    const sendMessage = async (text) => {
        if (!text.trim()) return;

        setMessages(prev => [...prev, { id: Date.now(), type: 'user', text: text }]);
        setInputValue('');
        setIsTyping(true);

        try {
            // Create abort controller for timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 120000); // 120 second timeout for cold starts

            console.log('🚀 Sending request to:', `${API_URL}/api/chat`);

            const response = await fetch(`${API_URL}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: text }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            console.log('✅ Response received:', response.status);

            const data = await response.json();

            if (response.ok) {
                setMessages(prev => [...prev, {
                    id: Date.now() + 1,
                    type: 'bot',
                    text: data.text,
                    products: data.products || []
                }]);
            } else {
                throw new Error(data.error || data.text || 'Failed to fetch response');
            }
        } catch (error) {
            console.error("❌ Error sending message:", error);

            let errorMessage = "Sorry, I'm having trouble connecting to the server right now. Please try again later.";

            if (error.name === 'AbortError') {
                errorMessage = "⏳ The server is taking longer than expected. This can happen on the first product search (downloading AI model) or after inactivity (cold start). Please try again - it should be faster next time!";
            } else if (error.message) {
                errorMessage = error.message;
            }

            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                type: 'bot',
                text: errorMessage,
                products: []
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleSend = (e) => {
        e.preventDefault();
        sendMessage(inputValue);
    };

    const handleVoiceInput = () => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.lang = 'en-US';
            recognition.start();
            setIsTyping(true);

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setInputValue(transcript);
                sendMessage(transcript);
            };

            recognition.onerror = (event) => {
                console.error("Speech recognition error", event.error);
                setIsTyping(false);
            };

            recognition.onend = () => {
                // setIsTyping(false);
            };
        } else {
            alert("Voice input is not supported in this browser.");
        }
    };

    return (
        <>
            {/* Toggle Button */}
            <motion.button
                className="fixed bottom-6 right-6 bg-violet-600 text-white p-4 rounded-full shadow-lg hover:bg-violet-700 transition-colors z-50"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleChat}
            >
                {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-24 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 border border-gray-100 font-sans"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-4 text-white shadow-md">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                    <Sparkles className="w-5 h-5 text-yellow-300" />
                                </div>
                                <div>
                                    <h3 className="font-bold">Fashion Assistant</h3>
                                    <p className="text-xs text-white/80 flex items-center gap-1">
                                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                        Online • AI Powered
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50 scrollbar-thin scrollbar-thumb-gray-200">
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex flex-col ${msg.type === 'user' ? 'items-end' : 'items-start'}`}
                                >
                                    <div
                                        className={`max-w-[85%] p-3 rounded-2xl shadow-sm ${msg.type === 'user'
                                            ? 'bg-violet-600 text-white rounded-br-none'
                                            : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
                                            }`}
                                    >
                                        <p className="text-sm leading-relaxed">{msg.text}</p>
                                    </div>

                                    {/* Product Carousel */}
                                    {msg.products && msg.products.length > 0 && (
                                        <div className="mt-3 w-full overflow-x-auto pb-2 flex gap-3 snap-x">
                                            {msg.products.map(product => (
                                                <ProductCard key={product.id} product={product} />
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                            {isTyping && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex items-center gap-1 text-gray-400 text-xs ml-2"
                                >
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Occasion Chips */}
                        <div className="px-4 py-2 bg-gray-50 flex gap-2 overflow-x-auto scrollbar-hide border-t border-gray-100">
                            {OCCASIONS.map(occ => (
                                <button
                                    key={occ.id}
                                    onClick={() => sendMessage(occ.query)}
                                    className="whitespace-nowrap px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-600 hover:bg-violet-50 hover:border-violet-200 hover:text-violet-600 transition-colors"
                                >
                                    {occ.label}
                                </button>
                            ))}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t border-gray-100">
                            <form onSubmit={handleSend} className="flex items-center gap-2">
                                <button type="button" className="p-2 text-gray-400 hover:text-violet-600 transition-colors hover:bg-violet-50 rounded-full">
                                    <ImageIcon className="w-5 h-5" />
                                </button>
                                <button
                                    type="button"
                                    onClick={handleVoiceInput}
                                    className="p-2 text-gray-400 hover:text-violet-600 transition-colors hover:bg-violet-50 rounded-full"
                                >
                                    <Mic className="w-5 h-5" />
                                </button>
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Ask for 'red dress'..."
                                    className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-600/20 transition-all"
                                />
                                <button
                                    type="submit"
                                    disabled={!inputValue.trim()}
                                    className="p-2 bg-violet-600 text-white rounded-full hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform active:scale-95"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Chatbot;
