import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, Mail, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { login, isAuthenticated, user } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [requiredRole, setRequiredRole] = useState(() => {
    if (location.pathname.startsWith('/admin')) return 'admin';
    if (location.pathname.startsWith('/restaurant')) return 'restaurant';
    return 'user';
  });
  const [submitting, setSubmitting] = useState(false);

  // Redirect parameter checking
  const redirect = searchParams.get('redirect') || '';

  useEffect(() => {
    // If already authenticated, redirect
    if (isAuthenticated && user) {
      if (redirect) navigate(`/${redirect}`);
      else if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'restaurant') navigate('/restaurant/dashboard');
      else navigate('/');
    }
  }, [isAuthenticated, user, navigate, redirect]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }

    setSubmitting(true);
    try {
      await login(email, password, requiredRole);
      // Success toast triggers inside AuthContext
    } catch (err) {
      // Error handles inside context
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-amazon-dark flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Decorative background gradients */}
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
          <form className="space-y-6 text-xs text-gray-700" onSubmit={handleSubmit}>
            
            {/* Email */}
            <div className="space-y-1">
              <label className="block font-bold text-gray-600">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded focus:outline-none focus:border-amazon-orange focus:ring-1 focus:ring-amazon-orange transition-colors text-xs"
                  required
                />
                <Mail className="absolute left-3 top-3 text-gray-400" size={14} />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="block font-bold text-gray-600">Password</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded focus:outline-none focus:border-amazon-orange focus:ring-1 focus:ring-amazon-orange transition-colors text-xs"
                  required
                />
                <Lock className="absolute left-3 top-3 text-gray-400" size={14} />
              </div>
            </div>

            {/* Role Filter option (Only show on generic login '/login') */}
            {location.pathname === '/login' && (
              <div className="space-y-1.5 pt-1">
                <label className="block font-bold text-gray-600">Select Portal Destination</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'user', name: 'Customer' },
                    { id: 'restaurant', name: 'Partner' },
                    { id: 'admin', name: 'Admin' }
                  ].map(r => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRequiredRole(r.id)}
                      className={`py-2 px-3 border rounded text-[10px] font-bold text-center transition-all ${
                        requiredRole === r.id
                          ? 'border-amazon-orange bg-orange-50 bg-opacity-35 text-amazon-orange font-extrabold'
                          : 'border-gray-200 hover:bg-gray-50 text-gray-500'
                      }`}
                    >
                      {r.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full btn-amazon py-3 flex items-center justify-center space-x-1.5 text-sm"
              >
                <span>{submitting ? 'Signing in...' : 'Sign In'}</span>
                <ArrowRight size={16} className="stroke-[3]" />
              </button>
            </div>

          </form>

          {/* Footer separator link */}
          <div className="mt-6 border-t border-gray-100 pt-6 text-center">
            <p className="text-xs text-gray-500">
              New to ShyamEats?{' '}
              <Link to="/register" className="text-amazon-orange font-bold hover:underline">
                Create your account
              </Link>
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};

export default Login;
