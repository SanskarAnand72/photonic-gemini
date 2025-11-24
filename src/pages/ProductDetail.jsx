import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, ShoppingBag, Heart, ArrowLeft, Camera } from 'lucide-react';

const ProductDetail = () => {
    const { id } = useParams();

    // Mock product data (in a real app, fetch based on ID)
    const product = {
        id: id,
        name: "Classic Red Evening Gown",
        price: 2499,
        rating: 4.8,
        reviews: 124,
        description: "Elegant floor-length evening gown in a stunning red shade. Perfect for weddings, parties, and formal events. Made from premium silk blend fabric.",
        image: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&q=80&w=800",
        sizes: ["XS", "S", "M", "L", "XL"],
        colors: ["Red", "Black", "Navy"]
    };

    return (
        <div className="min-h-screen bg-white pb-20">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center justify-between">
                <Link to="/" className="p-2 hover:bg-gray-100 rounded-full">
                    <ArrowLeft className="w-6 h-6 text-gray-600" />
                </Link>
                <h1 className="font-semibold text-gray-900">Product Details</h1>
                <button className="p-2 hover:bg-gray-100 rounded-full">
                    <ShoppingBag className="w-6 h-6 text-gray-600" />
                </button>
            </div>

            <div className="container mx-auto max-w-4xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-4 md:p-8">
                    {/* Image Section */}
                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100">
                        <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                        />
                        <Link
                            to="/try-on"
                            className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md text-violet-600 px-4 py-2 rounded-full font-medium shadow-lg hover:bg-violet-600 hover:text-white transition-colors flex items-center gap-2"
                        >
                            <Camera className="w-5 h-5" />
                            Virtual Try-On
                        </Link>
                    </div>

                    {/* Info Section */}
                    <div className="space-y-6">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>
                                <button className="p-2 hover:bg-red-50 rounded-full text-gray-400 hover:text-red-500 transition-colors">
                                    <Heart className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <div className="flex items-center text-amber-400">
                                    <Star className="w-4 h-4 fill-current" />
                                    <span className="ml-1 font-medium text-gray-900">{product.rating}</span>
                                </div>
                                <span className="text-gray-400">•</span>
                                <span className="text-gray-500">{product.reviews} reviews</span>
                            </div>
                        </div>

                        <div>
                            <span className="text-3xl font-bold text-gray-900">₹{product.price}</span>
                            <span className="text-sm text-gray-500 ml-2">inclusive of all taxes</span>
                        </div>

                        <div>
                            <h3 className="font-medium text-gray-900 mb-3">Select Size</h3>
                            <div className="flex flex-wrap gap-3">
                                {product.sizes.map(size => (
                                    <button key={size} className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:border-violet-600 hover:text-violet-600 transition-colors">
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="font-medium text-gray-900 mb-3">Description</h3>
                            <p className="text-gray-600 leading-relaxed">
                                {product.description}
                            </p>
                        </div>

                        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 md:relative md:border-none md:p-0 md:bg-transparent">
                            <button className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-lg">
                                Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
