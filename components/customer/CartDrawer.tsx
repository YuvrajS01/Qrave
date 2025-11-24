import React from 'react';
import { CartItem } from '../../types';
import { ShoppingBag, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CartDrawerProps {
  items: CartItem[];
  onCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ items, onCheckout }) => {
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <AnimatePresence>
      {totalItems > 0 && (
        <motion.div 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          className="fixed bottom-6 left-4 right-4 z-50 max-w-md mx-auto"
        >
          <button 
            onClick={onCheckout}
            className="w-full bg-qrave-dark text-white p-4 rounded-2xl shadow-2xl shadow-black/20 flex items-center justify-between group overflow-hidden relative"
          >
            {/* Background pattern effect */}
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="flex items-center gap-3 relative z-10">
              <div className="bg-white/20 w-10 h-10 rounded-full flex items-center justify-center font-sans font-bold text-sm">
                {totalItems}
              </div>
              <div className="text-left">
                <p className="text-xs text-stone-300 font-sans uppercase tracking-wider">Total</p>
                <p className="font-sans font-bold text-lg leading-none">${totalPrice.toFixed(2)}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 relative z-10 pr-2">
              <span className="font-sans font-medium text-sm">View Order</span>
              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
