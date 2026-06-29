import React, { createContext, useContext, useReducer, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

const CartContext = createContext();

const loadCartState = () => {
  try {
    const saved = localStorage.getItem('cart');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        cartItems: parsed.cartItems || [],
        restaurantId: parsed.restaurantId || null,
        restaurantName: parsed.restaurantName || '',
        promoCode: parsed.promoCode || null,
        discount: parsed.discount || 0
      };
    }
  } catch (error) {
    console.error('Failed to load cart from localStorage:', error);
  }
  return {
    cartItems: [],
    restaurantId: null,
    restaurantName: '',
    promoCode: null,
    discount: 0
  };
};

function cartReducer(state, action) {
  let updatedItems = [];

  switch (action.type) {
    case 'ADD_TO_CART': {
      const { item, restaurant } = action.payload;

      // Check if item belongs to the same restaurant
      if (state.restaurantId && state.restaurantId !== restaurant._id) {
        // Different restaurant, require cart reset. We handle this warning in the MenuItem component.
        return state;
      }

      const existingItemIndex = state.cartItems.findIndex(i => i._id === item._id);

      if (existingItemIndex > -1) {
        updatedItems = [...state.cartItems];
        updatedItems[existingItemIndex].qty += 1;
      } else {
        updatedItems = [...state.cartItems, { ...item, qty: 1 }];
      }

      return {
        ...state,
        cartItems: updatedItems,
        restaurantId: restaurant._id,
        restaurantName: restaurant.name
      };
    }

    case 'REMOVE_FROM_CART': {
      const { itemId } = action.payload;
      const existingItemIndex = state.cartItems.findIndex(i => i._id === itemId);

      if (existingItemIndex === -1) return state;

      updatedItems = [...state.cartItems];
      if (updatedItems[existingItemIndex].qty > 1) {
        updatedItems[existingItemIndex].qty -= 1;
      } else {
        updatedItems.splice(existingItemIndex, 1);
      }

      const hasItems = updatedItems.length > 0;

      return {
        ...state,
        cartItems: updatedItems,
        restaurantId: hasItems ? state.restaurantId : null,
        restaurantName: hasItems ? state.restaurantName : '',
        promoCode: hasItems ? state.promoCode : null,
        discount: hasItems ? state.discount : 0
      };
    }

    case 'CLEAR_CART':
      return {
        cartItems: [],
        restaurantId: null,
        restaurantName: '',
        promoCode: null,
        discount: 0
      };

    case 'APPLY_PROMO':
      return {
        ...state,
        promoCode: action.payload.code,
        discount: action.payload.discount
      };

    case 'REMOVE_PROMO':
      return {
        ...state,
        promoCode: null,
        discount: 0
      };

    default:
      return state;
  }
}

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(cartReducer, null, loadCartState);

  // Sync cart with local storage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(state));
  }, [state]);

  // Recalculate totals
  const subtotal = state.cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);

  // Prime delivery fee logic
  const getDeliveryFee = (restaurantFee) => {
    if (!user) return restaurantFee || 40;
    const isPrime = user.isPrime && user.primeExpiry && new Date(user.primeExpiry) > new Date();
    return isPrime ? 0 : (restaurantFee || 40);
  };

  const addToCart = (item, restaurant) => {
    // If cart has items from another restaurant, show confirmation toast
    if (state.restaurantId && state.restaurantId !== restaurant._id) {
      if (window.confirm(`Your cart contains items from '${state.restaurantName}'. Clear cart and add from '${restaurant.name}'?`)) {
        dispatch({ type: 'CLEAR_CART' });
        dispatch({ type: 'ADD_TO_CART', payload: { item, restaurant } });
        toast.success(`Cleared old cart and added '${item.name}'`);
      }
    } else {
      dispatch({ type: 'ADD_TO_CART', payload: { item, restaurant } });
      toast.success(`Added '${item.name}' to cart`);
    }
  };

  const removeFromCart = (itemId) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: { itemId } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const applyPromo = (code, discount) => {
    dispatch({ type: 'APPLY_PROMO', payload: { code, discount } });
  };

  const removePromo = () => {
    dispatch({ type: 'REMOVE_PROMO' });
  };

  return (
    <CartContext.Provider value={{
      ...state,
      subtotal,
      getDeliveryFee,
      addToCart,
      removeFromCart,
      clearCart,
      applyPromo,
      removePromo
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
