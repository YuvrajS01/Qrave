import React from 'react';
import { MenuItem } from '../../src/types';
import { Plus, Leaf, Flame } from 'lucide-react';
import { motion } from 'framer-motion';

interface MenuCardProps {
  item: MenuItem;
  onAdd: (item: MenuItem) => void;
  index: number;
}

export const MenuCard: React.FC<MenuCardProps> = ({ item, onAdd, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="group relative flex gap-4 p-4 bg-white rounded-2xl border border-transparent hover:border-stone-200 hover:shadow-xl hover:shadow-stone-200/50 transition-all duration-300"
    >
      {/* Image Container */}
      <div className="shrink-0 w-28 h-28 rounded-xl overflow-hidden bg-stone-100 relative">
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {(item.isVegetarian || item.isSpicy) && (
          <div className="absolute top-2 left-2 flex gap-1">
            {item.isVegetarian && <div className="bg-green-100 p-1 rounded-full"><Leaf size={12} className="text-green-700" /></div>}
            {item.isSpicy && <div className="bg-red-100 p-1 rounded-full"><Flame size={12} className="text-red-600" /></div>}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-serif text-lg font-semibold text-qrave-dark leading-tight mb-1">{item.name}</h3>
          <p className="text-sm text-stone-500 font-sans line-clamp-2 leading-relaxed">{item.description}</p>
        </div>

        <div className="flex items-center justify-between mt-3">
          <span className="font-sans font-medium text-qrave-dark">${item.price}</span>
          <button
            onClick={() => onAdd(item)}
            className="w-8 h-8 rounded-full bg-stone-100 text-qrave-dark flex items-center justify-center hover:bg-qrave-dark hover:text-white transition-colors"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
