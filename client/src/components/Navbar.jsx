import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Search, User, LogOut, Menu, Settings, ClipboardList, Shield, Store, BarChart3, Users, Ticket } from 'lucide-react';
import PrimeBadge from './PrimeBadge';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { cartItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.qty, 0);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/restaurants?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/restaurants');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Determine navbar theme based on portal route
  const isAdminPortal = location.pathname.startsWith('/admin');
  const isRestaurantPortal = location.pathname.startsWith('/restaurant') && !location.pathname.includes('/restaurant/');

  let portalTitle = '';
  if (isAdminPortal) portalTitle = 'Admin Console';
  else if (isRestaurantPortal) portalTitle = 'Partner Dashboard';

  return (
    <nav className="sticky top-0 z-50 bg-amazon-dark text-white shadow-md">
      {/* Top Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 space-x-4">
          
          {/* Brand Logo */}
          <div className="flex items-center flex-shrink-0">
            <Link to="/" className="flex flex-col select-none">
              <span className="text-2xl font-extrabold tracking-tight text-amazon-orange flex items-center">
                ShyamEats
                {portalTitle && (
                  <span className="ml-2 px-1.5 py-0.5 text-xs bg-amazon-orange text-amazon-dark font-bold rounded">
                    {portalTitle}
                  </span>
                )}
              </span>
              <span className="text-[10px] text-amazon-gold tracking-widest uppercase -mt-1 font-semibold">
                Delivers Fast
              </span>
            </Link>
          </div>

          {/* Search Bar - only show if not in admin/restaurant specific dashboards */}
          {!isAdminPortal && !isRestaurantPortal && (
            <form onSubmit={handleSearchSubmit} className="flex-1 max-w-lg hidden md:block">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search restaurants, cuisines, dishes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white text-gray-900 pl-4 pr-10 py-2 rounded focus:outline-none focus:ring-2 focus:ring-amazon-orange"
                />
                <button type="submit" className="absolute right-0 top-0 h-full px-3 bg-amazon-orange text-amazon-dark rounded-r hover:bg-amazon-orangeHover">
                  <Search size={18} className="stroke-[3]" />
                </button>
              </div>
            </form>
          )}

          {/* Navigation Links / Icons */}
          <div className="flex items-center space-x-4">
            {/* Customer Cart (Hidden on Admin & Restaurant Portals) */}
            {!isAdminPortal && !isRestaurantPortal && (
              <Link to="/cart" className="relative p-2 text-gray-300 hover:text-amazon-orange flex items-center transition-colors">
                <ShoppingCart size={24} />
                {totalCartCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none bg-amazon-orange text-amazon-dark rounded-full shadow transform translate-x-1 -translate-y-1">
                    {totalCartCount}
                  </span>
                )}
              </Link>
            )}

            {/* User Dropdown Profile Action */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                  className="flex items-center space-x-1.5 focus:outline-none py-1.5 px-3 rounded hover:bg-amazon-lightDark transition-colors"
                >
                  <User size={20} className="text-amazon-gold" />
                  <div className="text-left hidden sm:block">
                    <p className="text-[11px] text-gray-400 leading-none">Hello, Sign in</p>
                    <p className="text-sm font-bold leading-none mt-0.5 flex items-center space-x-1">
                      <span>{user.name.split(' ')[0]}</span>
                      {user.isPrime && <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>}
                    </p>
                  </div>
                </button>

                {/* Dropdown Card */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 text-gray-800 border border-gray-200 z-50 animate-fade-in-down">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs text-gray-500">Signed in as</p>
                      <p className="text-sm font-bold truncate flex items-center space-x-1">
                        <span>{user.name}</span>
                        {user.isPrime && <PrimeBadge showText={false} />}
                      </p>
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    </div>

                    {/* Role Dependent Options */}
                    {user.role === 'admin' ? (
                      <>
                        <Link to="/admin/dashboard" className="flex items-center px-4 py-2 text-sm hover:bg-gray-100"><BarChart3 size={16} className="mr-2 text-amazon-orange" /> Dashboard</Link>
                        <Link to="/admin/users" className="flex items-center px-4 py-2 text-sm hover:bg-gray-100"><Users size={16} className="mr-2 text-amazon-orange" /> Manage Users</Link>
                        <Link to="/admin/restaurants" className="flex items-center px-4 py-2 text-sm hover:bg-gray-100"><Store size={16} className="mr-2 text-amazon-orange" /> Approve Restaurants</Link>
                        <Link to="/admin/orders" className="flex items-center px-4 py-2 text-sm hover:bg-gray-100"><ClipboardList size={16} className="mr-2 text-amazon-orange" /> Platform Orders</Link>
                        <Link to="/admin/promo-codes" className="flex items-center px-4 py-2 text-sm hover:bg-gray-100"><Ticket size={16} className="mr-2 text-amazon-orange" /> Promo Codes</Link>
                        <Link to="/admin/subscriptions" className="flex items-center px-4 py-2 text-sm hover:bg-gray-100"><Shield size={16} className="mr-2 text-amazon-orange" /> Prime Members</Link>
                        <Link to="/admin/settings" className="flex items-center px-4 py-2 text-sm hover:bg-gray-100"><Settings size={16} className="mr-2 text-amazon-orange" /> Commission & Fees</Link>
                      </>
                    ) : user.role === 'restaurant' ? (
                      <>
                        <Link to="/restaurant/dashboard" className="flex items-center px-4 py-2 text-sm hover:bg-gray-100"><BarChart3 size={16} className="mr-2 text-amazon-orange" /> Dashboard</Link>
                        <Link to="/restaurant/menu" className="flex items-center px-4 py-2 text-sm hover:bg-gray-100"><Menu size={16} className="mr-2 text-amazon-orange" /> Menu Manager</Link>
                        <Link to="/restaurant/orders" className="flex items-center px-4 py-2 text-sm hover:bg-gray-100"><ClipboardList size={16} className="mr-2 text-amazon-orange" /> Active Orders</Link>
                        <Link to="/restaurant/analytics" className="flex items-center px-4 py-2 text-sm hover:bg-gray-100"><BarChart3 size={16} className="mr-2 text-amazon-orange" /> Sales Analytics</Link>
                        <Link to="/restaurant/profile" className="flex items-center px-4 py-2 text-sm hover:bg-gray-100"><Store size={16} className="mr-2 text-amazon-orange" /> Store Profile</Link>
                      </>
                    ) : (
                      <>
                        <Link to="/orders" className="flex items-center px-4 py-2 text-sm hover:bg-gray-100"><ClipboardList size={16} className="mr-2 text-amazon-orange" /> My Orders</Link>
                        <Link to="/profile" className="flex items-center px-4 py-2 text-sm hover:bg-gray-100"><User size={16} className="mr-2 text-amazon-orange" /> Profile Settings</Link>
                        <Link to="/subscription" className="flex items-center px-4 py-2 text-sm hover:bg-gray-100"><Shield size={16} className="mr-2 text-amazon-orange" /> ShyamEats Prime</Link>
                      </>
                    )}

                    <hr className="my-1 border-gray-100" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-4 py-2 text-sm hover:bg-red-50 text-red-600 text-left font-semibold"
                    >
                      <LogOut size={16} className="mr-2" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login" className="px-3 py-1.5 text-sm font-semibold border border-transparent rounded hover:border-white transition-all text-gray-200 hover:text-white">
                  Sign In
                </Link>
                <Link to="/register" className="bg-amazon-orange text-amazon-dark px-3 py-1.5 text-sm font-bold rounded hover:bg-amazon-orangeHover transition-colors">
                  Join
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
