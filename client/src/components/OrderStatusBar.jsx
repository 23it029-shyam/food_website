import React from 'react';
import { Check, ClipboardList, CheckSquare, ChefHat, Truck, Utensils } from 'lucide-react';

const STEPS = [
  { id: 'Placed', label: 'Placed', icon: ClipboardList, desc: 'We received your order' },
  { id: 'Confirmed', label: 'Confirmed', icon: CheckSquare, desc: 'Restaurant confirmed' },
  { id: 'Preparing', label: 'Preparing', icon: ChefHat, desc: 'Chef cooking your food' },
  { id: 'Out for Delivery', label: 'Out for Delivery', icon: Truck, desc: 'Rider is on the way' },
  { id: 'Delivered', label: 'Delivered', icon: Utensils, desc: 'Enjoy your food!' }
];

const OrderStatusBar = ({ currentStatus }) => {
  // Find current step index
  const currentIndex = STEPS.findIndex(step => step.id === currentStatus);

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <h3 className="text-gray-900 font-extrabold text-base mb-6 flex items-center justify-between">
        <span>Order Track Status</span>
        <span className="text-xs bg-amazon-orange text-amazon-dark px-2.5 py-0.5 rounded-full font-bold">
          {currentStatus}
        </span>
      </h3>

      {/* Horizontal Steps (Desktop) */}
      <div className="hidden md:flex items-center justify-between relative w-full pt-4 pb-8">
        
        {/* Background connector line */}
        <div className="absolute top-9 left-6 right-6 h-1 bg-gray-200 z-0"></div>
        {/* Active connector line */}
        <div
          className="absolute top-9 left-6 h-1 bg-amazon-orange z-0 transition-all duration-500"
          style={{ width: `${(currentIndex / (STEPS.length - 1)) * 100}%` }}
        ></div>

        {STEPS.map((step, idx) => {
          const isCompleted = idx < currentIndex;
          const isActive = idx === currentIndex;
          const isPending = idx > currentIndex;
          
          const Icon = step.icon;

          return (
            <div key={step.id} className="flex flex-col items-center relative z-10 w-24 text-center">
              {/* Step Circle */}
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center border-4 transition-all duration-300 ${
                  isCompleted
                    ? 'bg-amazon-orange border-amazon-orange text-amazon-dark'
                    : isActive
                    ? 'bg-amazon-dark border-amazon-orange text-amazon-orange animate-pulse'
                    : 'bg-white border-gray-300 text-gray-400'
                }`}
              >
                {isCompleted ? <Check size={18} className="stroke-[3]" /> : <Icon size={16} />}
              </div>

              {/* Step Label */}
              <span className={`text-xs font-bold mt-2.5 ${isActive ? 'text-amazon-orange' : 'text-gray-700'}`}>
                {step.label}
              </span>
              <span className="text-[10px] text-gray-400 mt-0.5">
                {step.desc}
              </span>
            </div>
          );
        })}
      </div>

      {/* Vertical Steps (Mobile) */}
      <div className="md:hidden flex flex-col space-y-6 relative pl-6">
        {/* Connector Line */}
        <div className="absolute left-2.5 top-2 bottom-2 w-1 bg-gray-200 z-0"></div>
        {/* Active Connector Line */}
        <div
          className="absolute left-2.5 top-2 w-1 bg-amazon-orange z-0 transition-all duration-500"
          style={{ height: `${(currentIndex / (STEPS.length - 1)) * 100}%` }}
        ></div>

        {STEPS.map((step, idx) => {
          const isCompleted = idx < currentIndex;
          const isActive = idx === currentIndex;
          const isPending = idx > currentIndex;
          
          const Icon = step.icon;

          return (
            <div key={step.id} className="flex items-start relative z-10 space-x-4">
              {/* Step Circle */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center border-2 flex-shrink-0 transition-all duration-300 ${
                  isCompleted
                    ? 'bg-amazon-orange border-amazon-orange text-amazon-dark'
                    : isActive
                    ? 'bg-amazon-dark border-amazon-orange text-amazon-orange animate-pulse'
                    : 'bg-white border-gray-300 text-gray-400'
                }`}
              >
                {isCompleted ? <Check size={12} className="stroke-[3]" /> : <Icon size={12} />}
              </div>

              {/* Text labels */}
              <div className="flex flex-col">
                <span className={`text-xs font-bold leading-none ${isActive ? 'text-amazon-orange' : 'text-gray-800'}`}>
                  {step.label}
                </span>
                <span className="text-[10px] text-gray-400 mt-1">
                  {step.desc}
                </span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default OrderStatusBar;
