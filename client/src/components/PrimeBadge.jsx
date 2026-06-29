import React from 'react';
import { ShieldCheck } from 'lucide-react';

const PrimeBadge = ({ showText = true, size = 16 }) => {
  return (
    <span className="inline-flex items-center space-x-1 text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded-full font-bold text-xs shadow-sm border border-blue-200">
      <ShieldCheck size={size} className="fill-blue-500 text-white" />
      {showText && <span>Prime</span>}
    </span>
  );
};

export default PrimeBadge;
