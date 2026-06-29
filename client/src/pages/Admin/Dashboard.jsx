import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Store, ClipboardList, Landmark, TrendingUp, ShieldAlert, Clock, ArrowRight } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    activeRestaurants: 0,
    ordersToday: 0,
    platformRevenue: 0
  });
  
  const [recentActivity, setRecentActivity] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const response = await axios.get('/api/admin/dashboard');
        if (response.data.success) {
          const { metrics: m, recentActivity: ra, monthlyStats: ms } = response.data.data;
          setMetrics(m);
          setRecentActivity(ra);
          setMonthlyStats(ms);
        }
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse space-y-6">
        <div className="h-10 bg-gray-200 w-1/4 rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(idx => (
            <div key={idx} className="h-28 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amazon-bodyBg pb-12">
      
      {/* Header Banner */}
      <div className="bg-amazon-dark text-white py-8 border-b border-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-xl md:text-2xl font-extrabold text-white flex items-center space-x-2">
            <span>Admin Console</span>
          </h1>
          <p className="text-xs text-gray-400">Review metrics, configurations, store approvals and promo codes.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Four metrics cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1 */}
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Users</span>
              <h3 className="text-2xl font-extrabold text-gray-900">{metrics.totalUsers}</h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
              <Users size={22} />
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Stores</span>
              <h3 className="text-2xl font-extrabold text-gray-900">{metrics.activeRestaurants}</h3>
            </div>
            <div className="p-3 bg-orange-50 text-amazon-orange rounded-full">
              <Store size={22} />
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Orders Today</span>
              <h3 className="text-2xl font-extrabold text-gray-900">{metrics.ordersToday}</h3>
            </div>
            <div className="p-3 bg-yellow-50 text-yellow-600 rounded-full">
              <ClipboardList size={22} />
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Gross Booking Sales</span>
              <h3 className="text-2xl font-extrabold text-gray-900">₹{metrics.platformRevenue.toFixed(2)}</h3>
            </div>
            <div className="p-3 bg-green-50 text-green-600 rounded-full">
              <Landmark size={22} />
            </div>
          </div>

        </div>

        {/* Sales Chart & Activities Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Recharts chart */}
          <div className="lg:col-span-2 bg-white p-5 rounded-lg border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-gray-900 font-extrabold text-sm border-b pb-2 flex items-center">
              <TrendingUp size={16} className="text-amazon-orange mr-1.5" />
              <span>Platform Sales Growth Chart</span>
            </h3>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip wrapperStyle={{ fontSize: 11 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="revenue" stroke="#FF9900" strokeWidth={3} activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="orders" stroke="#232f3e" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Orders log feed */}
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm space-y-4">
            <div className="border-b pb-2 flex justify-between items-center">
              <h3 className="text-gray-900 font-extrabold text-sm flex items-center">
                <Clock size={16} className="text-amazon-orange mr-1.5" />
                <span>Recent Platform Bookings</span>
              </h3>
              <Link to="/admin/orders" className="text-xs font-bold text-amazon-orange hover:underline flex items-center">
                <span>All Orders</span>
                <ArrowRight size={12} className="ml-0.5" />
              </Link>
            </div>

            {recentActivity.length === 0 ? (
              <p className="text-center py-16 text-gray-400 text-xs font-semibold">No orders logged today.</p>
            ) : (
              <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto pr-1">
                {recentActivity.map((act) => (
                  <div key={act._id} className="py-3 text-[11px] space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-gray-800">#{act._id.substring(18)}</span>
                      <span className="bg-orange-50 text-amazon-orange border border-orange-200 rounded px-1 text-[9px] font-bold">
                        {act.status}
                      </span>
                    </div>
                    <p className="text-gray-500 font-semibold truncate">
                      {act.user?.name} bought from {act.restaurant?.name}
                    </p>
                    <p className="text-gray-400 font-bold">Total: ₹{act.total.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};

export default Dashboard;
