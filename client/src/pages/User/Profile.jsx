import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { User, Smartphone, Mail, ShieldCheck, MapPin, Trash2, CheckCircle, Home, Briefcase, Plus, Edit } from 'lucide-react';
import PrimeBadge from '../../components/PrimeBadge';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, reloadSession, updateUserProfile } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [addresses, setAddresses] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Address add form
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');

  const isPrime = user && user.isPrime && user.primeExpiry && new Date(user.primeExpiry) > new Date();

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await axios.get('/api/users/addresses');
        if (response.data.success) {
          setAddresses(response.data.data);
        }
      } catch (err) {
        console.error('Failed to load profile address list:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!name || !phone) {
      toast.error('Name and phone are required');
      return;
    }

    try {
      const response = await axios.put('/api/users/profile', { name, phone });
      if (response.data.success) {
        updateUserProfile(response.data.data);
        setIsEditing(false);
        toast.success('Profile details updated successfully');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!street || !city || !state || !zipCode) {
      toast.error('All address fields are required');
      return;
    }

    try {
      const response = await axios.post('/api/users/addresses', {
        street,
        city,
        state,
        zipCode,
        isDefault: addresses.length === 0
      });

      if (response.data.success) {
        setAddresses(response.data.data);
        setShowAddressForm(false);
        setStreet('');
        setCity('');
        setState('');
        setZipCode('');
        toast.success('Address added successfully');
        await reloadSession();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add address');
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;

    try {
      const response = await axios.delete(`/api/users/addresses/${addressId}`);
      if (response.data.success) {
        setAddresses(response.data.data);
        toast.success('Address deleted successfully');
        await reloadSession();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete address');
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    try {
      const response = await axios.put(`/api/users/addresses/${addressId}`, {
        isDefault: true
      });
      if (response.data.success) {
        setAddresses(response.data.data);
        toast.success('Default address updated');
        await reloadSession();
      }
    } catch (err) {
      toast.error('Failed to update default address.');
    }
  };

  return (
    <div className="min-h-screen bg-amazon-bodyBg pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Title */}
        <h1 className="text-2xl font-extrabold text-gray-900 flex items-center space-x-2">
          <User size={24} className="text-amazon-orange" />
          <span>Your Account Profile</span>
        </h1>

        {loading ? (
          <div className="text-center py-10 bg-white border rounded border-gray-200">
            <p className="text-amazon-orange font-bold animate-pulse">Loading Profile...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Left side: Profile edit & Prime badge (Spans 2 columns) */}
            <div className="md:col-span-2 space-y-6">
              
              {/* Profile Details Card */}
              <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                  <h2 className="text-base font-extrabold text-gray-900 flex items-center">
                    <User className="text-amazon-orange mr-1.5" size={18} />
                    <span>Personal Information</span>
                  </h2>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-xs font-bold text-amazon-orange hover:underline flex items-center space-x-1"
                    >
                      <Edit size={12} className="stroke-[3]" />
                      <span>Edit</span>
                    </button>
                  )}
                </div>

                {!isEditing ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1 bg-gray-50 p-3 rounded">
                      <p className="font-semibold text-gray-400">Full Name</p>
                      <p className="font-bold text-gray-800 text-sm flex items-center space-x-1.5">
                        <span>{user.name}</span>
                        {user.isPrime && <PrimeBadge showText={false} />}
                      </p>
                    </div>

                    <div className="space-y-1 bg-gray-50 p-3 rounded">
                      <p className="font-semibold text-gray-400">Email Address</p>
                      <p className="font-bold text-gray-800 text-sm truncate">{user.email}</p>
                    </div>

                    <div className="space-y-1 bg-gray-50 p-3 rounded">
                      <p className="font-semibold text-gray-400">Phone Contact</p>
                      <p className="font-bold text-gray-800 text-sm">{user.phone || 'N/A'}</p>
                    </div>

                    <div className="space-y-1 bg-gray-50 p-3 rounded">
                      <p className="font-semibold text-gray-400">Account Role</p>
                      <p className="font-bold text-gray-800 text-sm capitalize">{user.role}</p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleUpdateProfile} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Full Name</label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="input-amazon text-xs"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Phone Contact</label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="input-amazon text-xs"
                          required
                        />
                      </div>
                    </div>
                    <div className="flex space-x-2 justify-end">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-3 py-1.5 border rounded text-xs font-semibold hover:bg-gray-100"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-amazon-orange hover:bg-amazon-orangeHover text-amazon-dark font-extrabold rounded text-xs"
                      >
                        Save Details
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Saved Addresses list */}
              <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm space-y-4">
                <h2 className="text-base font-extrabold text-gray-900 border-b border-gray-100 pb-3 flex items-center">
                  <MapPin className="text-amazon-orange mr-1.5" size={18} />
                  <span>Saved Addresses</span>
                </h2>

                {addresses.length === 0 ? (
                  <p className="text-xs text-gray-500 font-semibold">No addresses saved. Please add an address to speed up checkouts.</p>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {addresses.map((addr) => (
                      <div
                        key={addr._id}
                        className={`p-3.5 rounded border text-xs flex justify-between items-start transition-all ${
                          addr.isDefault
                            ? 'border-amazon-orange bg-orange-50 bg-opacity-35'
                            : 'border-gray-200'
                        }`}
                      >
                        <div className="space-y-1">
                          <p className="font-extrabold text-gray-800 flex items-center">
                            <span>Delivery Address</span>
                            {addr.isDefault && (
                              <span className="ml-2 bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-[9px] font-bold">
                                Default
                              </span>
                            )}
                          </p>
                          <p className="text-gray-600 mt-1">{addr.street}</p>
                          <p className="text-gray-500">{addr.city}, {addr.state} - {addr.zipCode}</p>
                          
                          {!addr.isDefault && (
                            <button
                              onClick={() => handleSetDefaultAddress(addr._id)}
                              className="text-[10px] text-amazon-orange font-bold hover:underline pt-2 block"
                            >
                              Set as Default Address
                            </button>
                          )}
                        </div>
                        
                        <button
                          onClick={() => handleDeleteAddress(addr._id)}
                          className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded"
                          title="Delete Address"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add new address setup */}
                {!showAddressForm ? (
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="text-xs font-bold text-amazon-orange hover:underline flex items-center space-x-1"
                  >
                    <Plus size={14} className="stroke-[3]" />
                    <span>Add New Address</span>
                  </button>
                ) : (
                  <form onSubmit={handleAddAddress} className="border border-gray-200 rounded p-4 space-y-3 bg-gray-50">
                    <h3 className="text-xs font-extrabold text-gray-800">Add New Address</h3>
                    <div className="grid grid-cols-1 gap-2">
                      <input
                        type="text"
                        placeholder="Street Address"
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        className="input-amazon text-xs"
                        required
                      />
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="text"
                          placeholder="City"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="input-amazon text-xs"
                          required
                        />
                        <input
                          type="text"
                          placeholder="State"
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          className="input-amazon text-xs"
                          required
                        />
                        <input
                          type="text"
                          placeholder="Zip Code"
                          value={zipCode}
                          onChange={(e) => setZipCode(e.target.value)}
                          className="input-amazon text-xs"
                          required
                        />
                      </div>
                    </div>
                    <div className="flex space-x-2 justify-end">
                      <button
                        type="button"
                        onClick={() => setShowAddressForm(false)}
                        className="px-3 py-1.5 border rounded text-xs font-semibold hover:bg-gray-100"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-3.5 py-1.5 bg-amazon-orange hover:bg-amazon-orangeHover text-amazon-dark font-extrabold rounded text-xs"
                      >
                        Save Address
                      </button>
                    </div>
                  </form>
                )}
              </div>

            </div>

            {/* Right side: ShyamEats Prime Info (1 Column) */}
            <div className="space-y-6">
              {isPrime ? (
                /* Premium Prime Activated panel */
                <div className="bg-gradient-to-br from-blue-900 to-indigo-950 text-white p-5 rounded-lg border border-blue-800 shadow-md space-y-4">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="text-blue-400 fill-blue-500 text-indigo-950" size={24} />
                    <span className="font-extrabold text-base tracking-wide">Prime Member</span>
                  </div>

                  <div className="text-xs text-blue-200 space-y-2 border-t border-blue-800 pt-3">
                    <p className="font-semibold text-white">Your Prime is Active!</p>
                    <p>Expires: <span className="font-bold text-white">{new Date(user.primeExpiry).toLocaleDateString()}</span></p>
                    
                    <div className="mt-4 pt-2 border-t border-blue-900 space-y-2">
                      <p className="font-bold text-white uppercase text-[9px] tracking-wider">Prime Benefits Status:</p>
                      <ul className="space-y-1 text-[11px] list-disc pl-4 text-blue-200">
                        <li>✓ Unlimited FREE Delivery on all restaurants</li>
                        <li>✓ Exclusive Prime-only coupon validations</li>
                        <li>✓ Priority food preparation & speed delivery</li>
                        <li>✓ Premium blue badge badge on profile</li>
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                /* Unsubscribed Ad Panel */
                <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm space-y-4 text-center">
                  <div className="w-12 h-12 bg-blue-50 border border-blue-200 rounded-full flex items-center justify-center text-blue-500 mx-auto">
                    <ShieldCheck size={24} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-extrabold text-gray-900">Join ShyamEats Prime</h3>
                    <p className="text-xs text-gray-500">Save thousands of rupees in delivery charges and unlock premium coupons.</p>
                  </div>
                  <button
                    onClick={() => navigate('/subscription')}
                    className="w-full btn-amazon text-xs py-2 bg-blue-600 text-white hover:bg-blue-700 shadow"
                  >
                    Subscribe Now
                  </button>
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default Profile;
