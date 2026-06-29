import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../../context/CartContext';
import { ClipboardList, Clock, CheckCircle2, ChevronRight, RefreshCw, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

const Orders = () => {
  const navigate = useNavigate();
  const { addToCart, clearCart } = useCart();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get('/api/orders');
        if (response.data.success) {
          setOrders(response.data.data);
        }
      } catch (err) {
        console.error('Failed to load orders history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Placed':
        return <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[10px] font-bold border border-gray-200">Placed</span>;
      case 'Confirmed':
        return <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold border border-blue-200">Confirmed</span>;
      case 'Preparing':
        return <span className="bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded text-[10px] font-bold border border-yellow-200">Preparing</span>;
      case 'Out for Delivery':
        return <span className="bg-orange-50 text-orange-700 px-2 py-0.5 rounded text-[10px] font-bold border border-orange-200">Out for Delivery</span>;
      case 'Delivered':
        return <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold border border-green-200">Delivered</span>;
      case 'Cancelled':
        return <span className="bg-red-50 text-red-700 px-2 py-0.5 rounded text-[10px] font-bold border border-red-200">Cancelled</span>;
      default:
        return <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[10px] font-bold">{status}</span>;
    }
  };

  const handleReorder = (order) => {
    try {
      clearCart();
      const restObj = {
        _id: order.restaurant._id,
        name: order.restaurant.name
      };

      // Add each item back to cart
      order.items.forEach(item => {
        const itemObj = {
          _id: item.menuItem,
          name: item.name,
          price: item.price,
          isVeg: true // default snapshot
        };
        // Bypass confirm checks since we clear the cart first
        addToCart(itemObj, restObj);
      });

      toast.success(`Items from '${order.restaurant.name}' loaded to cart!`);
      navigate('/cart');
    } catch (error) {
      toast.error('Could not load items for reorder.');
    }
  };

  return (
    <div className="min-h-screen bg-amazon-bodyBg pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <h1 className="text-2xl font-extrabold text-gray-900 flex items-center space-x-2">
          <ClipboardList size={24} className="text-amazon-orange" />
          <span>Your Orders</span>
        </h1>

        {loading ? (
          <div className="text-center py-10 bg-white border border-gray-200 rounded-lg">
            <p className="text-amazon-orange font-bold animate-pulse">Loading orders history...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-lg border border-gray-200 space-y-4">
            <p className="text-gray-500 font-semibold">You have not placed any orders yet.</p>
            <Link to="/restaurants" className="btn-amazon text-xs inline-block">Explore Restaurants</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col"
              >
                {/* Header panel */}
                <div className="bg-gray-50 border-b border-gray-100 p-4 flex flex-wrap justify-between items-center text-xs text-gray-500 gap-3">
                  <div>
                    <p className="font-semibold uppercase tracking-wider">Order Placed</p>
                    <p className="font-extrabold text-gray-800 mt-0.5">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="font-semibold uppercase tracking-wider">Total Paid</p>
                    <p className="font-extrabold text-gray-800 mt-0.5">₹{order.total.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="font-semibold uppercase tracking-wider">Order ID</p>
                    <p className="font-extrabold text-gray-800 mt-0.5 select-all">{order._id}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(order.status)}
                  </div>
                </div>

                {/* Body panel */}
                <div className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-2 flex-1">
                    <h3 className="text-base font-bold text-gray-900">
                      {order.restaurant?.name || 'Selected Restaurant'}
                    </h3>
                    <div className="text-xs text-gray-600 space-y-0.5">
                      {order.items.map((item, idx) => (
                        <p key={idx} className="font-medium text-gray-700">
                          {item.name} <span className="text-gray-400">x {item.qty}</span>
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex space-x-2 w-full md:w-auto">
                    {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                      <Link
                        to={`/order/track/${order._id}`}
                        className="btn-amazon py-2 px-4 text-xs font-bold flex items-center justify-center space-x-1.5 flex-1 md:flex-initial"
                      >
                        <Clock size={14} />
                        <span>Track Live</span>
                        <ChevronRight size={12} className="stroke-[3]" />
                      </Link>
                    )}
                    <button
                      onClick={() => handleReorder(order)}
                      className="btn-amazon-outline py-2 px-4 text-xs font-bold flex items-center justify-center space-x-1.5 flex-1 md:flex-initial"
                    >
                      <RefreshCw size={14} />
                      <span>Reorder</span>
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default Orders;
