import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const RestaurantCard = ({ restaurant }) => {
  const { user } = useAuth();
  const isPrime = user && user.isPrime && user.primeExpiry && new Date(user.primeExpiry) > new Date();

  // Placeholder images array for fallback
  const fallbackImages = [
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500',
    'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=500',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=500'
  ];
  
  const cardImage = restaurant.image || fallbackImages[restaurant.name.length % 3];

  return (
    <Link
      to={`/restaurant/${restaurant._id}`}
      className="bg-white rounded-lg shadow-sm hover:shadow-md border border-gray-200 overflow-hidden group transition-all duration-200 flex flex-col h-full"
    >
      {/* Card Image */}
      <div className="relative h-44 w-full bg-gray-100 overflow-hidden">
        <img
          src={cardImage}
          alt={restaurant.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {/* Rating overlay */}
        <div className="absolute bottom-2 left-2 bg-amazon-dark bg-opacity-90 text-white text-xs font-bold px-2 py-1 rounded flex items-center space-x-1 shadow">
          <Star size={12} className="fill-amazon-orange text-amazon-orange" />
          <span>{restaurant.rating.toFixed(1)}</span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex flex-col flex-1 space-y-1.5">
        <div className="flex justify-between items-start">
          <h3 className="text-base font-bold text-gray-900 truncate group-hover:text-amazon-orange transition-colors">
            {restaurant.name}
          </h3>
        </div>

        {/* Cuisine Types */}
        <p className="text-xs text-gray-500 line-clamp-1">
          {restaurant.cuisines ? restaurant.cuisines.join(', ') : 'North Indian, Fast Food'}
        </p>

        {/* Delivery Details */}
        <div className="flex items-center space-x-4 text-xs text-gray-500 pt-1">
          <span className="flex items-center space-x-1">
            <Clock size={13} className="text-amazon-orange" />
            <span>25-35 min</span>
          </span>
          <span>&bull;</span>
          <span>Min order: ₹{restaurant.minOrder}</span>
        </div>

        {/* Delivery Fee & Prime Badging */}
        <div className="pt-2 mt-auto border-t border-gray-100 flex items-center justify-between">
          {isPrime ? (
            <div className="flex items-center space-x-1 text-xs text-blue-600 font-bold">
              <ShieldCheck size={14} className="fill-blue-500 text-white" />
              <span>FREE Delivery for Prime</span>
            </div>
          ) : (
            <span className="text-xs text-gray-600 font-medium">
              Delivery: ₹{restaurant.deliveryFee}
            </span>
          )}
          {restaurant.isOpen ? (
            <span className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded font-bold border border-green-200">
              Open Now
            </span>
          ) : (
            <span className="text-[10px] bg-red-50 text-red-700 px-2 py-0.5 rounded font-bold border border-red-200">
              Closed
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default RestaurantCard;
