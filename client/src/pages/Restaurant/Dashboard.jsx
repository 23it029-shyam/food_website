import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSocket } from '../../context/SocketContext';
import { Store, ShoppingBag, Landmark, Clock, Check, X, ArrowRight, BellRing } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { socket } = useSocket();
  const navigate = useNavigate();

  const [restaurant, setRestaurant] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Stats
  const [stats, setStats] = useState({
    todayCount: 0,
    todayRevenue: 0,
    pendingCount: 0
  });

  const fetchDashboardData = async () => {
    try {
      // 1. Fetch restaurant owner profile
      const restResponse = await axios.get('/api/restaurants/owner/profile');
      if (restResponse.data.success) {
        const restData = restResponse.data.data;
        setRestaurant(restData);

        // 2. Fetch incoming orders
        const ordersResponse = await axios.get('/api/orders/restaurant/incoming');
        if (ordersResponse.data.success) {
          const ordersList = ordersResponse.data.data;
          setOrders(ordersList);
          
          // Calculate stats
          const pending = ordersList.filter(o => o.status === 'Placed').length;
          const paidOrders = ordersList.filter(o => o.paymentStatus === 'Paid');
          const revenue = paidOrders.reduce((sum, o) => sum + o.total, 0);

          setStats({
            todayCount: ordersList.length,
            todayRevenue: revenue,
            pendingCount: pending
          });
        }
      }
    } catch (err) {
      console.warn('Profile does not exist or fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Listen for socket events alerting new order creation
  useEffect(() => {
    if (!socket || !restaurant) return;

    socket.on('newOrderAlert', (newOrder) => {
      // If order belongs to this restaurant
      if (newOrder.restaurantId === restaurant._id) {
        toast('New Order Received!', {
          icon: '🍔',
          style: {
            borderRadius: '4px',
            background: '#131921',
            color: '#FF9900',
            fontWeight: 'bold'
          }
        });
        
        // Auto-refresh stats
        fetchDashboardData();
      }
    });

    return () => {
      socket.off('newOrderAlert');
    };
  }, [socket, restaurant]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const response = await axios.patch(`/api/orders/${orderId}/status`, {
        status: newStatus
      });
      if (response.data.success) {
        toast.success(`Order is now ${newStatus}`);
        fetchDashboardData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update order status');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse space-y-6">
        <div className="h-32 bg-gray-200 rounded w-full"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-28 bg-gray-200 rounded"></div>
          <div className="h-28 bg-gray-200 rounded"></div>
          <div className="h-28 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // If owner hasn't created a restaurant profile yet
  if (!restaurant) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-amazon-orange mx-auto">
          <Store size={32} />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-extrabold text-gray-900">Partner with ShyamEats</h2>
          <p className="text-sm text-gray-500">
            Create your restaurant business profile first. Once approved, you can customize your menu, receive live checkouts, and view analytics.
          </p>
        </div>
        <button
          onClick={() => navigate('/restaurant/profile')}
          className="btn-amazon text-sm py-2.5 px-6 shadow"
        >
          Create Store Profile
        </button>
      </div>
    );
  }

  const pendingOrders = orders.filter(o => o.status === 'Placed' || o.status === 'Confirmed' || o.status === 'Preparing');

  return (
    <div className="min-h-screen bg-amazon-bodyBg pb-12">
      
      {/* Cover Header */}
      <div className="bg-amazon-dark text-white py-8 border-b border-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
          <div className="space-y-1">
            <h1 className="text-xl md:text-2xl font-extrabold text-white flex items-center space-x-2">
              <span>{restaurant.name} Portal</span>
              <span className={`text-[10px] uppercase px-2 py-0.5 rounded font-bold border ${
                restaurant.isApproved 
                  ? 'bg-green-900/30 text-green-400 border-green-800' 
                  : 'bg-yellow-900/30 text-yellow-400 border-yellow-800'
              }`}>
                {restaurant.isApproved ? 'Approved' : 'Pending Approval'}
              </span>
            </h1>
            <p className="text-xs text-gray-400">Managing operations, live menus, and financials.</p>
          </div>
          <Link to="/restaurant/profile" className="btn-amazon-dark text-xs py-1.5 px-3">
            Store Profile Settings
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Metric Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Today's Orders</span>
              <h3 className="text-2xl font-extrabold text-gray-900">{stats.todayCount}</h3>
            </div>
            <div className="p-3 bg-orange-50 text-amazon-orange rounded-full">
              <ShoppingBag size={24} />
            </div>
          </div>
          {/* Card 2 */}
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Sales Today</span>
              <h3 className="text-2xl font-extrabold text-gray-900">₹{stats.todayRevenue.toFixed(2)}</h3>
            </div>
            <div className="p-3 bg-green-50 text-green-600 rounded-full">
              <Landmark size={24} />
            </div>
          </div>
          {/* Card 3 */}
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pending Processing</span>
              <h3 className="text-2xl font-extrabold text-gray-900">{stats.pendingCount}</h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
              <Clock size={24} />
            </div>
          </div>
        </div>

        {/* Live Orders Incoming grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Incoming orders queue (Spans 2 columns) */}
          <div className="lg:col-span-2 bg-white p-5 rounded-lg border border-gray-200 shadow-sm space-y-4">
            <div className="border-b border-gray-100 pb-3 flex justify-between items-center">
              <h2 className="text-base font-extrabold text-gray-900 flex items-center space-x-1.5">
                <BellRing size={18} className="text-amazon-orange animate-bounce" />
                <span>Live Orders Processing Queue</span>
              </h2>
              <Link to="/restaurant/orders" className="text-xs font-bold text-amazon-orange hover:underline flex items-center">
                <span>View Full List</span>
                <ArrowRight size={14} className="ml-0.5 stroke-[3]" />
              </Link>
            </div>

            {pendingOrders.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-xs font-semibold">
                ✓ No active pending orders. Excellent work!
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {pendingOrders.slice(0, 3).map((order) => (
                  <div key={order._id} className="py-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-gray-800 text-sm">Order #{order._id.substring(18)}</span>
                        <span className="bg-yellow-50 text-yellow-700 px-1.5 py-0.5 rounded font-bold border border-yellow-200 uppercase text-[9px]">
                          {order.status}
                        </span>
                      </div>
                      <p className="text-gray-500 font-semibold">Total: ₹{order.total.toFixed(2)} &bull; {order.items.length} items</p>
                      <div className="pt-1 text-gray-600 font-medium">
                        {order.items.map((i, idx) => (
                          <span key={idx}>{i.name} ({i.qty}){idx < order.items.length - 1 ? ', ' : ''}</span>
                        ))}
                      </div>
                    </div>

                    {/* Step Actions */}
                    <div className="flex space-x-2">
                      {order.status === 'Placed' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(order._id, 'Cancelled')}
                            className="px-3 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded font-bold text-xs flex items-center space-x-1"
                          >
                            <X size={14} />
                            <span>Reject</span>
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(order._id, 'Confirmed')}
                            className="px-3.5 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded font-bold text-xs flex items-center space-x-1"
                          >
                            <Check size={14} className="stroke-[3]" />
                            <span>Accept</span>
                          </button>
                        </>
                      )}
                      
                      {order.status === 'Confirmed' && (
                        <button
                          onClick={() => handleUpdateStatus(order._id, 'Preparing')}
                          className="px-4 py-1.5 bg-amazon-orange text-amazon-dark hover:bg-amazon-orangeHover rounded font-bold text-xs"
                        >
                          Start Preparing
                        </button>
                      )}

                      {order.status === 'Preparing' && (
                        <button
                          onClick={() => handleUpdateStatus(order._id, 'Out for Delivery')}
                          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold text-xs"
                        >
                          Send Out for Delivery
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions Panel (Right 1 Column) */}
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-gray-900 font-extrabold text-sm border-b border-gray-100 pb-3">Quick Navigation</h3>
            <div className="grid grid-cols-1 gap-2.5">
              <Link
                to="/restaurant/menu"
                className="p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded text-xs font-bold text-gray-800 flex justify-between items-center transition-colors"
              >
                <span>Customize Menu Items</span>
                <ArrowRight size={14} className="text-amazon-orange stroke-[3]" />
              </Link>
              <Link
                to="/restaurant/analytics"
                className="p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded text-xs font-bold text-gray-800 flex justify-between items-center transition-colors"
              >
                <span>Sales Charts & Reports</span>
                <ArrowRight size={14} className="text-amazon-orange stroke-[3]" />
              </Link>
              <Link
                to="/restaurant/orders"
                className="p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded text-xs font-bold text-gray-800 flex justify-between items-center transition-colors"
              >
                <span>All Orders Logs</span>
                <ArrowRight size={14} className="text-amazon-orange stroke-[3]" />
              </Link>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Dashboard;
