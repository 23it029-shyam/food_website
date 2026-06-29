import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Store, Check, X, Search, Landmark, ShieldAlert, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const ManageRestaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchRestaurants = async () => {
    try {
      const response = await axios.get('/api/admin/restaurants');
      if (response.data.success) {
        setRestaurants(response.data.data);
      }
    } catch (err) {
      console.error('Failed to load admin restaurants list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const handleUpdateApproval = async (restId, restName, newStatus) => {
    const actionText = newStatus ? 'approve' : 'suspend';
    if (!window.confirm(`Are you sure you want to ${actionText} restaurant '${restName}'?`)) return;

    try {
      const response = await axios.patch(`/api/admin/restaurants/${restId}/status`, {
        isApproved: newStatus
      });
      if (response.data.success) {
        toast.success(`Restaurant '${restName}' verification status updated successfully.`);
        fetchRestaurants();
      }
    } catch (err) {
      toast.error('Failed to update store verification status');
    }
  };

  const filteredRestaurants = restaurants.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.address?.city.toLowerCase().includes(search.toLowerCase())
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
              <Store size={22} className="text-amazon-orange" />
              <span>Merchant Partners Control</span>
            </h1>
            <p className="text-xs text-gray-400">Approve new restaurant registrations or suspend active ones.</p>
          </div>

          {/* Search box */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search by store or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white text-gray-800 text-xs px-3.5 py-2 pl-9 rounded focus:outline-none focus:ring-1 focus:ring-amazon-orange border border-gray-300 w-60"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={14} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {filteredRestaurants.length === 0 ? (
          <div className="bg-white p-12 text-center border rounded-lg">
            <p className="text-gray-500 font-semibold">No registered stores found matching '{search}'</p>
          </div>
        ) : (
          /* Table list */
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-x-auto">
            <table className="min-w-full text-xs text-left text-gray-700">
              <thead className="bg-gray-50 uppercase text-[10px] tracking-wider text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 font-bold">Restaurant</th>
                  <th className="px-6 py-3 font-bold">City</th>
                  <th className="px-6 py-3 font-bold">Owner Partner</th>
                  <th className="px-6 py-3 font-bold text-center">Timings</th>
                  <th className="px-6 py-3 font-bold text-center">Min Order / Delivery</th>
                  <th className="px-6 py-3 font-bold text-center">Verification</th>
                  <th className="px-6 py-3 font-bold text-right">Approval Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {filteredRestaurants.map((r) => (
                  <tr key={r._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-950 text-sm">{r.name}</p>
                      <p className="text-gray-400 text-[10px]">{r.cuisines?.join(', ')}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-semibold">{r.address?.city}</td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-800">{r.owner?.name}</p>
                      <p className="text-gray-400 text-[9px]">{r.owner?.email}</p>
                    </td>
                    <td className="px-6 py-4 text-center text-gray-500">
                      {r.timing?.open} - {r.timing?.close}
                    </td>
                    <td className="px-6 py-4 text-center space-y-0.5">
                      <p className="text-gray-900 font-bold">Min: ₹{r.minOrder}</p>
                      <p className="text-gray-400 text-[10px]">Fee: ₹{r.deliveryFee}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {r.isApproved ? (
                        <span className="inline-flex items-center text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200">
                          Approved / Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[10px] font-bold text-yellow-700 bg-yellow-50 px-2 py-0.5 rounded border border-yellow-200">
                          Pending Approval
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {r.isApproved ? (
                          <button
                            onClick={() => handleUpdateApproval(r._id, r.name, false)}
                            className="px-3 py-1.5 rounded text-[10px] font-bold border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 flex items-center space-x-1"
                          >
                            <X size={12} />
                            <span>Suspend</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUpdateApproval(r._id, r.name, true)}
                            className="px-3 py-1.5 rounded text-[10px] font-bold border border-green-200 bg-green-50 text-green-700 hover:bg-green-100 flex items-center space-x-1"
                          >
                            <Check size={12} className="stroke-[3]" />
                            <span>Approve</span>
                          </button>
                        )}
                      </div>
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

export default ManageRestaurants;
