import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { MapPin, Plus, CreditCard, ClipboardList, Check, X, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Checkout = () => {
  const navigate = useNavigate();
  const { user, reloadSession } = useAuth();
  const { cartItems, subtotal, discount, restaurantId, promoCode, getDeliveryFee, clearCart } = useCart();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // New Address Form State
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newStreet, setNewStreet] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newState, setNewState] = useState('');
  const [newZipCode, setNewZipCode] = useState('');
  
  // Simulated Checkout Modal State
  const [showSimulatedModal, setShowSimulatedModal] = useState(false);
  const [pendingOrderId, setPendingOrderId] = useState(null);
  const [mockOrderAmount, setMockOrderAmount] = useState(0);

  const deliveryCharge = getDeliveryFee(45);
  const totalAmount = Math.max(0, subtotal - discount + deliveryCharge);

  useEffect(() => {
    // Redirect if cart is empty
    if (cartItems.length === 0 && !pendingOrderId) {
      navigate('/cart');
      return;
    }

    const fetchAddresses = async () => {
      try {
        const response = await axios.get('/api/users/addresses');
        if (response.data.success) {
          setAddresses(response.data.data);
          // Set default address index if exists
          const defIndex = response.data.data.findIndex(addr => addr.isDefault);
          if (defIndex > -1) setSelectedAddressIndex(defIndex);
        }
      } catch (err) {
        console.error('Failed to load addresses:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAddresses();
  }, [cartItems, navigate, pendingOrderId]);

  const handleAddNewAddress = async (e) => {
    e.preventDefault();
    if (!newStreet || !newCity || !newState || !newZipCode) {
      toast.error('Please fill in all address fields');
      return;
    }

    try {
      const response = await axios.post('/api/users/addresses', {
        street: newStreet,
        city: newCity,
        state: newState,
        zipCode: newZipCode,
        isDefault: addresses.length === 0
      });

      if (response.data.success) {
        setAddresses(response.data.data);
        setSelectedAddressIndex(response.data.data.length - 1); // select the newly added address
        setShowAddressForm(false);
        setNewStreet('');
        setNewCity('');
        setNewState('');
        setNewZipCode('');
        toast.success('Address saved successfully');
        await reloadSession(); // sync to AuthContext
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save address');
    }
  };

  const handlePlaceOrder = async () => {
    if (addresses.length === 0) {
      toast.error('Please add a delivery address to place your order.');
      return;
    }

    const selectedAddress = addresses[selectedAddressIndex];
    
    setIsPlacingOrder(true);
    try {
      const response = await axios.post('/api/orders', {
        items: cartItems,
        restaurantId,
        promoCode: promoCode || '',
        address: {
          street: selectedAddress.street,
          city: selectedAddress.city,
          state: selectedAddress.state,
          zipCode: selectedAddress.zipCode
        }
      });

      if (response.data.success) {
        const { order, razorpayOrderData, razorpayKeyId } = response.data.data;
        
        // If simulated/mock transaction
        if (razorpayOrderData.isMock) {
          setPendingOrderId(order._id);
          setMockOrderAmount(order.total);
          setShowSimulatedModal(true);
          setIsPlacingOrder(false);
        } else {
          // Open real Razorpay popup
          const options = {
            key: razorpayKeyId,
            amount: razorpayOrderData.amount,
            currency: razorpayOrderData.currency,
            name: 'ShyamEats',
            description: 'Order Payment',
            order_id: razorpayOrderData.id,
            handler: async function (response) {
              try {
                const confirmRes = await axios.post('/api/orders/confirm', {
                  orderId: order._id,
                  paymentId: response.razorpay_payment_id
                });
                if (confirmRes.data.success) {
                  toast.success('Payment Received! Placing your order...');
                  clearCart();
                  navigate(`/order/track/${order._id}`);
                }
              } catch (err) {
                toast.error('Payment confirmation failed. Contact support.');
              }
            },
            prefill: {
              name: user.name,
              email: user.email,
              contact: user.phone
            },
            theme: {
              color: '#FF9900' // ShyamEats Orange
            }
          };

          const rzp = new window.Razorpay(options);
          rzp.open();
          setIsPlacingOrder(false);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order.');
      setIsPlacingOrder(false);
    }
  };

  // Simulated Webhook triggers
  const handleSimulatePayment = async (success) => {
    if (!success) {
      toast.error('Simulated transaction failed.');
      setShowSimulatedModal(false);
      return;
    }

    try {
      // Trigger developer mock confirm payment endpoint
      const response = await axios.post('/api/webhook/razorpay/mock', {
        type: 'order',
        id: pendingOrderId
      });

      if (response.data.success) {
        toast.success('✓ Simulated Payment Successful!');
        clearCart();
        navigate(`/order/track/${pendingOrderId}`);
      }
    } catch (error) {
      // fallback inline confirmation
      try {
        const response = await axios.post('/api/orders/confirm', {
          orderId: pendingOrderId
        });
        if (response.data.success) {
          toast.success('✓ Order confirmation completed!');
          clearCart();
          navigate(`/order/track/${pendingOrderId}`);
        }
      } catch (err) {
        toast.error('Failed to confirm order.');
      }
    } finally {
      setShowSimulatedModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-amazon-bodyBg pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-6">Secure Checkout</h1>

        {loading ? (
          <div className="text-center py-10">
            <p className="text-amazon-orange font-bold animate-pulse">Loading Checkout Details...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Delivery address setup (Spans 2 columns) */}
            <div className="md:col-span-2 space-y-6">
              
              {/* Address selector section */}
              <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm space-y-4">
                <h2 className="text-base font-extrabold text-gray-900 border-b border-gray-100 pb-3 flex items-center space-x-2">
                  <MapPin className="text-amazon-orange" size={18} />
                  <span>Select Delivery Address</span>
                </h2>

                {addresses.length === 0 ? (
                  <p className="text-xs text-red-500 font-semibold">No addresses saved. Please add one below.</p>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {addresses.map((addr, idx) => (
                      <div
                        key={addr._id}
                        onClick={() => setSelectedAddressIndex(idx)}
                        className={`p-3.5 rounded border text-xs cursor-pointer transition-all flex items-start justify-between ${
                          selectedAddressIndex === idx
                            ? 'border-amazon-orange bg-orange-50 bg-opacity-30'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="space-y-1">
                          <p className="font-extrabold text-gray-800 flex items-center">
                            <span>Address {idx + 1}</span>
                            {addr.isDefault && (
                              <span className="ml-2 bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-[9px] font-bold">
                                Default
                              </span>
                            )}
                          </p>
                          <p className="text-gray-600 mt-1">{addr.street}</p>
                          <p className="text-gray-500">{addr.city}, {addr.state} - {addr.zipCode}</p>
                        </div>
                        {selectedAddressIndex === idx && (
                          <div className="h-5 w-5 bg-amazon-orange rounded-full flex items-center justify-center text-amazon-dark">
                            <Check size={12} className="stroke-[3]" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Add address toggle */}
                {!showAddressForm ? (
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="text-xs font-bold text-amazon-orange hover:underline flex items-center space-x-1"
                  >
                    <Plus size={14} className="stroke-[3]" />
                    <span>Add New Address</span>
                  </button>
                ) : (
                  <form onSubmit={handleAddNewAddress} className="border border-gray-200 rounded p-4 space-y-3 bg-gray-50">
                    <h3 className="text-xs font-extrabold text-gray-800">New Delivery Location</h3>
                    
                    <div className="grid grid-cols-1 gap-2">
                      <input
                        type="text"
                        placeholder="Street Address"
                        value={newStreet}
                        onChange={(e) => setNewStreet(e.target.value)}
                        className="input-amazon text-xs"
                        required
                      />
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="text"
                          placeholder="City"
                          value={newCity}
                          onChange={(e) => setNewCity(e.target.value)}
                          className="input-amazon text-xs col-span-1"
                          required
                        />
                        <input
                          type="text"
                          placeholder="State"
                          value={newState}
                          onChange={(e) => setNewState(e.target.value)}
                          className="input-amazon text-xs col-span-1"
                          required
                        />
                        <input
                          type="text"
                          placeholder="Zip Code"
                          value={newZipCode}
                          onChange={(e) => setNewZipCode(e.target.value)}
                          className="input-amazon text-xs col-span-1"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex space-x-2 justify-end">
                      <button
                        type="button"
                        onClick={() => setShowAddressForm(false)}
                        className="px-3 py-1.5 border rounded text-xs font-semibold hover:bg-gray-100"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-3.5 py-1.5 bg-amazon-orange hover:bg-amazon-orangeHover text-amazon-dark font-extrabold rounded text-xs"
                      >
                        Save Address
                      </button>
                    </div>
                  </form>
                )}
              </div>

            </div>

            {/* Checkout Pricing Panel (1 Column Right) */}
            <div className="space-y-6">
              
              <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm space-y-4">
                <h3 className="text-gray-900 font-extrabold text-sm border-b border-gray-100 pb-3 flex items-center">
                  <ClipboardList size={16} className="mr-1.5 text-amazon-orange" /> Order Summary
                </h3>

                <div className="divide-y divide-gray-50 text-xs">
                  {cartItems.map(item => (
                    <div key={item._id} className="py-2.5 flex justify-between">
                      <span className="text-gray-600 truncate max-w-[150px]">{item.name} x {item.qty}</span>
                      <span className="font-bold text-gray-800">₹{(item.price * item.qty).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 pt-3 space-y-2 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Promo Discount:</span>
                      <span>-₹{discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Delivery Charge:</span>
                    <span>{deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm font-extrabold text-gray-900 border-t border-gray-100 pt-2.5">
                    <span>Total Bill:</span>
                    <span>₹{totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={isPlacingOrder}
                  className="btn-amazon w-full py-3 flex items-center justify-center space-x-2 text-sm"
                >
                  <CreditCard size={16} />
                  <span>{isPlacingOrder ? 'Processing...' : `Place Order & Pay`}</span>
                </button>
              </div>

            </div>

          </div>
        )}
      </div>

      {/* Simulated Razorpay Checkout Modal Overlay */}
      {showSimulatedModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl border border-gray-200 max-w-sm w-full overflow-hidden animate-fade-in-down">
            <div className="bg-amazon-dark text-white p-4 flex items-center justify-between border-b border-gray-800">
              <span className="text-base font-extrabold text-amazon-orange tracking-wide">ShyamEats Payment Terminal</span>
              <span className="text-[10px] bg-yellow-500 text-amazon-dark px-1.5 py-0.5 rounded font-extrabold uppercase">Sandbox</span>
            </div>
            
            <div className="p-6 space-y-4 text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-amazon-orange mx-auto">
                <CreditCard size={24} />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500">Order ID: {pendingOrderId}</p>
                <h4 className="text-lg font-bold text-gray-900">Total Amount: ₹{mockOrderAmount.toFixed(2)}</h4>
              </div>
              <p className="text-xs text-gray-400">
                You are in development mode. Simulate Razorpay transaction success/failure directly to complete the checkout flow.
              </p>

              <div className="flex space-x-3 pt-2">
                <button
                  onClick={() => handleSimulatePayment(false)}
                  className="w-1/2 py-2 border border-red-200 bg-red-50 text-red-700 rounded font-bold text-xs hover:bg-red-100 flex items-center justify-center space-x-1"
                >
                  <X size={14} />
                  <span>Simulate Fail</span>
                </button>
                <button
                  onClick={() => handleSimulatePayment(true)}
                  className="w-1/2 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-bold text-xs flex items-center justify-center space-x-1"
                >
                  <Check size={14} className="stroke-[3]" />
                  <span>Simulate Success</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Checkout;
