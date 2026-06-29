import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Store, MapPin, Clock, Truck, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [cuisines, setCuisines] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [openTime, setOpenTime] = useState('');
  const [closeTime, setCloseTime] = useState('');
  const [deliveryRadius, setDeliveryRadius] = useState('');
  const [minOrder, setMinOrder] = useState('');
  const [deliveryFee, setDeliveryFee] = useState('');
  const [isApproved, setIsApproved] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('/api/restaurants/owner/profile');
        if (response.data.success) {
          const r = response.data.data;
          setName(r.name || '');
          setDescription(r.description || '');
          setCuisines(r.cuisines ? r.cuisines.join(', ') : '');
          setStreet(r.address?.street || '');
          setCity(r.address?.city || '');
          setState(r.address?.state || '');
          setZipCode(r.address?.zipCode || '');
          setLat(r.location?.lat || '');
          setLng(r.location?.lng || '');
          setOpenTime(r.timing?.open || '09:00 AM');
          setCloseTime(r.timing?.close || '10:00 PM');
          setDeliveryRadius(r.deliveryRadius ? r.deliveryRadius.toString() : '5');
          setMinOrder(r.minOrder ? r.minOrder.toString() : '0');
          setDeliveryFee(r.deliveryFee ? r.deliveryFee.toString() : '40');
          setIsApproved(r.isApproved || false);
        }
      } catch (err) {
        console.warn('Store profile does not exist yet. Please configure it.', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !street || !city || !state || !zipCode) {
      toast.error('Store name and address are required');
      return;
    }

    setSubmitting(true);
    try {
      const response = await axios.post('/api/restaurants/owner/profile', {
        name,
        description,
        cuisines,
        street,
        city,
        state,
        zipCode,
        lat: parseFloat(lat || 0),
        lng: parseFloat(lng || 0),
        openTime,
        closeTime,
        deliveryRadius: parseFloat(deliveryRadius || 5),
        minOrder: parseFloat(minOrder || 0),
        deliveryFee: parseFloat(deliveryFee || 40)
      });

      if (response.data.success) {
        toast.success('Restaurant profile saved successfully!');
        setIsApproved(response.data.data.isApproved);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save store profile');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse space-y-6">
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
            <Store size={22} className="text-amazon-orange" />
            <span>Store Profile Configuration</span>
          </h1>
          <p className="text-xs text-gray-400">Configure logistics, delivery radii, working timings, and coordinates.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Verification Alert Banner */}
        {!isApproved && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded p-4 flex items-start space-x-3 text-xs text-yellow-800">
            <ShieldAlert size={18} className="text-yellow-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-extrabold">Approval Required</p>
              <p className="mt-0.5 text-yellow-700">
                Your restaurant is currently pending administrator verification. Once approved, it will be visible to standard customers on the homepage.
              </p>
            </div>
          </div>
        )}

        {/* Profile Form Card */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6 text-xs text-gray-700">
            
            {/* Store Information */}
            <div className="space-y-3">
              <h3 className="text-xs font-extrabold text-gray-900 border-b pb-2 uppercase tracking-wider">Store Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-bold text-gray-600">Restaurant Business Name*</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-amazon text-xs"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-gray-600">Cuisine Departments (Comma separated)*</label>
                  <input
                    type="text"
                    value={cuisines}
                    onChange={(e) => setCuisines(e.target.value)}
                    className="input-amazon text-xs"
                    placeholder="e.g. North Indian, Biryani, Street Food"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-gray-600">Store Description</label>
                <textarea
                  rows="2"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input-amazon text-xs"
                  placeholder="Describe your kitchen highlights..."
                ></textarea>
              </div>
            </div>

            {/* Timings & Logistics */}
            <div className="space-y-3">
              <h3 className="text-xs font-extrabold text-gray-900 border-b pb-2 uppercase tracking-wider flex items-center">
                <Clock size={14} className="mr-1.5 text-amazon-orange" /> Timings & Logistics
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="block font-bold text-gray-600">Opening Time</label>
                  <input
                    type="text"
                    value={openTime}
                    onChange={(e) => setOpenTime(e.target.value)}
                    className="input-amazon text-xs"
                    placeholder="e.g. 09:00 AM"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-gray-600">Closing Time</label>
                  <input
                    type="text"
                    value={closeTime}
                    onChange={(e) => setCloseTime(e.target.value)}
                    className="input-amazon text-xs"
                    placeholder="e.g. 10:00 PM"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-gray-600">Delivery Radius (km)</label>
                  <input
                    type="number"
                    value={deliveryRadius}
                    onChange={(e) => setDeliveryRadius(e.target.value)}
                    className="input-amazon text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-gray-600">Min Order Threshold (₹)</label>
                  <input
                    type="number"
                    value={minOrder}
                    onChange={(e) => setMinOrder(e.target.value)}
                    className="input-amazon text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-bold text-gray-600">Default Delivery Fee (₹)</label>
                  <input
                    type="number"
                    value={deliveryFee}
                    onChange={(e) => setDeliveryFee(e.target.value)}
                    className="input-amazon text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-3">
              <h3 className="text-xs font-extrabold text-gray-900 border-b pb-2 uppercase tracking-wider flex items-center">
                <MapPin size={14} className="mr-1.5 text-amazon-orange" /> Store Location Address
              </h3>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="block font-bold text-gray-600">Street Address*</label>
                  <input
                    type="text"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="input-amazon text-xs"
                    required
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="block font-bold text-gray-600">City*</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="input-amazon text-xs"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block font-bold text-gray-600">State*</label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="input-amazon text-xs"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block font-bold text-gray-600">Zip Code*</label>
                    <input
                      type="text"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      className="input-amazon text-xs"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <div className="border-t pt-4 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="btn-amazon text-xs py-2 px-8 font-bold shadow"
              >
                {submitting ? 'Saving Configuration...' : 'Save Settings'}
              </button>
            </div>

          </form>
        </div>

      </div>

    </div>
  );
};

export default Profile;
