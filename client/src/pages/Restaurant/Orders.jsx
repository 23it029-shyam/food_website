import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ClipboardList, Clock, Truck, Check, X, Phone, User, Landmark } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSocket } from '../../context/SocketContext';

const Orders = () => {
  const { socket } = useSocket();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('/api/orders/restaurant/incoming');
      if (response.data.success) {
        setOrders(response.data.data);
      }
    } catch (err) {
      console.error('Failed to load restaurant orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Listen for real-time orders alerts
  useEffect(() => {
    if (!socket) return;
    
    socket.on('newOrderAlert', () => {
      fetchOrders();
    });

    return () => {
      socket.off('newOrderAlert');
    };
  }, [socket]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const response = await axios.patch(`/api/orders/${orderId}/status`, {
        status: newStatus
      });
      if (response.data.success) {
        toast.success(`Order advanced to status: ${newStatus}`);
        fetchOrders();
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse space-y-6">
        <div className="h-10 bg-gray-200 w-1/4 rounded"></div>
        <div className="h-44 bg-gray-200 rounded w-full"></div>
      </div>
    );
  }

  // Filter orders by categories
  const newOrders = orders.filter(o => o.status === 'Placed');
  const activeOrders = orders.filter(o => o.status === 'Confirmed' || o.status === 'Preparing');
  const dispatchOrders = orders.filter(o => o.status === 'Out for Delivery');
  const pastOrders = orders.filter(o => o.status === 'Delivered' || o.status === 'Cancelled');

  const renderOrderList = (orderGroup, groupTitle) => {
    return (
      <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm space-y-4">
        <h2 className="text-sm font-extrabold text-gray-900 border-b border-gray-100 pb-3 flex items-center justify-between">
          <span>{groupTitle}</span>
          <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded font-extrabold text-gray-500">
            {orderGroup.length}
          </span>
        </h2>

        {orderGroup.length === 0 ? (
          <p className="text-center py-6 text-gray-400 text-[10px] font-semibold">No orders in this stage.</p>
        ) : (
          <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto pr-1">
            {orderGroup.map((order) => (
              <div key={order._id} className="py-4 space-y-3 text-xs">
                
                {/* ID & Date */}
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-gray-900">ID: #{order._id.substring(18)}</span>
                  <span className="text-gray-400 text-[10px]">
                    {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Items details */}
                <div className="bg-gray-50 p-2.5 rounded border border-gray-100 space-y-1">
                  {order.items.map((item, idx) => (
                    <p key={idx} className="font-bold text-gray-700">
                      {item.name} <span className="text-gray-400 font-semibold">x {item.qty}</span>
                    </p>
                  ))}
                  <p className="border-t border-gray-200/60 pt-1 mt-1 text-[11px] font-extrabold text-amazon-orange flex justify-between">
                    <span>Total Bill:</span>
                    <span>₹{order.total.toFixed(2)}</span>
                  </p>
                </div>

                {/* Shipping Details */}
                <div className="space-y-1 text-gray-500 font-medium">
                  <p className="flex items-center"><User size={12} className="mr-1 text-amazon-orange" /> {order.user?.name} ({order.user?.phone})</p>
                  <p className="flex items-start"><Clock size={12} className="mr-1 mt-0.5 text-amazon-orange flex-shrink-0" /> {order.address.street}, {order.address.city}</p>
                </div>

                {/* Confirm / Action button row */}
                <div className="flex space-x-2 pt-1">
                  {order.status === 'Placed' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(order._id, 'Cancelled')}
                        className="w-1/2 py-1.5 border border-red-200 bg-red-50 text-red-600 font-bold rounded hover:bg-red-100 flex items-center justify-center space-x-1"
                      >
                        <X size={12} />
                        <span>Reject</span>
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(order._id, 'Confirmed')}
                        className="w-1/2 py-1.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded flex items-center justify-center space-x-1"
                      >
                        <Check size={12} className="stroke-[3]" />
                        <span>Accept</span>
                      </button>
                    </>
                  )}

                  {order.status === 'Confirmed' && (
                    <button
                      onClick={() => handleUpdateStatus(order._id, 'Preparing')}
                      className="w-full py-1.5 bg-amazon-orange text-amazon-dark hover:bg-amazon-orangeHover rounded font-extrabold"
                    >
                      Start Cooking (Prepare)
                    </button>
                  )}

                  {order.status === 'Preparing' && (
                    <button
                      onClick={() => handleUpdateStatus(order._id, 'Out for Delivery')}
                      className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-extrabold"
                    >
                      Dispatch (Out for Delivery)
                    </button>
                  )}

                  {order.status === 'Out for Delivery' && (
                    <button
                      onClick={() => handleUpdateStatus(order._id, 'Delivered')}
                      className="w-full py-1.5 bg-green-600 hover:bg-green-700 text-white rounded font-extrabold flex items-center justify-center space-x-1"
                    >
                      <Check size={14} className="stroke-[3]" />
                      <span>Complete Delivery</span>
                    </button>
                  )}

                  {order.status === 'Delivered' && (
                    <div className="w-full py-1 bg-green-50 text-green-700 font-extrabold border border-green-200 rounded text-center uppercase tracking-wide text-[10px]">
                      Delivered Successfully
                    </div>
                  )}

                  {order.status === 'Cancelled' && (
                    <div className="w-full py-1 bg-red-50 text-red-700 font-extrabold border border-red-200 rounded text-center uppercase tracking-wide text-[10px]">
                      Rejected
                    </div>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-amazon-bodyBg pb-12">
      
      {/* Header */}
      <div className="bg-amazon-dark text-white py-8 border-b border-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-xl md:text-2xl font-extrabold text-white flex items-center space-x-2">
            <ClipboardList size={22} className="text-amazon-orange" />
            <span>Orders Dispatcher Queue</span>
          </h1>
          <p className="text-xs text-gray-400">Track and advance incoming food requests through preparation states.</p>
        </div>
      </div>

      {/* Grid columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
          {renderOrderList(newOrders, 'Placed / Pending')}
          {renderOrderList(activeOrders, 'Confirmed / Cooking')}
          {renderOrderList(dispatchOrders, 'Out for Delivery')}
          {renderOrderList(pastOrders, 'History Archive')}
        </div>
      </div>

    </div>
  );
};

export default Orders;
