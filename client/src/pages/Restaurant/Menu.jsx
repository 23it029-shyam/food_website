import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2, Check, X, Clipboard, ShieldAlert, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const Menu = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal Control States
  const [showModal, setShowModal] = useState(false);
  const [editItemId, setEditItemId] = useState(null);

  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [isVeg, setIsVeg] = useState(true);
  const [isAvailable, setIsAvailable] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  
  const [submitting, setSubmitting] = useState(false);

  const fetchMenu = async () => {
    try {
      const response = await axios.get('/api/menu/owner');
      if (response.data.success) {
        setItems(response.data.data);
      }
    } catch (err) {
      console.error('Failed to load owner menu:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const handleToggleAvailability = async (item) => {
    try {
      const response = await axios.put(`/api/menu/${item._id}`, {
        isAvailable: !item.isAvailable
      });
      if (response.data.success) {
        toast.success(`'${item.name}' is now ${!item.isAvailable ? 'Available' : 'Unavailable'}`);
        fetchMenu();
      }
    } catch (err) {
      toast.error('Failed to update availability status');
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this menu item?')) return;

    try {
      const response = await axios.delete(`/api/menu/${itemId}`);
      if (response.data.success) {
        toast.success('Menu item deleted');
        fetchMenu();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete menu item');
    }
  };

  const handleOpenAddModal = () => {
    setEditItemId(null);
    setName('');
    setDescription('');
    setPrice('');
    setCategory('Starters');
    setIsVeg(true);
    setIsAvailable(true);
    setImageFile(null);
    setShowModal(true);
  };

  const handleOpenEditModal = (item) => {
    setEditItemId(item._id);
    setName(item.name);
    setDescription(item.description);
    setPrice(item.price.toString());
    setCategory(item.category);
    setIsVeg(item.isVeg);
    setIsAvailable(item.isAvailable);
    setImageFile(null);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !price || !category) {
      toast.error('Please fill in name, price, and category');
      return;
    }

    setSubmitting(true);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('category', category);
    formData.append('isVeg', isVeg);
    formData.append('isAvailable', isAvailable);
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      let response;
      if (editItemId) {
        // Edit request
        response = await axios.put(`/api/menu/${editItemId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        // Add request
        response = await axios.post('/api/menu', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      if (response.data.success) {
        toast.success(editItemId ? 'Menu item updated' : 'Menu item created successfully');
        setShowModal(false);
        fetchMenu();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save menu item');
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
            <h1 className="text-xl md:text-2xl font-extrabold text-white flex items-center">
              <span>Menu Management</span>
            </h1>
            <p className="text-xs text-gray-400">Configure catalog foods, pricing, details and availability toggles.</p>
          </div>
          <button onClick={handleOpenAddModal} className="btn-amazon text-xs py-2 flex items-center space-x-1.5 font-bold shadow">
            <Plus size={14} className="stroke-[3]" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {loading ? (
          <div className="text-center py-10 bg-white border rounded">
            <p className="text-amazon-orange font-bold animate-pulse">Loading menu list...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white p-12 text-center border rounded-lg space-y-4">
            <p className="text-gray-500 font-semibold">Your store menu is empty.</p>
            <button onClick={handleOpenAddModal} className="btn-amazon text-xs">Add First Dish</button>
          </div>
        ) : (
          /* Menu Table Grid */
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-x-auto">
            <table className="min-w-full text-xs text-left text-gray-700">
              <thead className="bg-gray-50 uppercase text-[10px] tracking-wider text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 font-bold">Image</th>
                  <th className="px-6 py-3 font-bold">Details</th>
                  <th className="px-6 py-3 font-bold">Category</th>
                  <th className="px-6 py-3 font-bold">Price</th>
                  <th className="px-6 py-3 font-bold text-center">Status</th>
                  <th className="px-6 py-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {items.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <img
                        src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100'}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded border"
                      />
                    </td>
                    <td className="px-6 py-4 space-y-1">
                      <div className="flex items-center space-x-1.5">
                        <span className={`inline-block border w-2.5 h-2.5 p-0.5 ${item.isVeg ? 'border-green-600' : 'border-red-600'}`}>
                          <span className={`block w-1 h-1 rounded-full ${item.isVeg ? 'bg-green-600' : 'bg-red-600'}`}></span>
                        </span>
                        <span className="font-bold text-sm text-gray-900">{item.name}</span>
                      </div>
                      <p className="text-gray-400 text-[10px] line-clamp-1 max-w-xs">{item.description}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-500 font-bold">{item.category}</td>
                    <td className="px-6 py-4 font-bold text-gray-900">₹{item.price.toFixed(2)}</td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleToggleAvailability(item)}
                        className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors ${
                          item.isAvailable
                            ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                            : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                        }`}
                      >
                        {item.isAvailable ? 'In Stock' : 'Sold Out'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="p-1 hover:bg-gray-100 rounded text-gray-600"
                          title="Edit"
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item._id)}
                          className="p-1 hover:bg-red-50 text-red-500 rounded"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit / Create Form Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl border border-gray-200 max-w-md w-full overflow-hidden animate-fade-in-down">
            <div className="bg-amazon-dark text-white p-4 flex justify-between items-center border-b border-gray-800">
              <span className="font-extrabold text-sm tracking-wide">
                {editItemId ? 'Update Menu Item' : 'Add New Menu Item'}
              </span>
              <button onClick={() => setShowModal(false)} className="hover:text-amazon-orange text-gray-400">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block font-bold text-gray-600 mb-0.5">Dish Name*</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-amazon text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-gray-600 mb-0.5">Category*</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="input-amazon text-xs bg-white"
                  >
                    <option value="Starters">Starters</option>
                    <option value="Main Course">Main Course</option>
                    <option value="Pastas">Pastas</option>
                    <option value="Pizzas">Pizzas</option>
                    <option value="Breads">Breads</option>
                    <option value="Desserts">Desserts</option>
                    <option value="Sides">Sides</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-gray-600 mb-0.5">Price (₹)*</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="input-amazon text-xs"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-gray-600 mb-0.5">Description</label>
                <textarea
                  rows="2"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input-amazon text-xs"
                  placeholder="Short description of ingredients..."
                ></textarea>
              </div>

              {/* Upload image */}
              <div className="space-y-1">
                <label className="block font-bold text-gray-600 mb-0.5">Product Photo File</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0])}
                  className="w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-800 hover:file:bg-gray-200"
                />
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isVeg}
                    onChange={(e) => setIsVeg(e.target.checked)}
                    className="rounded text-amazon-orange focus:ring-amazon-orange border-gray-300 h-4 w-4"
                  />
                  <span className="font-bold text-gray-600">Pure Veg (Green Mark)</span>
                </label>

                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAvailable}
                    onChange={(e) => setIsAvailable(e.target.checked)}
                    className="rounded text-amazon-orange focus:ring-amazon-orange border-gray-300 h-4 w-4"
                  />
                  <span className="font-bold text-gray-600">In Stock (Available)</span>
                </label>
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
                  {submitting ? 'Saving...' : editItemId ? 'Update Dish' : 'Add Dish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Menu;
