import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Ticket, Plus, Trash2, Check, X, ToggleLeft, ToggleRight, Calendar, Users, Percent, DollarSign, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const ManagePromos = () => {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form Fields
  const [code, setCode] = useState('');
  const [type, setType] = useState('percent');
  const [value, setValue] = useState('');
  const [minOrderAmount, setMinOrderAmount] = useState('0');
  const [maxDiscount, setMaxDiscount] = useState('0');
  const [usageLimit, setUsageLimit] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const fetchPromos = async () => {
    try {
      const response = await axios.get('/api/admin/promos');
      if (response.data.success) {
        setPromos(response.data.data);
      }
    } catch (err) {
      console.error('Failed to load platform promo codes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromos();
  }, []);

  const handleToggleActive = async (promo) => {
    try {
      const response = await axios.patch(`/api/admin/promos/${promo._id}`, {
        isActive: !promo.isActive
      });
      if (response.data.success) {
        toast.success(`Coupon '${promo.code}' is now ${!promo.isActive ? 'Active' : 'Inactive'}`);
        fetchPromos();
      }
    } catch (err) {
      toast.error('Failed to update coupon state.');
    }
  };

  const handleDeletePromo = async (promoId) => {
    if (!window.confirm('Are you sure you want to delete this promotional coupon code? This action cannot be undone.')) return;

    try {
      const response = await axios.delete(`/api/admin/promos/${promoId}`);
      if (response.data.success) {
        toast.success('Coupon code deleted successfully.');
        fetchPromos();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete coupon.');
    }
  };

  const handleOpenCreateModal = () => {
    setCode('');
    setType('percent');
    setValue('');
    setMinOrderAmount('0');
    setMaxDiscount('0');
    setUsageLimit('');
    setExpiresAt('');
    setAssignedTo('');
    setIsActive(true);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code || !value || !expiresAt) {
      toast.error('Please fill in code, value, and expiration date');
      return;
    }

    setSubmitting(true);
    try {
      const response = await axios.post('/api/admin/promos', {
        code: code.trim().toUpperCase(),
        type,
        value: parseFloat(value),
        minOrderAmount: parseFloat(minOrderAmount || 0),
        maxDiscount: parseFloat(maxDiscount || 0),
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
        expiresAt: new Date(expiresAt),
        assignedTo: assignedTo.trim() || null,
        isActive
      });

      if (response.data.success) {
        toast.success('Promo coupon code generated successfully');
        setShowModal(false);
        fetchPromos();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create coupon code');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-amazon-bodyBg pb-12">
      
      {/* Header */}
      <div className="bg-amazon-dark text-white py-8 border-b border-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-white flex items-center space-x-2">
              <Ticket size={22} className="text-amazon-orange animate-pulse" />
              <span>Promo Coupon Codes</span>
            </h1>
            <p className="text-xs text-gray-400">Create, disable, and monitor performance discounts for the checkout system.</p>
          </div>
          <button
            onClick={handleOpenCreateModal}
            className="btn-amazon text-xs py-2 flex items-center space-x-1.5 font-bold shadow"
          >
            <Plus size={14} className="stroke-[3]" />
            <span>Generate Coupon</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {loading ? (
          <div className="text-center py-10 bg-white border rounded">
            <p className="text-amazon-orange font-bold animate-pulse">Loading coupons list...</p>
          </div>
        ) : promos.length === 0 ? (
          <div className="bg-white p-12 text-center border rounded-lg flex flex-col items-center justify-center space-y-4">
            <AlertCircle size={32} className="text-gray-400" />
            <p className="text-gray-500 font-semibold">No promotional codes generated yet.</p>
            <button onClick={handleOpenCreateModal} className="btn-amazon text-xs">Create First Coupon</button>
          </div>
        ) : (
          /* Promos Table list */
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-x-auto">
            <table className="min-w-full text-xs text-left text-gray-700">
              <thead className="bg-gray-50 uppercase text-[10px] tracking-wider text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 font-bold">Code String</th>
                  <th className="px-6 py-3 font-bold">Type</th>
                  <th className="px-6 py-3 font-bold">Value</th>
                  <th className="px-6 py-3 font-bold">Conditions</th>
                  <th className="px-6 py-3 font-bold text-center">Expiry</th>
                  <th className="px-6 py-3 font-bold text-center">Used / Limit</th>
                  <th className="px-6 py-3 font-bold text-center">Status</th>
                  <th className="px-6 py-3 font-bold text-right">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {promos.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-extrabold text-sm uppercase text-gray-900 tracking-wider bg-gray-100 border border-gray-200 px-2.5 py-0.5 rounded w-fit select-all">
                        {p.code}
                      </p>
                      {p.assignedTo && (
                        <p className="text-[10px] text-blue-500 mt-1 flex items-center">
                          <Users size={10} className="mr-0.5" /> Assigned: {p.assignedTo?.name}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-500 capitalize">{p.type.replace('_', ' ')}</td>
                    <td className="px-6 py-4 font-bold text-gray-900">
                      {p.type === 'percent' ? `${p.value}%` : p.type === 'flat' ? `₹${p.value}` : 'Free Del.'}
                    </td>
                    <td className="px-6 py-4 text-gray-500 space-y-0.5">
                      <p>Min order: ₹{p.minOrderAmount}</p>
                      {p.maxDiscount > 0 && <p className="text-[10px]">Max cap: ₹{p.maxDiscount}</p>}
                    </td>
                    <td className="px-6 py-4 text-center text-gray-500 flex-shrink-0">
                      <span className="inline-flex items-center space-x-1">
                        <Calendar size={11} />
                        <span>{new Date(p.expiresAt).toLocaleDateString()}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-gray-900 font-bold">
                      {p.usedCount} / {p.usageLimit === null ? '∞' : p.usageLimit}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleToggleActive(p)}
                        className="text-gray-600 hover:text-amazon-orange rounded focus:outline-none transition-colors"
                        title="Toggle Active Status"
                      >
                        {p.isActive ? (
                          <ToggleRight size={28} className="text-amazon-orange" />
                        ) : (
                          <ToggleLeft size={28} className="text-gray-300" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDeletePromo(p._id)}
                        className="p-1 hover:bg-red-50 text-red-500 rounded ml-auto block"
                        title="Delete Coupon"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create coupon code Modal Form */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl border border-gray-200 max-w-md w-full overflow-hidden animate-fade-in-down animate-duration-150">
            <div className="bg-amazon-dark text-white p-4 flex justify-between items-center border-b border-gray-800">
              <span className="font-extrabold text-sm tracking-wide">Generate New Coupon</span>
              <button onClick={() => setShowModal(false)} className="hover:text-amazon-orange text-gray-400">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-gray-600 mb-0.5">Coupon Code String*</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="input-amazon text-xs uppercase"
                    placeholder="e.g. MONSOON30"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-gray-600 mb-0.5">Discount Type*</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="input-amazon text-xs bg-white"
                  >
                    <option value="percent">Percentage Off (%)</option>
                    <option value="flat">Flat Cash Discount (₹)</option>
                    <option value="free_delivery">Free Delivery Option</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-gray-600 mb-0.5">Discount Value*</label>
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="input-amazon text-xs"
                    placeholder="e.g. 30"
                    disabled={type === 'free_delivery'}
                    required={type !== 'free_delivery'}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-gray-600 mb-0.5">Min Order (₹)</label>
                  <input
                    type="number"
                    value={minOrderAmount}
                    onChange={(e) => setMinOrderAmount(e.target.value)}
                    className="input-amazon text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-gray-600 mb-0.5">Max Discount (₹)</label>
                  <input
                    type="number"
                    value={maxDiscount}
                    onChange={(e) => setMaxDiscount(e.target.value)}
                    className="input-amazon text-xs"
                    disabled={type !== 'percent'}
                    placeholder="0 = No Cap"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-gray-600 mb-0.5">Usage Limits Count</label>
                  <input
                    type="number"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(e.target.value)}
                    className="input-amazon text-xs"
                    placeholder="Blank = Unlimited"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-gray-600 mb-0.5">Expiration Date*</label>
                  <input
                    type="date"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="input-amazon text-xs"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-gray-600 mb-0.5">Assign to User ID (Optional)</label>
                <input
                  type="text"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="input-amazon text-xs font-mono"
                  placeholder="Leave empty for public codes"
                />
              </div>

              <div className="flex space-x-2 justify-end border-t pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3.5 py-2 border rounded text-xs font-semibold hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-amazon-orange hover:bg-amazon-orangeHover text-amazon-dark font-extrabold rounded text-xs"
                >
                  {submitting ? 'Generating...' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ManagePromos;
