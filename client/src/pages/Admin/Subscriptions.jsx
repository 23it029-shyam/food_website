import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldCheck, UserMinus, Search, DollarSign, Users, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const ManageSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [metrics, setMetrics] = useState({
    activeMembersCount: 0,
    subRevenue: 0
  });

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchSubscriptions = async () => {
    try {
      const response = await axios.get('/api/admin/subscriptions');
      if (response.data.success) {
        const { subscriptions: list, activeMembersCount, subRevenue } = response.data.data;
        setSubscriptions(list);
        setMetrics({
          activeMembersCount,
          subRevenue
        });
      }
    } catch (err) {
      console.error('Failed to load admin subscriptions list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const handleRevokePrime = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to revoke Prime membership for user '${userName}'?`)) return;

    try {
      // In our subscription controller, cancelling a subscription applies to the currently logged in user.
      // So let's configure the endpoint or create a small helper for the admin to cancel user subscription:
      // Wait, we can implement a custom endpoint in the backend for admin, or write a clean delete/cancel call.
      // Wait! The router for admin has: `GET /subscriptions`. We can support a DELETE/PATCH route to revoke it,
      // or we can invoke a cancellation endpoint!
      // Let's check how the admin cancel subscription works. The route files list `POST /api/subscriptions/cancel` (which acts on logged-in user).
      // We can create a route PATCH /api/admin/subscriptions/:id/cancel in server admin route for administrators to cancel ANY user's subscription,
      // or we can trigger it directly!
      // Let's check if we added that route in routes/admin.js. We did not add it yet, but we can easily call a custom admin controller method,
      // or we can edit server/controllers/adminController.js and server/routes/admin.js to support revoking!
      // Let's see: yes! Adding an admin revoke endpoint is highly detailed and robust. Let's make this page call `POST /api/admin/subscriptions/:id/revoke`
      // and implement the controller method in adminController.js!
      
      const response = await axios.post(`/api/admin/subscriptions/${userId}/revoke`);
      if (response.data.success) {
        toast.success(`Prime membership revoked for '${userName}' successfully.`);
        fetchSubscriptions();
      }
    } catch (err) {
      toast.error('Failed to revoke Prime membership');
    }
  };

  const filteredSubs = subscriptions.filter(s =>
    s.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.userId?.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse space-y-6">
        <div className="h-10 bg-gray-200 w-1/4 rounded"></div>
        <div className="h-44 bg-gray-200 rounded w-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amazon-bodyBg pb-12">
      
      {/* Header */}
      <div className="bg-amazon-dark text-white py-8 border-b border-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between sm:items-center space-y-3 sm:space-y-0">
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-white flex items-center space-x-2">
              <ShieldCheck size={22} className="text-blue-500 fill-blue-500 text-white" />
              <span>Prime Memberships Control</span>
            </h1>
            <p className="text-xs text-gray-400">Track active memberships, calculate sub revenues, and revoke Prime licenses.</p>
          </div>

          {/* Search box */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search member name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white text-gray-800 text-xs px-3.5 py-2 pl-9 rounded focus:outline-none border border-gray-300 w-60"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={14} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Metric cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-xl mx-auto">
          {/* Card 1 */}
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Prime Members</span>
              <h3 className="text-2xl font-extrabold text-gray-900">{metrics.activeMembersCount}</h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-500 rounded-full">
              <Users size={22} />
            </div>
          </div>
          {/* Card 2 */}
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Subscription Monthly Revenue</span>
              <h3 className="text-2xl font-extrabold text-gray-950">₹{metrics.subRevenue.toFixed(2)}</h3>
            </div>
            <div className="p-3 bg-green-50 text-green-600 rounded-full">
              <DollarSign size={22} />
            </div>
          </div>
        </div>

        {/* Member Table Grid */}
        {filteredSubs.length === 0 ? (
          <div className="bg-white p-12 text-center border rounded-lg">
            <p className="text-gray-500 font-semibold">No active subscriptions found matching '{search}'</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-x-auto">
            <table className="min-w-full text-xs text-left text-gray-700">
              <thead className="bg-gray-50 uppercase text-[10px] tracking-wider text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 font-bold">Member</th>
                  <th className="px-6 py-3 font-bold">Plan Type</th>
                  <th className="px-6 py-3 font-bold">Start Date</th>
                  <th className="px-6 py-3 font-bold">End Date</th>
                  <th className="px-6 py-3 font-bold text-center">Status</th>
                  <th className="px-6 py-3 font-bold text-right">Revoke License</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {filteredSubs.map((s) => (
                  <tr key={s._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-950 text-sm">{s.userId?.name || 'Deleted Account'}</p>
                      <p className="text-gray-400 text-[10px]">{s.userId?.email || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-500 capitalize">{s.plan}</td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(s.startDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(s.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {s.isActive ? (
                        <span className="inline-flex items-center text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded border border-gray-200">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {s.isActive && (
                        <button
                          onClick={() => handleRevokePrime(s.userId?._id, s.userId?.name)}
                          className="px-3 py-1.5 rounded text-[10px] font-bold border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 flex items-center space-x-1 ml-auto"
                        >
                          <UserMinus size={12} />
                          <span>Revoke Prime</span>
                        </button>
                      )}
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

export default ManageSubscriptions;
