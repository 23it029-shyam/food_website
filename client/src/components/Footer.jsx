import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-amazon-dark text-gray-300 text-sm mt-auto">
      {/* Back to Top */}
      <button
        onClick={scrollToTop}
        className="w-full py-3 bg-[#37475a] hover:bg-[#485769] text-white text-center font-semibold text-xs border-b border-[#232f3e] transition-colors"
      >
        Back to top
      </button>

      {/* Mid Footer Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          
          <div>
            <h3 className="text-white font-bold mb-3 text-base">Get to Know Us</h3>
            <ul className="space-y-2 text-xs">
              <li><a href="#" className="hover:underline">About ShyamEats</a></li>
              <li><a href="#" className="hover:underline">Careers</a></li>
              <li><a href="#" className="hover:underline">Press Releases</a></li>
              <li><a href="#" className="hover:underline">ShyamEats Science</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-3 text-base">Partner with Us</h3>
            <ul className="space-y-2 text-xs">
              <li><Link to="/restaurant/login" className="hover:underline text-amazon-gold font-bold">Restaurant Dashboard</Link></li>
              <li><a href="#" className="hover:underline">Join as a Rider</a></li>
              <li><a href="#" className="hover:underline">Advertise Your Menu</a></li>
              <li><a href="#" className="hover:underline">Merchant Terms</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-3 text-base">ShyamEats Prime</h3>
            <ul className="space-y-2 text-xs">
              <li><Link to="/subscription" className="hover:underline text-blue-400 font-bold">Prime Membership</Link></li>
              <li><a href="#" className="hover:underline">Free Delivery Benefits</a></li>
              <li><a href="#" className="hover:underline">Prime Promo Codes</a></li>
              <li><a href="#" className="hover:underline">Prime FAQs</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-3 text-base">Let Us Help You</h3>
            <ul className="space-y-2 text-xs">
              <li><Link to="/profile" className="hover:underline">Your Account</Link></li>
              <li><Link to="/orders" className="hover:underline">Your Orders</Link></li>
              <li><Link to="/admin/login" className="hover:underline text-red-400 font-bold">Platform Admin Console</Link></li>
              <li><a href="#" className="hover:underline">Help & Customer Support</a></li>
            </ul>
          </div>

        </div>

        {/* Brand credit details */}
        <div className="border-t border-[#232f3e] mt-10 pt-8 flex flex-col sm:flex-row items-center justify-between">
          <div className="flex flex-col items-center sm:items-start select-none">
            <span className="text-xl font-extrabold text-amazon-orange">ShyamEats</span>
            <p className="text-[10px] text-amazon-gold tracking-wider uppercase font-semibold">Hungry? ShyamEats Delivers!</p>
          </div>
          <p className="text-xs text-gray-500 mt-4 sm:mt-0">&copy; {new Date().getFullYear()} ShyamEats.com, Inc. or its affiliates. Developed with Prime services.</p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
