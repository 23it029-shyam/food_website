import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../../context/CartContext';
import { Star, Clock, ShieldCheck, ShoppingBag, ArrowRight } from 'lucide-react';
import MenuItemCard from '../../components/MenuItemCard';
import { useAuth } from '../../context/AuthContext';

const RestaurantDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { cartItems, subtotal, getDeliveryFee, removeFromCart, addToCart } = useCart();

  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const isPrime = user && user.isPrime && user.primeExpiry && new Date(user.primeExpiry) > new Date();

  useEffect(() => {
    const fetchDetailsAndMenu = async () => {
      setLoading(true);
      try {
        const [restRes, menuRes] = await Promise.all([
          axios.get(`/api/restaurants/${id}`),
          axios.get(`/api/menu/restaurant/${id}`)
        ]);

        if (restRes.data.success) setRestaurant(restRes.data.data);
        if (menuRes.data.success) setMenuItems(menuRes.data.data);
      } catch (err) {
        console.error('Failed to load menu details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetailsAndMenu();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse space-y-6">
        <div className="bg-gray-200 h-44 rounded-lg w-full"></div>
        <div className="flex space-x-4">
          <div className="w-1/4 h-12 bg-gray-200 rounded"></div>
          <div className="w-1/4 h-12 bg-gray-200 rounded"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(idx => (
            <div key={idx} className="bg-gray-200 h-24 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-gray-800">Restaurant not found</h2>
        <Link to="/restaurants" className="btn-amazon text-sm inline-block">Back to restaurants</Link>
      </div>
    );
  }

  // Extract unique categories
  const categories = ['All', ...new Set(menuItems.map(item => item.category))];

  // Filter items by category
  const filteredItems = selectedCategory === 'All'
    ? menuItems
    : menuItems.filter(item => item.category === selectedCategory);

  // Delivery Fee calculation
  const deliveryCharge = getDeliveryFee(restaurant.deliveryFee);

  return (
    <div className="min-h-screen bg-amazon-bodyBg pb-10">
      
      {/* Restaurant Cover Header */}
      <div className="bg-amazon-dark text-white py-10 border-b border-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center space-x-3">
              <span>{restaurant.name}</span>
              {isPrime && (
                <span className="text-[10px] md:text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-extrabold border border-blue-300 inline-flex items-center space-x-0.5">
                  <ShieldCheck size={12} className="fill-blue-500 text-white" />
                  <span>Prime Delivery</span>
                </span>
              )}
            </h1>
            <p className="text-sm text-gray-400 max-w-2xl">{restaurant.description}</p>
            <p className="text-xs text-amazon-gold font-semibold">
              Cuisines: {restaurant.cuisines?.join(', ')}
            </p>
            <p className="text-xs text-gray-400">
              Address: {restaurant.address.street}, {restaurant.address.city}
            </p>
          </div>

          {/* Stats Badges */}
          <div className="flex items-center space-x-6">
            <div className="bg-amazon-lightDark p-3 rounded text-center border border-gray-700">
              <span className="flex items-center justify-center space-x-1 text-sm font-bold text-amazon-orange">
                <Star size={16} className="fill-amazon-orange text-amazon-orange" />
                <span>{restaurant.rating.toFixed(1)}</span>
              </span>
              <p className="text-[10px] text-gray-400 mt-1 uppercase font-semibold">Rating</p>
            </div>

            <div className="bg-amazon-lightDark p-3 rounded text-center border border-gray-700">
              <span className="flex items-center justify-center space-x-1 text-sm font-bold text-amazon-orange">
                <Clock size={16} />
                <span>25-35</span>
              </span>
              <p className="text-[10px] text-gray-400 mt-1 uppercase font-semibold">Mins</p>
            </div>

            <div className="bg-amazon-lightDark p-3 rounded text-center border border-gray-700">
              <span className="text-sm font-bold text-amazon-orange">
                ₹{deliveryCharge === 0 ? 'FREE' : deliveryCharge}
              </span>
              <p className="text-[10px] text-gray-400 mt-1 uppercase font-semibold">Delivery</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Menu Items Area (Left Column - Spans 2) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Category Tabs */}
            <div className="bg-white p-2.5 rounded-lg border border-gray-200 shadow-sm flex items-center space-x-2 overflow-x-auto no-scrollbar">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-xs sm:text-sm font-bold px-4 py-1.5 rounded transition-all duration-150 active:scale-95 ${
                    selectedCategory === cat
                      ? 'bg-amazon-orange text-amazon-dark'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Menu List */}
            {filteredItems.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-lg border border-gray-200 text-gray-500 font-semibold">
                No items available in this category.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredItems.map(item => (
                  <MenuItemCard
                    key={item._id}
                    item={item}
                    restaurant={restaurant}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Desktop Right Side Sticky Mini-Cart (Right Column) */}
          <div className="hidden lg:block sticky top-24 space-y-6">
            <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm space-y-4">
              <h3 className="text-gray-900 font-extrabold text-base border-b border-gray-200 pb-3 flex items-center space-x-2">
                <ShoppingBag size={18} className="text-amazon-orange" />
                <span>Your Basket</span>
                {cartItems.length > 0 && (
                  <span className="text-xs bg-amazon-orange text-amazon-dark px-1.5 py-0.5 rounded font-bold">
                    {cartItems.length}
                  </span>
                )}
              </h3>

              {cartItems.length === 0 ? (
                <div className="text-center py-8 text-gray-400 space-y-2">
                  <p className="text-xs font-semibold">Your basket is empty</p>
                  <p className="text-[10px] text-gray-400">Add delicious meals from the menu to satisfy your cravings.</p>
                </div>
              ) : (
                <>
                  <p className="text-xs text-gray-500 font-semibold mb-2">Ordering from {restaurant.name}</p>
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                    {cartItems.map((cartItem) => (
                      <div key={cartItem._id} className="flex justify-between items-center text-xs">
                        <div className="flex-1 pr-2 truncate">
                          <p className="font-bold text-gray-800">{cartItem.name}</p>
                          <p className="text-gray-400">₹{cartItem.price} x {cartItem.qty}</p>
                        </div>
                        <div className="flex items-center space-x-2 border rounded border-gray-300 px-1 bg-gray-50">
                          <button
                            onClick={() => removeFromCart(cartItem._id)}
                            className="text-gray-600 hover:text-red-500 p-0.5"
                          >
                            <MinusIcon />
                          </button>
                          <span className="font-bold text-gray-800 px-1">{cartItem.qty}</span>
                          <button
                            onClick={() => addToCart(cartItem, restaurant)}
                            className="text-gray-600 hover:text-green-600 p-0.5"
                          >
                            <PlusIcon />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-100 pt-3 space-y-1.5">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Subtotal:</span>
                      <span className="font-bold">₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Estimated Delivery:</span>
                      <span className="font-bold">{deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}</span>
                    </div>
                    <div className="flex justify-between text-sm font-extrabold text-gray-900 border-t border-gray-100 pt-2">
                      <span>Basket Total:</span>
                      <span>₹{(subtotal + deliveryCharge).toFixed(2)}</span>
                    </div>
                  </div>

                  <Link
                    to="/cart"
                    className="btn-amazon w-full text-xs font-bold py-2.5 flex items-center justify-center space-x-1"
                  >
                    <span>View Full Basket</span>
                    <ArrowRight size={14} className="stroke-[3]" />
                  </Link>
                </>
              )}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

// Mini SVG Icons helper
const MinusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="stroke-[3] w-3 h-3">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
  </svg>
);

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="stroke-[3] w-3 h-3">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

export default RestaurantDetail;
