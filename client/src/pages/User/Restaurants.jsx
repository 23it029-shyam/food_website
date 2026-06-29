import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Filter, SortAsc, Star, Clock, AlertCircle } from 'lucide-react';
import CuisineCategoryBar from '../../components/CuisineCategoryBar';
import RestaurantCard from '../../components/RestaurantCard';

const Restaurants = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Local filter states
  const [selectedRating, setSelectedRating] = useState(searchParams.get('rating') || '');
  const [selectedSort, setSelectedSort] = useState(searchParams.get('sort') || 'rating');
  const [maxDeliveryFee, setMaxDeliveryFee] = useState(searchParams.get('maxDeliveryFee') || '');

  const cuisineQuery = searchParams.get('cuisine') || '';
  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    const fetchFilteredRestaurants = async () => {
      setLoading(true);
      setError('');
      try {
        const params = {};
        if (searchQuery) params.search = searchQuery;
        if (cuisineQuery) params.cuisine = cuisineQuery;
        if (selectedRating) params.rating = selectedRating;
        if (selectedSort) params.sort = selectedSort;
        if (maxDeliveryFee) params.maxDeliveryFee = maxDeliveryFee;

        const response = await axios.get('/api/restaurants', { params });
        if (response.data.success) {
          setRestaurants(response.data.data);
        }
      } catch (err) {
        setError('Failed to fetch restaurants. Please try again.');
        console.error('Filter request error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredRestaurants();
  }, [searchQuery, cuisineQuery, selectedRating, selectedSort, maxDeliveryFee]);

  const handleRatingFilter = (ratingVal) => {
    const newRating = selectedRating === ratingVal ? '' : ratingVal;
    setSelectedRating(newRating);
    
    // Sync to URL
    const nextParams = new URLSearchParams(searchParams);
    if (newRating) nextParams.set('rating', newRating);
    else nextParams.delete('rating');
    setSearchParams(nextParams);
  };

  const handleSortChange = (sortVal) => {
    setSelectedSort(sortVal);
    
    // Sync to URL
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('sort', sortVal);
    setSearchParams(nextParams);
  };

  const handleDeliveryFeeChange = (feeVal) => {
    const newFee = maxDeliveryFee === feeVal ? '' : feeVal;
    setMaxDeliveryFee(newFee);

    // Sync to URL
    const nextParams = new URLSearchParams(searchParams);
    if (newFee) nextParams.set('maxDeliveryFee', newFee);
    else nextParams.delete('maxDeliveryFee');
    setSearchParams(nextParams);
  };

  const handleClearFilters = () => {
    setSelectedRating('');
    setMaxDeliveryFee('');
    setSelectedSort('rating');
    setSearchParams({});
  };

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* Scrollable Cuisine Category Chips */}
      <CuisineCategoryBar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1">
        
        {/* Title / Search indicators */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">
              {searchQuery ? `Search Results for "${searchQuery}"` : cuisineQuery ? `${cuisineQuery} Restaurants` : 'All Restaurants'}
            </h1>
            <p className="text-xs text-gray-500">{restaurants.length} stores available</p>
          </div>

          {/* Sort selection dropdown */}
          <div className="flex items-center space-x-2">
            <SortAsc size={16} className="text-gray-500" />
            <span className="text-xs text-gray-500 font-semibold uppercase">Sort by:</span>
            <select
              value={selectedSort}
              onChange={(e) => handleSortChange(e.target.value)}
              className="bg-white border border-gray-300 rounded px-2.5 py-1 text-xs font-bold text-gray-800 focus:outline-none focus:border-amazon-orange"
            >
              <option value="rating">Highest Customer Rating</option>
              <option value="cost">Minimum Order (Low to High)</option>
              <option value="delivery">Delivery Fee (Low to High)</option>
              <option value="relevance">New Arrivals</option>
            </select>
          </div>
        </div>

        {/* Filter Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* Filters Sidebar (Left) */}
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <span className="font-extrabold text-sm uppercase text-gray-800 flex items-center">
                <Filter size={14} className="mr-1.5 text-amazon-orange" /> Filters
              </span>
              {(selectedRating || maxDeliveryFee || selectedSort !== 'rating') && (
                <button
                  onClick={handleClearFilters}
                  className="text-xs text-amazon-orange hover:underline font-bold"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Rating Filter section */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold uppercase text-gray-600 tracking-wider">Customer Rating</h3>
              <div className="flex flex-col space-y-2 text-sm text-gray-700">
                {[4.5, 4.0, 3.5].map((val) => {
                  const isChecked = parseFloat(selectedRating) === val;
                  return (
                    <label key={val} className="flex items-center space-x-2.5 cursor-pointer hover:text-amazon-orange transition-colors">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleRatingFilter(val.toString())}
                        className="rounded text-amazon-orange focus:ring-amazon-orange border-gray-300 h-4 w-4"
                      />
                      <span className="flex items-center space-x-1">
                        <span className="font-semibold">{val.toFixed(1)} & Up</span>
                        <Star size={12} className="fill-amazon-orange text-amazon-orange inline-block" />
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Delivery Fee Filter section */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold uppercase text-gray-600 tracking-wider">Max Delivery Fee</h3>
              <div className="flex flex-col space-y-2 text-sm text-gray-700">
                {['25', '40', '50'].map((fee) => {
                  const isChecked = maxDeliveryFee === fee;
                  return (
                    <label key={fee} className="flex items-center space-x-2.5 cursor-pointer hover:text-amazon-orange transition-colors">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleDeliveryFeeChange(fee)}
                        className="rounded text-amazon-orange focus:ring-amazon-orange border-gray-300 h-4 w-4"
                      />
                      <span className="font-semibold">Under ₹{fee}</span>
                    </label>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Restaurant Results Grid (Right) */}
          <div className="lg:col-span-3">
            {loading ? (
              /* Skeletons loader */
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(idx => (
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
            ) : error ? (
              <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg border border-gray-200 text-center space-y-2">
                <AlertCircle size={32} className="text-red-500 animate-bounce" />
                <p className="font-bold text-gray-800">{error}</p>
              </div>
            ) : restaurants.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg border border-gray-200 text-center space-y-4">
                <AlertCircle size={40} className="text-amazon-orange" />
                <div className="space-y-1">
                  <p className="font-extrabold text-lg text-gray-900">No restaurants match your search</p>
                  <p className="text-sm text-gray-500">Try relaxing your filters or typing another query.</p>
                </div>
                <button onClick={handleClearFilters} className="btn-amazon text-xs">
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {restaurants.map(rest => (
                  <RestaurantCard key={rest._id} restaurant={rest} />
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};

export default Restaurants;
