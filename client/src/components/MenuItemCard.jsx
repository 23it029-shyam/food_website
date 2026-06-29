import React from 'react';
import { useCart } from '../context/CartContext';
import { Plus, Minus } from 'lucide-react';

const MenuItemCard = ({ item, restaurant }) => {
  const { cartItems, addToCart, removeFromCart } = useCart();

  // Find quantity in cart
  const cartItem = cartItems.find(i => i._id === item._id);
  const qtyInCart = cartItem ? cartItem.qty : 0;

  const fallbackImage = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400';
  const itemImage = item.image || fallbackImage;

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex space-x-4 items-center justify-between group hover:border-gray-300 transition-all duration-200">
      
      {/* Item Details */}
      <div className="flex-1 min-w-0 pr-2">
        {/* Veg/Non-veg Indicator */}
        <div className="mb-1">
          {item.isVeg ? (
            <span className="inline-flex items-center justify-center border-2 border-green-600 w-4 h-4 p-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
            </span>
          ) : (
            <span className="inline-flex items-center justify-center border-2 border-red-600 w-4 h-4 p-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
            </span>
          )}
          <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider ml-1.5">
            {item.category}
          </span>
        </div>

        <h4 className="text-base font-bold text-gray-900 truncate">
          {item.name}
        </h4>
        <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
          {item.description || 'Delicately seasoned ingredients freshly prepared for the best taste experience.'}
        </p>
        <p className="text-sm font-extrabold text-amazon-dark mt-2">
          ₹{item.price.toFixed(2)}
        </p>
      </div>

      {/* Image & Action Buttons */}
      <div className="flex flex-col items-center flex-shrink-0 relative">
        <div className="w-24 h-24 rounded bg-gray-50 border border-gray-100 overflow-hidden relative shadow-inner">
          <img
            src={itemImage}
            alt={item.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {!item.isAvailable && (
            <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center text-center">
              <span className="text-[10px] font-extrabold text-red-600 uppercase tracking-widest leading-tight">
                Sold Out
              </span>
            </div>
          )}
        </div>

        {/* Add/Remove Buttons overlayed at the bottom of image */}
        <div className="absolute -bottom-2.5">
          {qtyInCart > 0 ? (
            <div className="bg-amazon-orange text-amazon-dark rounded shadow border border-amazon-orangeHover flex items-center h-8 px-1.5 min-w-[80px] justify-between font-bold">
              <button
                onClick={() => removeFromCart(item._id)}
                className="hover:bg-amazon-orangeHover p-1 rounded-sm focus:outline-none transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus size={14} className="stroke-[3]" />
              </button>
              <span className="text-sm px-2 text-amazon-dark">{qtyInCart}</span>
              <button
                onClick={() => addToCart(item, restaurant)}
                className="hover:bg-amazon-orangeHover p-1 rounded-sm focus:outline-none transition-colors"
                disabled={!item.isAvailable}
                aria-label="Increase quantity"
              >
                <Plus size={14} className="stroke-[3]" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => addToCart(item, restaurant)}
              disabled={!item.isAvailable}
              className={`bg-white border border-gray-300 hover:border-amazon-orange text-amazon-orange font-bold text-sm h-8 px-5 rounded shadow hover:bg-orange-50 transition-all select-none active:scale-95 ${
                !item.isAvailable ? 'opacity-50 cursor-not-allowed hover:bg-white hover:border-gray-300' : ''
              }`}
            >
              ADD
            </button>
          )}
        </div>
      </div>

    </div>
  );
};

export default MenuItemCard;
