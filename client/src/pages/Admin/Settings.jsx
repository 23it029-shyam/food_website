import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Settings, Percent, Truck, ShoppingBag, ShieldAlert, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';

const ManageSettings = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [commissionPercent, setCommissionPercent] = useState('10');
  const [minOrderValue, setMinOrderValue] = useState('100');
  const [deliveryFee, setDeliveryFee] = useState('40');
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get('/api/admin/settings');
        if (response.data.success) {
          const s = response.data.data;
          setCommissionPercent(s.commissionPercent.toString());
          setMinOrderValue(s.minOrderValue.toString());
          setDeliveryFee(s.deliveryFee.toString());
          setMaintenanceMode(s.maintenanceMode || false);
        }
      } catch (err) {
        console.error('Failed to load admin platform settings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await axios.put('/api/admin/settings', {
        commissionPercent: parseFloat(commissionPercent),
        minOrderValue: parseFloat(minOrderValue),
        deliveryFee: parseFloat(deliveryFee),
        maintenanceMode
      });

      if (response.data.success) {
        toast.success('Platform system configurations updated successfully!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update platform settings');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse space-y-6">
        <div className="h-10 bg-gray-200 w-1/4 rounded"></div>
        <div className="h-64 bg-gray-200 rounded w-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amazon-bodyBg pb-12">
      
      {/* Header */}
      <div className="bg-amazon-dark text-white py-8 border-b border-gray-800 shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-xl md:text-2xl font-extrabold text-white flex items-center space-x-2">
            <Settings size={22} className="text-amazon-orange" />
            <span>Platform Global Configuration</span>
          </h1>
          <p className="text-xs text-gray-400">Configure global commissions, default base rates, minimum order sizes, and system health status.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Maintenance warning alert */}
        {maintenanceMode && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded p-4 flex items-start space-x-3 text-xs text-red-800">
            <ShieldAlert size={18} className="text-red-600 shrink-0 mt-0.5 animate-pulse" />
            <div>
              <p className="font-extrabold">Maintenance Mode Activated</p>
              <p className="mt-0.5 text-red-700">
                The customer checkout flows are currently offline for maintenance. Only administrators can review catalog details. Remember to disable this toggle when operations resume.
              </p>
            </div>
          </div>
        )}

        {/* Configurations form card */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6 text-xs text-gray-700">
            
            <div className="space-y-4">
              <h3 className="text-xs font-extrabold text-gray-900 border-b pb-2 uppercase tracking-wider">Financial Parameters</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* Commission */}
                <div className="space-y-1">
                  <label className="font-bold text-gray-600 flex items-center">
                    <Percent size={13} className="mr-1 text-amazon-orange" />
                    <span>Store Commission (%)</span>
                  </label>
                  <input
                    type="number"
                    value={commissionPercent}
                    onChange={(e) => setCommissionPercent(e.target.value)}
                    className="input-amazon text-xs"
                    required
                  />
                  <p className="text-[10px] text-gray-400">Platform charge percentage per sale.</p>
                </div>

                {/* Base Delivery Fee */}
                <div className="space-y-1">
                  <label className="font-bold text-gray-600 flex items-center">
                    <Truck size={13} className="mr-1 text-amazon-orange" />
                    <span>Base Delivery Fee (₹)</span>
                  </label>
                  <input
                    type="number"
                    value={deliveryFee}
                    onChange={(e) => setDeliveryFee(e.target.value)}
                    className="input-amazon text-xs"
                    required
                  />
                  <p className="text-[10px] text-gray-400">Default rate charged to regular users.</p>
                </div>

                {/* Min Order Value */}
                <div className="space-y-1">
                  <label className="font-bold text-gray-600 flex items-center">
                    <ShoppingBag size={13} className="mr-1 text-amazon-orange" />
                    <span>Platform Min Order (₹)</span>
                  </label>
                  <input
                    type="number"
                    value={minOrderValue}
                    onChange={(e) => setMinOrderValue(e.target.value)}
                    className="input-amazon text-xs"
                    required
                  />
                  <p className="text-[10px] text-gray-400">Global minimum basket requirement.</p>
                </div>

              </div>
            </div>

            {/* Maintenance Mode */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <div className="space-y-0.5">
                  <h3 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider">Maintenance Outage Override</h3>
                  <p className="text-[10px] text-gray-400">Toggle this switch to put the ordering platform offline temporarily.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setMaintenanceMode(!maintenanceMode)}
                  className="focus:outline-none transition-all duration-200"
                >
                  {maintenanceMode ? (
                    <ToggleRight size={32} className="text-red-500" />
                  ) : (
                    <ToggleLeft size={32} className="text-gray-300" />
                  )}
                </button>
              </div>
            </div>

            {/* Action Submit */}
            <div className="border-t pt-4 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="btn-amazon text-xs py-2 px-8 font-bold shadow"
              >
                {submitting ? 'Applying System Configurations...' : 'Save Configuration'}
              </button>
            </div>

          </form>
        </div>

      </div>

    </div>
  );
};

export default ManageSettings;
