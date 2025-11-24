import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Chatbot from './components/Chatbot/Chatbot';
import VirtualTryOn from './pages/VirtualTryOn';
import ProductDetail from './pages/ProductDetail';
import { ShoppingBag, Menu, Search } from 'lucide-react';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-full lg:hidden">
                <Menu className="w-6 h-6" />
              </button>
              <a href="/" className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                Mercato
              </a>
            </div>

            <div className="hidden lg:flex items-center gap-8 font-medium text-gray-600">
              <a href="#" className="hover:text-violet-600 transition-colors">New Arrivals</a>
              <a href="#" className="hover:text-violet-600 transition-colors">Women</a>
              <a href="#" className="hover:text-violet-600 transition-colors">Men</a>
              <a href="#" className="hover:text-violet-600 transition-colors">Beauty</a>
              <a href="#" className="hover:text-violet-600 transition-colors">Accessories</a>
            </div>

            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <Search className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full relative">
                <ShoppingBag className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/try-on" element={<VirtualTryOn />} />
            <Route path="/product/:id" element={<ProductDetail />} />
          </Routes>
        </main>

        {/* Chatbot */}
        <Chatbot />
      </div>
    </Router>
  );
}

// Simple Home Component for now
function Home() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
          Discover Your <span className="text-violet-600">Perfect Style</span>
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Experience the future of fashion with our AI-powered personal stylist.
          Find, try, and match products instantly.
        </p>
        <button className="bg-gray-900 text-white px-8 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors">
          Shop Collection
        </button>
      </div>

      {/* Featured Categories Grid could go here */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="aspect-[3/4] bg-gray-200 rounded-2xl animate-pulse"></div>
        ))}
      </div>
    </div>
  );
}

export default App;
