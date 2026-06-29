import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { ShoppingBag, ArrowLeft, Trash2, Plus, Minus, ShieldCheck, CreditCard } from 'lucide-react';
import PromoInput from '../../components/PromoInput';
import { useAuth } from '../../context/AuthContext';

const Cart = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    cartItems, subtotal, discount, promoCode, restaurantName,
    getDeliveryFee, addToCart, removeFromCart, clearCart
  } = useCart();

  const isPrime = user && user.isPrime && user.primeExpiry && new Date(user.primeExpiry) > new Date();

  // Reference delivery fee - default to 45 if no active items, otherwise from restaurant
  const deliveryCharge = getDeliveryFee(45); 
  const total = Math.max(0, subtotal - discount + deliveryCharge);

  const handleCheckoutRedirect = () => {
    if (!user) {
      navigate('/login?redirect=checkout');
    } else {
      navigate('/checkout');
    }
  };

  return (
    <div className="min-h-screen bg-amazon-bodyBg pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link to="/restaurants" className="text-amazon-orange hover:text-amazon-orangeHover font-extrabold text-sm flex items-center space-x-1.5">
            <ArrowLeft size={16} className="stroke-[3]" />
            <span>Continue Shopping</span>
          </Link>
          {cartItems.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs text-red-600 hover:text-red-800 font-bold flex items-center space-x-1"
            >
              <Trash2 size={14} />
              <span>Empty Basket</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          
          {/* Basket Items List (Spans 2 columns) */}
          <div className="md:col-span-2 space-y-4">
            
            <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm space-y-4">
              <h2 className="text-lg font-extrabold text-gray-900 border-b border-gray-100 pb-3 flex items-center space-x-2">
                <ShoppingBag className="text-amazon-orange" size={20} />
                <span>Shopping Basket</span>
              </h2>

              {cartItems.length === 0 ? (
                <div className="text-center py-12 space-y-4">
                  <p className="text-gray-500 font-semibold">Your ShyamEats basket is empty.</p>
                  <p className="text-xs text-gray-400">Fill it with fresh, hot, and tasty dishes from our top restaurants.</p>
                  <Link to="/restaurants" className="btn-amazon text-xs inline-block">
                    Explore Restaurants
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  <p className="text-xs text-amazon-orange font-bold pb-3">Ordering from: {restaurantName}</p>
                  
                  {cartItems.map((item) => (
                    <div key={item._id} className="py-4 flex justify-between items-center space-x-4">
                      {/* Item Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className={`inline-block border w-3 h-3 p-0.5 ${item.isVeg ? 'border-green-600' : 'border-red-600'}`}>
                            <span className={`block w-1.5 h-1.5 rounded-full ${item.isVeg ? 'bg-green-600' : 'bg-red-600'}`}></span>
                          </span>
                          <span className="font-bold text-sm text-gray-900 truncate">{item.name}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">₹{item.price.toFixed(2)} each</p>
                      </div>

                      {/* Quantity Selectors */}
                      <div className="flex items-center space-x-3">
                        <div className="bg-gray-100 border border-gray-300 rounded flex items-center h-8 px-1">
                          <button
                            onClick={() => removeFromCart(item._id)}
                            className="hover:bg-gray-200 text-gray-700 p-1 rounded-sm focus:outline-none"
                          >
                            <Minus size={12} className="stroke-[3]" />
                          </button>
                          <span className="text-xs font-extrabold text-gray-800 px-3.5 select-none">{item.qty}</span>
                          <button
                            onClick={() => addToCart(item, { _id: item.restaurantId, name: restaurantName })}
                            className="hover:bg-gray-200 text-gray-700 p-1 rounded-sm focus:outline-none"
                          >
                            <Plus size={12} className="stroke-[3]" />
                          </button>
                        </div>
                        <span className="font-extrabold text-sm text-gray-900 w-16 text-right">
                          ₹{(item.price * item.qty).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cart footer security info */}
            <div className="bg-blue-50 border border-blue-200 rounded p-4 flex items-start space-x-3 text-xs text-blue-700">
              <ShieldCheck size={18} className="fill-blue-500 text-white shrink-0" />
              <div>
                <p className="font-bold">Safe and Secure Ordering</p>
                <p className="mt-0.5 text-blue-600">Your details are protected using industry-grade SSL encryption. Payments processed securely via Razorpay.</p>
              </div>
            </div>
          </div>

          {/* Pricing Summary (Right 1 column) */}
          {cartItems.length > 0 && (
            <div className="space-y-6">
              
              {/* Promo input code widget */}
              <PromoInput />

              {/* Summary panel */}
              <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm space-y-4">
                <h3 className="text-gray-900 font-extrabold text-sm border-b border-gray-100 pb-3">Order Details</h3>
                
                <div className="space-y-2.5 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>Subtotal ({cartItems.reduce((sum, item) => sum + item.qty, 0)} items):</span>
                    <span className="font-bold text-gray-900">₹{subtotal.toFixed(2)}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Promo Coupon Discount:</span>
                      <span className="font-bold">-₹{discount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Delivery Estimate:</span>
                    {deliveryCharge === 0 ? (
                      <span className="text-blue-600 font-bold flex items-center">
                        FREE <ShieldCheck size={12} className="ml-0.5 fill-blue-500 text-white" />
                      </span>
                    ) : (
                      <span className="font-bold text-gray-900">₹{deliveryCharge.toFixed(2)}</span>
                    )}
                  </div>
                  
                  {isPrime && (
                    <p className="text-[10px] text-blue-500 font-bold bg-blue-50 p-1.5 rounded">
                      Prime membership applied: Saved ₹45 delivery fee on this order!
                    </p>
                  )}
                </div>

                <div className="border-t border-gray-100 pt-3 flex justify-between items-end">
                  <span className="text-sm font-bold text-gray-900">Order Total:</span>
                  <span className="text-xl font-extrabold text-amazon-orange">₹{total.toFixed(2)}</span>
                </div>

                <button
                  onClick={handleCheckoutRedirect}
                  className="btn-amazon w-full py-3 flex items-center justify-center space-x-2 text-sm"
                >
                  <CreditCard size={16} />
                  <span>Proceed to Pay</span>
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default Cart;
