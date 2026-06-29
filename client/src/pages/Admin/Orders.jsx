import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ClipboardList, Download, Search, RefreshCw, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;

      const response = await axios.get('/api/admin/orders', { params });
      if (response.data.success) {
        setOrders(response.data.data);
      }
    } catch (err) {
      console.error('Failed to load platform orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleExportCSV = () => {
    if (orders.length === 0) {
      toast.error('No orders available to export.');
      return;
    }

    try {
      const headers = ['Order ID', 'Date', 'Customer Name', 'Customer Email', 'Restaurant', 'Items Summary', 'Grand Total (₹)', 'Payment Status', 'Delivery Status'];
      
      const rows = orders.map(o => [
        o._id,
        new Date(o.createdAt).toLocaleString(),
        o.user?.name || 'N/A',
        o.user?.email || 'N/A',
        o.restaurant?.name || 'N/A',
        o.items.map(item => `${item.name} (${item.qty})`).join('; '),
        o.total,
        o.paymentStatus,
        o.status
      ]);

      const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(','), ...rows.map(e => e.map(val => `"${val.toString().replace(/"/g, '""')}"`).join(','))].join('\n');
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `shyameats_platform_orders_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Orders report downloaded successfully');
    } catch (error) {
      toast.error('Failed to compile CSV export');
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Placed': return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'Confirmed': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Preparing': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'Out for Delivery': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Delivered': return 'bg-green-50 text-green-700 border-green-200';
      case 'Cancelled': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const filteredOrders = orders.filter(o => 
    o._id.toLowerCase().includes(search.toLowerCase()) ||
    o.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    o.restaurant?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-amazon-bodyBg pb-12">
      
      {/* Header */}
      <div className="bg-amazon-dark text-white py-8 border-b border-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-white flex items-center space-x-2">
              <ClipboardList size={22} className="text-amazon-orange" />
              <span>Platform Orders Journal</span>
            </h1>
            <p className="text-xs text-gray-400">Audit sales tickets, inspect delivery statuses, and export database files.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Box */}
            <input
              type="text"
              placeholder="Search ID, client, or store..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white text-gray-800 text-xs px-3.5 py-2 rounded focus:outline-none border border-gray-300 w-52"
            />

            {/* Filter select */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-gray-300 text-gray-700 text-xs rounded px-3 py-2 focus:outline-none font-bold"
            >
              <option value="">All Statuses</option>
              <option value="Placed">Placed</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Preparing">Preparing</option>
              <option value="Out for Delivery">Out for Delivery</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            <button
              onClick={handleExportCSV}
              className="btn-amazon text-xs py-2 px-4 flex items-center space-x-1.5 font-bold shadow"
            >
              <Download size={14} className="stroke-[3]" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {loading ? (
          <div className="text-center py-10 bg-white border rounded">
            <p className="text-amazon-orange font-bold animate-pulse">Loading orders journal...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white p-12 text-center border rounded-lg flex flex-col items-center justify-center space-y-2">
            <AlertCircle size={32} className="text-gray-400" />
            <p className="text-gray-500 font-semibold">No transactions recorded matching the parameters.</p>
          </div>
        ) : (
          /* Table list */
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-x-auto">
            <table className="min-w-full text-xs text-left text-gray-700">
              <thead className="bg-gray-50 uppercase text-[10px] tracking-wider text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 font-bold">Order ID</th>
                  <th className="px-6 py-3 font-bold">Timestamp</th>
                  <th className="px-6 py-3 font-bold">Customer Details</th>
                  <th className="px-6 py-3 font-bold">Restaurant</th>
                  <th className="px-6 py-3 font-bold">Bill Total</th>
                  <th className="px-6 py-3 font-bold text-center">Payment</th>
                  <th className="px-6 py-3 font-bold text-center">Delivery Stage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {filteredOrders.map((o) => (
                  <tr key={o._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-950">#{o._id.substring(18)}</td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(o.createdAt).toLocaleDateString()} &bull; {new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900">{o.user?.name || 'Deleted Account'}</p>
                      <p className="text-gray-400 text-[10px]">{o.user?.email || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-700">{o.restaurant?.name || 'N/A'}</td>
                    <td className="px-6 py-4 font-bold text-gray-900">₹{o.total.toFixed(2)}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        o.paymentStatus === 'Paid'
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {o.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${getStatusStyle(o.status)}`}>
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default ManageOrders;
