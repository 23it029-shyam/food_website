import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useSocket } from '../../context/SocketContext';
import { ArrowLeft, Clock, MapPin, Store, CheckCircle, Smartphone, User } from 'lucide-react';
import OrderStatusBar from '../../components/OrderStatusBar';
import toast from 'react-hot-toast';

const Track = () => {
  const { id } = useParams();
  const { socket, requestNotificationPermission, sendPushNotification } = useSocket();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusUpdates, setStatusUpdates] = useState([]);

  useEffect(() => {
    // Request permission for push notifications
    requestNotificationPermission();

    const fetchOrderDetails = async () => {
      try {
        const response = await axios.get(`/api/orders/${id}`);
        if (response.data.success) {
          setOrder(response.data.data);
          // Seed initial status history log
          setStatusUpdates([{
            status: response.data.data.status,
            timestamp: response.data.data.updatedAt || new Date(),
            message: getStatusDescription(response.data.data.status)
          }]);
        }
      } catch (err) {
        console.error('Failed to load order track details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id]);

  useEffect(() => {
    if (!socket || !id || !order) return;

    // Join tracking room
    socket.emit('joinOrder', id);
    console.log(`Websocket: Subscribed to order status updates for ID ${id}`);

    // Listen for live broadcasts
    socket.on('orderUpdate', (data) => {
      console.log('Websocket update received:', data);
      
      // Update local state
      setOrder(prev => ({
        ...prev,
        status: data.status
      }));

      // Append logs
      setStatusUpdates(prev => [
        {
          status: data.status,
          timestamp: data.timestamp,
          message: data.message
        },
        ...prev
      ]);

      // Fire desktop banner notification
      sendPushNotification(
        `ShyamEats: Order Status Update`,
        `Your order status is now: ${data.status}. ${data.message}`
      );

      // Hot toast trigger
      toast(`Status Update: ${data.status} - ${data.message}`, {
        icon: '🔔',
        style: {
          borderRadius: '4px',
          background: '#131921',
          color: '#FEBD69',
        }
      });
    });

    // Cleanup room subscription
    return () => {
      socket.emit('leaveOrder', id);
      socket.off('orderUpdate');
      console.log(`Websocket: Left tracking room for order ID ${id}`);
    };
  }, [socket, id, order]);

  const getStatusDescription = (status) => {
    switch (status) {
      case 'Placed': return 'ShyamEats received your order!';
      case 'Confirmed': return 'Restaurant confirmed your order';
      case 'Preparing': return 'Chef is preparing your food';
      case 'Out for Delivery': return 'Your rider is on the way!';
      case 'Delivered': return 'Enjoy your meal! Rate your experience';
      default: return 'Status updated.';
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse space-y-6">
        <div className="bg-gray-200 h-10 w-1/4 rounded"></div>
        <div className="bg-gray-200 h-44 rounded-lg w-full"></div>
        <div className="bg-gray-200 h-64 rounded-lg w-full"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-gray-800">Order tracking page not found</h2>
        <Link to="/orders" className="btn-amazon text-sm inline-block">Back to orders</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amazon-bodyBg pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Header Back Button */}
        <div>
          <Link to="/orders" className="text-amazon-orange hover:text-amazon-orangeHover font-extrabold text-sm flex items-center space-x-1.5">
            <ArrowLeft size={16} className="stroke-[3]" />
            <span>Back to Orders</span>
          </Link>
        </div>

        {/* Live Stepper Tracker Component */}
        <OrderStatusBar currentStatus={order.status} />

        {/* Details Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Left panel: Info logs & Address (Spans 2 columns) */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Delivery address & Restaurant card */}
            <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm space-y-4">
              <h3 className="text-gray-900 font-extrabold text-sm border-b border-gray-100 pb-3 flex items-center">
                <MapPin size={16} className="mr-1.5 text-amazon-orange" /> Shipping Details
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                
                {/* Store origin */}
                <div className="space-y-1.5 bg-gray-50 p-3 rounded border border-gray-100">
                  <p className="font-extrabold text-gray-800 flex items-center">
                    <Store size={14} className="mr-1 text-amazon-orange" />
                    <span>{order.restaurant?.name || 'Selected Restaurant'}</span>
                  </p>
                  <p className="text-gray-600 font-medium">Phone: {order.restaurant?.phone || '+91 999999999'}</p>
                  <p className="text-gray-500">{order.restaurant?.address?.street}, {order.restaurant?.address?.city}</p>
                </div>

                {/* Delivery destination */}
                <div className="space-y-1.5 bg-gray-50 p-3 rounded border border-gray-100">
                  <p className="font-extrabold text-gray-800 flex items-center">
                    <User size={14} className="mr-1 text-amazon-orange" />
                    <span>Customer Address</span>
                  </p>
                  <p className="text-gray-600 font-medium">Deliver to: {order.user?.name}</p>
                  <p className="text-gray-500">{order.address?.street}, {order.address?.city}</p>
                </div>

              </div>
            </div>

            {/* Tracking logs feed */}
            <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm space-y-4">
              <h3 className="text-gray-900 font-extrabold text-sm border-b border-gray-100 pb-3">Status Log Feed</h3>
              
              <div className="flow-root">
                <ul className="-mb-8">
                  {statusUpdates.map((update, updateIdx) => (
                    <li key={updateIdx}>
                      <div className="relative pb-8">
                        {updateIdx !== statusUpdates.length - 1 ? (
                          <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                        ) : null}
                        
                        <div className="relative flex space-x-3 items-start">
                          <div>
                            <span className="h-8 w-8 rounded-full bg-amazon-dark flex items-center justify-center text-amazon-orange">
                              <CheckCircle size={16} />
                            </span>
                          </div>
                          
                          <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-xs font-bold text-gray-800">{update.status}</p>
                              <p className="text-[11px] text-gray-400 mt-0.5">{update.message}</p>
                            </div>
                            <div className="text-right text-[10px] whitespace-nowrap text-gray-400">
                              <time dateTime={update.timestamp}>
                                {new Date(update.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </time>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>

          {/* Right panel: Receipt details (1 Column) */}
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm space-y-4 h-fit">
            <h3 className="text-gray-900 font-extrabold text-sm border-b border-gray-100 pb-3">Receipt Summary</h3>
            
            <div className="divide-y divide-gray-50 text-xs">
              {order.items.map((item, idx) => (
                <div key={idx} className="py-2 flex justify-between">
                  <span className="text-gray-600 truncate max-w-[130px]">{item.name} x {item.qty}</span>
                  <span className="font-bold text-gray-800">₹{(item.price * item.qty).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-3 space-y-1.5 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{(order.total - order.deliveryFee + order.discount).toFixed(2)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Promo Saved:</span>
                  <span>-₹{order.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery:</span>
                <span>₹{order.deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-gray-900 border-t border-gray-100 pt-2">
                <span>Total Paid:</span>
                <span className="text-amazon-orange">₹{order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Track;
