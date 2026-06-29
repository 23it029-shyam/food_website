import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { BarChart3, TrendingUp, DollarSign, ListOrdered, Wallet, Award } from 'lucide-react';

const Analytics = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Aggregated Metric Cards
  const [metrics, setMetrics] = useState({
    totalSales: 0,
    totalCount: 0,
    avgValue: 0
  });

  const [topItems, setTopItems] = useState([]);
  const [salesHistoryData, setSalesHistoryData] = useState([]);
  const [hourlyStats, setHourlyStats] = useState([]);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const response = await axios.get('/api/orders/restaurant/incoming');
        if (response.data.success) {
          const list = response.data.data;
          setOrders(list);

          // 1. Calculate General metrics
          const paidOrders = list.filter(o => o.paymentStatus === 'Paid');
          const salesTotal = paidOrders.reduce((sum, o) => sum + o.total, 0);
          const count = list.length;
          const avgVal = count > 0 ? (salesTotal / count) : 0;

          setMetrics({
            totalSales: salesTotal,
            totalCount: count,
            avgValue: avgVal
          });

          // 2. Top 5 Items aggregation
          const itemCounts = {};
          list.forEach(order => {
            order.items.forEach(item => {
              if (itemCounts[item.name]) {
                itemCounts[item.name] += item.qty;
              } else {
                itemCounts[item.name] = item.qty;
              }
            });
          });

          const sortedItems = Object.keys(itemCounts)
            .map(name => ({ name, count: itemCounts[name] }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

          setTopItems(sortedItems);

          // 3. Mock/Compute Monthly sales history
          const monthlyAggregation = [
            { name: 'Jan', Sales: 12000, Orders: 40 },
            { name: 'Feb', Sales: 18000, Orders: 55 },
            { name: 'Mar', Sales: 22000, Orders: 70 },
            { name: 'Apr', Sales: 29000, Orders: 95 },
            { name: 'May', Sales: 38000, Orders: 120 },
            { name: 'Jun', Sales: salesTotal > 0 ? salesTotal : 5000, Orders: count > 0 ? count : 15 }
          ];
          setSalesHistoryData(monthlyAggregation);

          // 4. Compute hourly sales heatmap (mock peak hour stats)
          const peakHourStats = [
            { hour: '12 PM', orders: 12 },
            { hour: '2 PM', orders: 8 },
            { hour: '4 PM', orders: 4 },
            { hour: '6 PM', orders: 15 },
            { hour: '8 PM', orders: 25 },
            { hour: '10 PM', orders: 18 }
          ];
          setHourlyStats(peakHourStats);
        }
      } catch (err) {
        console.error('Failed to load sales analytics details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse space-y-6">
        <div className="h-10 bg-gray-200 w-1/4 rounded"></div>
        <div className="grid grid-cols-3 gap-6">
          <div className="h-28 bg-gray-200 rounded"></div>
          <div className="h-28 bg-gray-200 rounded"></div>
          <div className="h-28 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amazon-bodyBg pb-12">
      
      {/* Header */}
      <div className="bg-amazon-dark text-white py-8 border-b border-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-xl md:text-2xl font-extrabold text-white flex items-center space-x-2">
            <BarChart3 size={22} className="text-amazon-orange" />
            <span>Store Performance Analytics</span>
          </h1>
          <p className="text-xs text-gray-400">Review metrics, order size distributions, top foods, and peak hours.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Metric Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Gross Platform Sales</span>
              <h3 className="text-2xl font-extrabold text-gray-900">₹{metrics.totalSales.toFixed(2)}</h3>
            </div>
            <div className="p-3 bg-green-50 text-green-600 rounded-full">
              <DollarSign size={24} />
            </div>
          </div>

          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Gross Orders Count</span>
              <h3 className="text-2xl font-extrabold text-gray-900">{metrics.totalCount}</h3>
            </div>
            <div className="p-3 bg-orange-50 text-amazon-orange rounded-full">
              <ListOrdered size={24} />
            </div>
          </div>

          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Avg Order Value (AOV)</span>
              <h3 className="text-2xl font-extrabold text-gray-900">₹{metrics.avgValue.toFixed(2)}</h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
              <Wallet size={24} />
            </div>
          </div>
        </div>

        {/* Charts Grids */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Revenue Chart (Spans 2 Columns) */}
          <div className="lg:col-span-2 bg-white p-5 rounded-lg border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-gray-900 font-extrabold text-sm border-b pb-2 flex items-center space-x-1">
              <TrendingUp size={16} className="text-amazon-orange" />
              <span>Sales & Bookings Trend</span>
            </h3>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={salesHistoryData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip wrapperStyle={{ fontSize: 11 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="Sales" stroke="#FF9900" strokeWidth={3} activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="Orders" stroke="#FEBD69" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Selling Items (1 Column) */}
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-gray-900 font-extrabold text-sm border-b pb-2 flex items-center space-x-1.5">
              <Award size={16} className="text-amazon-orange" />
              <span>Top 5 Selling Items</span>
            </h3>

            {topItems.length === 0 ? (
              <p className="text-center py-16 text-gray-400 text-xs font-semibold">No items sold yet.</p>
            ) : (
              <div className="space-y-4">
                {topItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs">
                    <div className="space-y-0.5">
                      <span className="font-extrabold text-gray-800">{idx + 1}. {item.name}</span>
                      <p className="text-[10px] text-gray-400">Total units dispatched</p>
                    </div>
                    <span className="bg-amazon-orange text-amazon-dark font-extrabold px-2.5 py-1 rounded">
                      {item.count} Sold
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Peak Hours Heatmap Chart */}
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm space-y-4">
          <h3 className="text-gray-900 font-extrabold text-sm border-b pb-2">Peak Ordering Hours (Orders Today)</h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={hourlyStats}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="orders" fill="#131921" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Analytics;
