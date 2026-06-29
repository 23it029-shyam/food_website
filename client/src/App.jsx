import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { SocketProvider } from './context/SocketContext';

// Layout Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Portal 1: Customer Pages
import Home from './pages/User/Home';
import Restaurants from './pages/User/Restaurants';
import RestaurantDetail from './pages/User/RestaurantDetail';
import Cart from './pages/User/Cart';
import Checkout from './pages/User/Checkout';
import Orders from './pages/User/Orders';
import Track from './pages/User/Track';
import Profile from './pages/User/Profile';
import Subscription from './pages/User/Subscription';
import Login from './pages/User/Login';
import Register from './pages/User/Register';

// Portal 2: Restaurant Partner Pages
import RestDashboard from './pages/Restaurant/Dashboard';
import RestMenu from './pages/Restaurant/Menu';
import RestOrders from './pages/Restaurant/Orders';
import RestAnalytics from './pages/Restaurant/Analytics';
import RestProfile from './pages/Restaurant/Profile';

// Portal 3: Admin Pages
import AdminDashboard from './pages/Admin/Dashboard';
import AdminUsers from './pages/Admin/Users';
import AdminRestaurants from './pages/Admin/Restaurants';
import AdminOrders from './pages/Admin/Orders';
import AdminPromoCodes from './pages/Admin/PromoCodes';
import AdminSubscriptions from './pages/Admin/Subscriptions';
import AdminSettings from './pages/Admin/Settings';

// Layout Wrapper Component to hide Navbar/Footer on Auth pages
const LayoutWrapper = ({ children }) => {
  const location = useLocation();
  const authRoutes = ['/login', '/register', '/restaurant/login', '/admin/login'];
  const showLayout = !authRoutes.includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen">
      {showLayout && <Navbar />}
      <main className="flex-grow">{children}</main>
      {showLayout && <Footer />}
    </div>
  );
};

// Beautiful Branded 404 page
const NotFound = () => (
  <div className="min-h-screen bg-amazon-dark flex flex-col items-center justify-center p-4 text-center text-white">
    <div className="space-y-4 max-w-sm">
      <h1 className="text-4xl font-extrabold text-amazon-orange">404 Error</h1>
      <h2 className="text-lg font-bold text-amazon-gold">Page Not Found</h2>
      <p className="text-xs text-gray-400">
        We couldn't find the page you were looking for on ShyamEats. Let's get you back to delicious meals!
      </p>
      <a href="/" className="btn-amazon text-xs inline-block w-full py-2.5">
        Back to ShyamEats Home
      </a>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <SocketProvider>
          <Router>
            <LayoutWrapper>
              <Routes>
                {/* --- Portal 1: Customer Portal --- */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/restaurants" element={<Restaurants />} />
                <Route path="/restaurant/:id" element={<RestaurantDetail />} />
                <Route path="/cart" element={<Cart />} />
                
                {/* Protected Customer Routes */}
                <Route path="/checkout" element={<ProtectedRoute allowedRoles={['user']}><Checkout /></ProtectedRoute>} />
                <Route path="/orders" element={<ProtectedRoute allowedRoles={['user']}><Orders /></ProtectedRoute>} />
                <Route path="/order/track/:id" element={<ProtectedRoute allowedRoles={['user']}><Track /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute allowedRoles={['user']}><Profile /></ProtectedRoute>} />
                <Route path="/subscription" element={<ProtectedRoute allowedRoles={['user']}><Subscription /></ProtectedRoute>} />

                {/* --- Portal 2: Restaurant Partner Portal --- */}
                <Route path="/restaurant/login" element={<Login />} />
                <Route path="/restaurant/dashboard" element={<ProtectedRoute allowedRoles={['restaurant']}><RestDashboard /></ProtectedRoute>} />
                <Route path="/restaurant/menu" element={<ProtectedRoute allowedRoles={['restaurant']}><RestMenu /></ProtectedRoute>} />
                <Route path="/restaurant/orders" element={<ProtectedRoute allowedRoles={['restaurant']}><RestOrders /></ProtectedRoute>} />
                <Route path="/restaurant/analytics" element={<ProtectedRoute allowedRoles={['restaurant']}><RestAnalytics /></ProtectedRoute>} />
                <Route path="/restaurant/profile" element={<ProtectedRoute allowedRoles={['restaurant']}><RestProfile /></ProtectedRoute>} />

                {/* --- Portal 3: Admin Portal --- */}
                <Route path="/admin/login" element={<Login />} />
                <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsers /></ProtectedRoute>} />
                <Route path="/admin/restaurants" element={<ProtectedRoute allowedRoles={['admin']}><AdminRestaurants /></ProtectedRoute>} />
                <Route path="/admin/orders" element={<ProtectedRoute allowedRoles={['admin']}><AdminOrders /></ProtectedRoute>} />
                <Route path="/admin/promo-codes" element={<ProtectedRoute allowedRoles={['admin']}><AdminPromoCodes /></ProtectedRoute>} />
                <Route path="/admin/subscriptions" element={<ProtectedRoute allowedRoles={['admin']}><AdminSubscriptions /></ProtectedRoute>} />
                <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['admin']}><AdminSettings /></ProtectedRoute>} />

                {/* Fallback 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </LayoutWrapper>
          </Router>
          {/* Toast Notification Container */}
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3500,
              style: {
                fontSize: '12px',
                fontWeight: 'bold',
                fontFamily: 'Inter, sans-serif'
              }
            }}
          />
        </SocketProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
