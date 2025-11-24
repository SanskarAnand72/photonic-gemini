import React from 'react';
import { Star, Camera } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
    const { id, name, price, image, rating } = product;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow w-64 flex-shrink-0 snap-center">
            <div className="relative aspect-[3/4] overflow-hidden">
                <img
                    src={image}
                    alt={name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
                <Link
                    to="/try-on"
                    state={{ product }}
                    className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm text-violet-600 p-2 rounded-full shadow-sm hover:bg-violet-600 hover:text-white transition-colors"
                    title="Try On"
                >
                    <Camera className="w-4 h-4" />
                </Link>
            </div>

            <div className="p-3">
                <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-gray-900 truncate text-sm">{name}</h4>
                    <div className="flex items-center text-amber-400 text-xs">
                        <Star className="w-3 h-3 fill-current" />
                        <span className="ml-1 text-gray-500">{rating}</span>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900">₹{price}</span>
                    <button className="text-xs font-medium text-violet-600 hover:text-violet-700">
                        View Details
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
