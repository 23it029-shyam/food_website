import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { Ticket, X, Check } from 'lucide-react';

const PromoInput = () => {
  const { subtotal, promoCode, discount, applyPromo, removePromo, getDeliveryFee } = useCart();
  
  const [codeText, setCodeText] = useState('');
  const [message, setMessage] = useState({ text: '', isError: false });
  const [isValidating, setIsValidating] = useState(false);

  // Sync input text if code is already applied (e.g. from local storage restore)
  useEffect(() => {
    if (promoCode) {
      setCodeText(promoCode);
      setMessage({
        text: `✓ ${promoCode} applied! You save ₹${discount.toFixed(2)}`,
        isError: false
      });
    } else {
      setCodeText('');
      setMessage({ text: '', isError: false });
    }
  }, [promoCode, discount]);

  const validateCode = async (codeValue) => {
    const trimmedCode = codeValue.trim().toUpperCase();
    if (!trimmedCode) return;

    setIsValidating(true);
    setMessage({ text: '', isError: false });

    try {
      // Fetch delivery fee to support FREE_DELIVERY promo codes
      const dummyRestFee = 45; // Default reference
      const finalDelFee = getDeliveryFee(dummyRestFee);

      const response = await axios.post('/api/promo/validate', {
        code: trimmedCode,
        cartTotal: subtotal,
        deliveryFee: finalDelFee
      });

      if (response.data.success) {
        const { code, discount: discAmt } = response.data.data;
        applyPromo(code, discAmt);
        setMessage({
          text: `✓ ${code} applied! You save ₹${discAmt.toFixed(2)}`,
          isError: false
        });
      }
    } catch (error) {
      removePromo();
      setMessage({
        text: error.response?.data?.message || 'Invalid coupon code.',
        isError: true
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleApplyClick = (e) => {
    e.preventDefault();
    validateCode(codeText);
  };

  const handleBlur = () => {
    if (codeText.trim() && (!promoCode || codeText.toUpperCase() !== promoCode.toUpperCase())) {
      validateCode(codeText);
    }
  };

  const handleRemove = () => {
    removePromo();
    setCodeText('');
    setMessage({ text: '', isError: false });
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm space-y-3">
      <div className="flex items-center space-x-2 text-gray-800 font-bold text-sm">
        <Ticket size={16} className="text-amazon-orange" />
        <span>Have a promo code?</span>
      </div>

      <div className="flex space-x-2">
        <input
          type="text"
          placeholder="ENTER CODE"
          value={codeText}
          onChange={(e) => setCodeText(e.target.value)}
          onBlur={handleBlur}
          disabled={!!promoCode || isValidating}
          className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm uppercase tracking-wider font-semibold focus:outline-none focus:border-amazon-orange focus:ring-1 focus:ring-amazon-orange disabled:bg-gray-50 disabled:text-gray-500"
        />

        {promoCode ? (
          <button
            onClick={handleRemove}
            className="px-3 bg-red-50 text-red-600 hover:bg-red-100 rounded border border-red-200 text-xs font-bold transition-all flex items-center space-x-1"
          >
            <X size={14} />
            <span>Remove</span>
          </button>
        ) : (
          <button
            onClick={handleApplyClick}
            disabled={!codeText.trim() || isValidating}
            className="px-4 bg-amazon-orange hover:bg-amazon-orangeHover disabled:bg-gray-100 disabled:text-gray-400 text-amazon-dark font-bold text-xs rounded border border-transparent transition-all"
          >
            {isValidating ? '...' : 'Apply'}
          </button>
        )}
      </div>

      {/* API validation response status message */}
      {message.text && (
        <p className={`text-xs font-semibold mt-1 flex items-center ${message.isError ? 'text-red-600' : 'text-green-600'}`}>
          {!message.isError && <Check size={12} className="mr-1 inline stroke-[3]" />}
          {message.text}
        </p>
      )}
    </div>
  );
};

export default PromoInput;
