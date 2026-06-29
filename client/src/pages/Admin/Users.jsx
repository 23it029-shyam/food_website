import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Ban, CheckCircle, ShieldAlert, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import PrimeBadge from '../../components/PrimeBadge';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/admin/users');
      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (err) {
      console.error('Failed to load platform users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleBan = async (userId, userName, currentBanStatus) => {
    const actionText = currentBanStatus ? 'unban' : 'ban';
    if (!window.confirm(`Are you sure you want to ${actionText} user '${userName}'?`)) return;

    try {
      const response = await axios.patch(`/api/admin/users/${userId}/ban`);
      if (response.data.success) {
        toast.success(`User '${userName}' has been ${currentBanStatus ? 'Unbanned' : 'Banned'} successfully.`);
        fetchUsers();
      }
    } catch (err) {
      toast.error('Failed to update ban status');
    }
  };

  // Filter users by search input
  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
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
              <Users size={22} className="text-amazon-orange" />
              <span>User Base Administration</span>
            </h1>
            <p className="text-xs text-gray-400">Suspend, audit, check Prime status, and trace customer transactions.</p>
          </div>
          
          {/* Search box */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white text-gray-800 text-xs px-3.5 py-2 pl-9 rounded focus:outline-none focus:ring-1 focus:ring-amazon-orange border border-gray-300 w-60"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={14} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {filteredUsers.length === 0 ? (
          <div className="bg-white p-12 text-center border rounded-lg">
            <p className="text-gray-500 font-semibold">No registered users found matching '{search}'</p>
          </div>
        ) : (
          /* Users Table */
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-x-auto">
            <table className="min-w-full text-xs text-left text-gray-700">
              <thead className="bg-gray-50 uppercase text-[10px] tracking-wider text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 font-bold">User</th>
                  <th className="px-6 py-3 font-bold">Phone</th>
                  <th className="px-6 py-3 font-bold">Joined</th>
                  <th className="px-6 py-3 font-bold text-center">Orders</th>
                  <th className="px-6 py-3 font-bold text-center">Prime Plan</th>
                  <th className="px-6 py-3 font-bold text-center">Account State</th>
                  <th className="px-6 py-3 font-bold text-right">Suspend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {filteredUsers.map((u) => (
                  <tr key={u._id} className={`hover:bg-gray-50 transition-colors ${u.isBanned ? 'bg-red-50 bg-opacity-20' : ''}`}>
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-950 text-sm">{u.name}</p>
                      <p className="text-gray-400 text-[10px]">{u.email}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-semibold">{u.phone}</td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-center text-gray-800 font-bold">{u.orderCount}</td>
                    <td className="px-6 py-4 text-center">
                      {u.isPrime ? (
                        <PrimeBadge showText={true} size={13} />
                      ) : (
                        <span className="text-[10px] text-gray-400">Regular</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {u.isBanned ? (
                        <span className="inline-flex items-center text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                          Banned
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleToggleBan(u._id, u.name, u.isBanned)}
                        className={`px-3 py-1.5 rounded text-[10px] font-bold border transition-colors flex items-center space-x-1 ml-auto ${
                          u.isBanned
                            ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                            : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                        }`}
                      >
                        <Ban size={12} />
                        <span>{u.isBanned ? 'Unban Account' : 'Suspend Ban'}</span>
                      </button>
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

export default ManageUsers;
