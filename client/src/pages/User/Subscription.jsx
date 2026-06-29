import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Check, Sparkles, AlertCircle, X, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

const BENEFITS = [
  'Unlimited FREE delivery on all orders above ₹100',
  'Priority order preparation and speed rider allocation',
  'Exclusive Prime-only discount coupons',
  'Early access to newly launched restaurant partners',
  'Exclusive ShyamEats Prime badge next to your profile name'
];

const Subscription = () => {
  const navigate = useNavigate();
  const { user, reloadSession } = useAuth();
  
  const [submitting, setSubmitting] = useState(false);
  const [showMockModal, setShowMockModal] = useState(false);
  const [pendingSubId, setPendingSubId] = useState(null);
  const [pendingPlan, setPendingPlan] = useState('');
  const [pendingPrice, setPendingPrice] = useState(0);

  const isPrime = user && user.isPrime && user.primeExpiry && new Date(user.primeExpiry) > new Date();

  const handleSubscribe = async (plan) => {
    if (!user) {
      toast.error('Please sign in to join ShyamEats Prime');
      navigate('/login?redirect=subscription');
      return;
    }

    setSubmitting(true);
    try {
      const response = await axios.post('/api/subscriptions', { plan });
      if (response.data.success) {
        const { subscription, price, razorpayKeyId } = response.data.data;
        
        // Since we are running locally and using mock keys, trigger simulated sandbox modal
        setPendingSubId(subscription._id);
        setPendingPlan(plan);
        setPendingPrice(price);
        setShowMockModal(true);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initialize subscription');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm('Are you sure you want to cancel your ShyamEats Prime subscription? You will lose all free delivery benefits immediately.')) return;

    setSubmitting(true);
    try {
      const response = await axios.post('/api/subscriptions/cancel');
      if (response.data.success) {
        toast.success('Your Prime membership has been cancelled.');
        await reloadSession();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel subscription.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSimulateSubscriptionPayment = async (success) => {
    if (!success) {
      toast.error('Simulated membership payment failed.');
      setShowMockModal(false);
      return;
    }

    try {
      // Trigger local developer mock webhook to activate Prime status
      const response = await axios.post('/api/webhook/razorpay/mock', {
        type: 'subscription',
        id: pendingSubId
      });

      if (response.data.success) {
        toast.success('✓ Welcome to ShyamEats Prime! Payment Confirmed.');
        await reloadSession(); // updates user isPrime state
        navigate('/profile');
      }
    } catch (err) {
      // fallback manual trigger
      try {
        const confirmRes = await axios.post('/api/subscriptions/confirm', {
          subscriptionId: pendingSubId
        });
        if (confirmRes.data.success) {
          toast.success('✓ Welcome to ShyamEats Prime!');
          await reloadSession();
          navigate('/profile');
        }
      } catch (error) {
        toast.error('Failed to confirm simulated subscription.');
      }
    } finally {
      setShowMockModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-amazon-bodyBg pb-16">
      
      {/* Banner Intro */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-amazon-dark text-white py-12 text-center border-b border-blue-900 shadow">
        <div className="max-w-4xl mx-auto px-4 space-y-4">
          <div className="inline-flex items-center space-x-1.5 text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-extrabold uppercase border border-blue-300">
            <ShieldCheck size={14} className="fill-blue-500 text-white" />
            <span>ShyamEats Premium Services</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            Unlock Unlimited <span className="text-blue-400">FREE Delivery</span>
          </h1>
          <p className="text-blue-200 text-sm md:text-base max-w-xl mx-auto">
            Supercharge your food orders with ShyamEats Prime. Say goodbye to delivery charges, surges, and priority delays.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        
        {/* Main plans layout */}
        {isPrime ? (
          /* Active Prime state card */
          <div className="bg-white rounded-lg border border-blue-200 shadow p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-3 text-center md:text-left">
              <div className="inline-flex items-center space-x-1 text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-bold border border-blue-200">
                <ShieldCheck size={14} className="fill-blue-500 text-white" />
                <span>Prime Active</span>
              </div>
              <h2 className="text-2xl font-extrabold text-gray-900">You are a ShyamEats Prime Member</h2>
              <p className="text-xs text-gray-500">
                Enjoying free delivery, priority support, and exclusive coupons on your account.
              </p>
            </div>
            
            <button
              onClick={handleCancelSubscription}
              disabled={submitting}
              className="px-5 py-2.5 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 rounded font-bold text-sm transition-colors shrink-0"
            >
              Cancel Membership
            </button>
          </div>
        ) : (
          /* Unsubscribed pricing list grids */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-2xl mx-auto">
            
            {/* Monthly Plan */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 flex flex-col justify-between shadow-sm relative group hover:border-gray-300 transition-all">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Monthly Plan</h3>
                  <p className="text-xs text-gray-500">Flexible month-to-month access</p>
                </div>
                <div className="flex items-baseline">
                  <span className="text-3xl font-extrabold text-gray-900">₹99</span>
                  <span className="text-xs text-gray-500 ml-1">/ month</span>
                </div>
                
                <hr className="border-gray-100" />
                
                <p className="text-xs text-gray-600 font-medium">Perfect to try out Prime benefits and save on your next few orders.</p>
              </div>

              <button
                onClick={() => handleSubscribe('monthly')}
                disabled={submitting}
                className="btn-amazon w-full py-2.5 mt-6 text-sm"
              >
                Join Monthly Prime
              </button>
            </div>

            {/* Yearly Plan (Highlighted Best Value) */}
            <div className="bg-white rounded-lg border-2 border-blue-500 p-6 flex flex-col justify-between shadow-md relative group hover:shadow-lg transition-all">
              {/* Best Value Ribbon */}
              <span className="absolute -top-3 right-6 bg-blue-600 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm flex items-center space-x-1">
                <Sparkles size={10} className="fill-current" />
                <span>Best Value (Save 41%)</span>
              </span>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-blue-600 flex items-center space-x-1">
                    <span>Yearly Super Saver</span>
                  </h3>
                  <p className="text-xs text-gray-500">Full 365 days of convenience</p>
                </div>
                <div className="flex items-baseline">
                  <span className="text-3xl font-extrabold text-gray-900">₹699</span>
                  <span className="text-xs text-gray-500 ml-1">/ year</span>
                  <span className="text-[10px] text-green-600 font-bold ml-2">(Save ₹489 vs monthly)</span>
                </div>
                
                <hr className="border-gray-100" />
                
                <p className="text-xs text-gray-600 font-medium">Ideal for frequent foodies. Get complete peace-of-mind delivery protection.</p>
              </div>

              <button
                onClick={() => handleSubscribe('yearly')}
                disabled={submitting}
                className="w-full btn-amazon py-2.5 mt-6 text-sm bg-blue-600 text-white hover:bg-blue-700 font-bold border border-transparent shadow"
              >
                Join Yearly Prime
              </button>
            </div>

          </div>
        )}

        {/* Benefits list section */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 md:p-8 space-y-6 max-w-2xl mx-auto">
          <h3 className="text-gray-900 font-extrabold text-base border-b border-gray-100 pb-3 text-center md:text-left">
            ShyamEats Prime Membership Benefits
          </h3>
          
          <ul className="space-y-4">
            {BENEFITS.map((benefit, idx) => (
              <li key={idx} className="flex items-start space-x-3 text-xs text-gray-700">
                <div className="h-5 w-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5 border border-blue-200">
                  <Check size={12} className="stroke-[3]" />
                </div>
                <span className="font-semibold leading-relaxed">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* Simulated subscription payment Sandbox Modal */}
      {showMockModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl border border-gray-200 max-w-sm w-full overflow-hidden animate-fade-in-down">
            <div className="bg-amazon-dark text-white p-4 flex items-center justify-between border-b border-gray-800">
              <span className="text-base font-extrabold text-blue-400 tracking-wide flex items-center">
                <ShieldCheck size={18} className="mr-1 fill-blue-500 text-white" /> Prime Terminal
              </span>
              <span className="text-[10px] bg-yellow-500 text-amazon-dark px-1.5 py-0.5 rounded font-extrabold uppercase">Sandbox</span>
            </div>
            
            <div className="p-6 space-y-4 text-center">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 mx-auto">
                <CreditCard size={24} />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500">Plan Option: {pendingPlan.toUpperCase()}</p>
                <h4 className="text-lg font-bold text-gray-900">Total Charged: ₹{pendingPrice}</h4>
              </div>
              <p className="text-xs text-gray-400">
                Simulate Razorpay hosted webhook triggers to activate your membership plan instantly.
              </p>

              <div className="flex space-x-3 pt-2">
                <button
                  onClick={() => handleSimulateSubscriptionPayment(false)}
                  className="w-1/2 py-2 border border-red-200 bg-red-50 text-red-700 rounded font-bold text-xs hover:bg-red-100 flex items-center justify-center space-x-1"
                >
                  <X size={14} />
                  <span>Simulate Fail</span>
                </button>
                <button
                  onClick={() => handleSimulateSubscriptionPayment(true)}
                  className="w-1/2 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold text-xs flex items-center justify-center space-x-1 animate-pulse"
                >
                  <Check size={14} className="stroke-[3]" />
                  <span>Simulate Pay</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Subscription;
