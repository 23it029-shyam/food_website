import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, Star, Clock, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import CuisineCategoryBar from '../../components/CuisineCategoryBar';
import RestaurantCard from '../../components/RestaurantCard';

const Home = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await axios.get('/api/restaurants');
        if (response.data.success) {
          // Limit to first 4 for featured/popular grids
          setRestaurants(response.data.data);
        }
      } catch (err) {
        console.error('Failed to load restaurants:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurants();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/restaurants?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/restaurants');
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* Scrollable Department Chips */}
      <CuisineCategoryBar />

      {/* Hero Banner Section */}
      <div className="bg-amazon-dark text-white relative py-12 md:py-20 px-4 overflow-hidden border-b border-gray-800">
        
        {/* Subtle decorative background circles */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-amazon-orange opacity-10 rounded-full blur-3xl transform translate-x-12 -translate-y-12"></div>
        <div className="absolute left-1/4 bottom-0 w-64 h-64 bg-amazon-gold opacity-10 rounded-full blur-3xl transform -translate-x-12 translate-y-12"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
          <span className="inline-flex items-center space-x-1 text-[10px] md:text-xs font-bold tracking-widest uppercase bg-amazon-orange text-amazon-dark px-3 py-1 rounded-full">
            <Sparkles size={12} className="fill-current" />
            <span>Fastest Food Delivery</span>
          </span>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            Hungry? <span className="text-amazon-orange">ShyamEats</span> delivers!
          </h1>
          
          <p className="text-gray-300 text-sm md:text-base max-w-xl mx-auto">
            Order food from your favorite local restaurants and track it in real-time. Free delivery available with ShyamEats Prime.
          </p>

          {/* Search box in hero (Mobile visible and desktop backup) */}
          <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto pt-2">
            <div className="flex shadow-lg rounded overflow-hidden">
              <input
                type="text"
                placeholder="Find restaurants, cuisines, and foods near you..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white text-gray-900 px-4 py-3 text-sm md:text-base focus:outline-none"
              />
              <button type="submit" className="bg-amazon-orange text-amazon-dark font-extrabold px-6 py-3 hover:bg-amazon-orangeHover transition-colors flex items-center space-x-1">
                <Search size={18} className="stroke-[3]" />
                <span className="hidden sm:inline">Search</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Main content body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        
        {/* Prime Banner Advert */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-lg p-6 md:p-8 flex flex-col md:flex-row items-center justify-between shadow border border-blue-800">
          <div className="space-y-2 text-center md:text-left mb-6 md:mb-0">
            <h2 className="text-xl md:text-2xl font-bold flex items-center justify-center md:justify-start space-x-2">
              <ShieldCheck className="text-blue-400 fill-blue-500 text-indigo-950" size={26} />
              <span>Get Free Delivery with ShyamEats Prime</span>
            </h2>
            <p className="text-blue-200 text-xs md:text-sm max-w-lg">
              Subscribe starting at just ₹99/month. Enjoy unlimited free delivery on all orders, priority support, and exclusive deals.
            </p>
          </div>
          <button
            onClick={() => navigate('/subscription')}
            className="bg-amazon-orange text-amazon-dark hover:bg-amazon-orangeHover px-5 py-2.5 rounded font-extrabold text-sm flex items-center space-x-1.5 shrink-0 transition-colors shadow"
          >
            <span>Explore Prime Plans</span>
            <ArrowRight size={16} className="stroke-[3]" />
          </button>
        </div>

        {/* Featured Restaurants Grid */}
        <div className="space-y-6">
          <div className="flex justify-between items-end border-b border-gray-200 pb-3">
            <div>
              <h2 className="text-xl md:text-2xl font-extrabold text-gray-900">Featured Restaurants</h2>
              <p className="text-xs text-gray-500">Popular options near you recommended by ShyamEats</p>
            </div>
            <button
              onClick={() => navigate('/restaurants')}
              className="text-amazon-orange hover:text-amazon-orangeHover font-extrabold text-sm flex items-center space-x-0.5"
            >
              <span>See All</span>
              <ArrowRight size={14} className="stroke-[3]" />
            </button>
          </div>

          {loading ? (
            /* Loading Skeleton Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(idx => (
                <div key={idx} className="bg-white rounded-lg border border-gray-200 overflow-hidden h-72 flex flex-col animate-pulse">
                  <div className="bg-gray-200 h-44 w-full"></div>
                  <div className="p-4 flex-1 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4 pt-2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : restaurants.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-lg border border-gray-200">
              <p className="text-gray-500 font-semibold">No restaurants found. Admin can approve seeded ones.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {restaurants.map(rest => (
                <RestaurantCard key={rest._id} restaurant={rest} />
              ))}
            </div>
          )}
        </div>

        {/* Cuisines Grid */}
        <div className="space-y-6">
          <div className="border-b border-gray-200 pb-3">
            <h2 className="text-xl md:text-2xl font-extrabold text-gray-900">Browse by Cuisine</h2>
            <p className="text-xs text-gray-500">Pick from our wide variety of curated departments</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {[
              { name: 'Biryani', img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300' },
              { name: 'North Indian', img: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=300' },
              { name: 'Pizza', img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300' },
              { name: 'Chinese', img: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=300' },
              { name: 'Veg', img: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300' }
            ].map(cuis => (
              <button
                key={cuis.name}
                onClick={() => navigate(`/restaurants?cuisine=${encodeURIComponent(cuis.name)}`)}
                className="group relative h-28 rounded-lg overflow-hidden shadow-sm hover:shadow border border-gray-200 transition-all active:scale-95 text-left"
              >
                <img src={cuis.img} alt={cuis.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex items-end p-2.5">
                  <span className="text-white text-sm font-bold tracking-wide">
                    {cuis.name === 'Veg' ? 'Pure Veg' : cuis.name}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

export default Home;
