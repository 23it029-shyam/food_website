import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Lock, Smartphone, ArrowRight, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated, user } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('user'); // default customer
  
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'restaurant') navigate('/restaurant/dashboard');
      else navigate('/');
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !phone) {
      toast.error('Please fill in all registration fields');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setSubmitting(true);
    try {
      await register(name, email, password, phone, role);
    } catch (err) {
      // Error is caught and printed inside AuthContext
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-amazon-dark flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Decorative gradients */}
      <div className="absolute right-0 top-0 w-96 h-96 bg-amazon-orange opacity-10 rounded-full blur-3xl transform translate-x-20 -translate-y-20"></div>
      <div className="absolute left-0 bottom-0 w-96 h-96 bg-amazon-gold opacity-10 rounded-full blur-3xl transform -translate-x-20 translate-y-20"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center select-none space-y-2">
        <Link to="/" className="text-3xl font-extrabold tracking-tight text-amazon-orange flex justify-center items-center">
          ShyamEats
        </Link>
        <p className="text-xs text-amazon-gold font-bold tracking-widest uppercase">Hungry? ShyamEats Delivers!</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-200">
          <form className="space-y-4 text-xs text-gray-700" onSubmit={handleSubmit}>
            
            {/* Full Name */}
            <div className="space-y-1">
              <label className="block font-bold text-gray-600">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Shyam Kumar"
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded focus:outline-none focus:border-amazon-orange focus:ring-1 focus:ring-amazon-orange transition-colors text-xs"
                  required
                />
                <User className="absolute left-3 top-3.5 text-gray-400" size={13} />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="block font-bold text-gray-600">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="shyam@example.com"
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded focus:outline-none focus:border-amazon-orange focus:ring-1 focus:ring-amazon-orange transition-colors text-xs"
                  required
                />
                <Mail className="absolute left-3 top-3.5 text-gray-400" size={13} />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <label className="block font-bold text-gray-600">Phone Contact</label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded focus:outline-none focus:border-amazon-orange focus:ring-1 focus:ring-amazon-orange transition-colors text-xs"
                  required
                />
                <Smartphone className="absolute left-3 top-3.5 text-gray-400" size={13} />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="block font-bold text-gray-600">Choose Password (Min 6 chars)</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded focus:outline-none focus:border-amazon-orange focus:ring-1 focus:ring-amazon-orange transition-colors text-xs"
                  required
                />
                <Lock className="absolute left-3 top-3.5 text-gray-400" size={13} />
              </div>
            </div>

            {/* Role Select Options */}
            <div className="space-y-1 pt-1">
              <label className="block font-bold text-gray-600">Account Type</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'user', name: 'Join as Customer' },
                  { id: 'restaurant', name: 'Join as Partner Store' }
                ].map(r => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
                    className={`py-2 px-3 border rounded text-[10px] font-bold text-center transition-all ${
                      role === r.id
                        ? 'border-amazon-orange bg-orange-50 bg-opacity-35 text-amazon-orange font-extrabold'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-500'
                    }`}
                  >
                    {r.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full btn-amazon py-3 flex items-center justify-center space-x-1.5 text-sm"
              >
                <span>{submitting ? 'Creating account...' : 'Create Account'}</span>
                <ArrowRight size={16} className="stroke-[3]" />
              </button>
            </div>

          </form>

          {/* Footer link separator */}
          <div className="mt-6 border-t border-gray-100 pt-6 text-center">
            <p className="text-xs text-gray-500">
              Already have an account?{' '}
              <Link to="/login" className="text-amazon-orange font-bold hover:underline">
                Sign in
              </Link>
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};

export default Register;
