import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';
import { MenuItem } from '../../src/types';

interface MenuItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (item: Partial<MenuItem>) => Promise<void>;
    initialData?: MenuItem | null;
}

const DEFAULT_ITEM: Partial<MenuItem> = {
    name: '',
    description: '',
    price: 0,
    category: 'Mains',
    imageUrl: '',
    isVegetarian: false,
    isSpicy: false,
    available: true
};

export const MenuItemModal: React.FC<MenuItemModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
    const [formData, setFormData] = useState<Partial<MenuItem>>(DEFAULT_ITEM);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setFormData(initialData || DEFAULT_ITEM);
        }
    }, [isOpen, initialData]);

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error('Failed to save item:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4 shadow-xl">
                <div className="flex justify-between items-center border-b border-stone-100 pb-4">
                    <h3 className="font-serif text-xl font-bold text-qrave-dark">
                        {initialData ? 'Edit Item' : 'Add New Item'}
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-400 hover:text-qrave-dark">
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    <div>
                        <label className="block text-xs font-bold uppercase text-stone-400 mb-1">Name</label>
                        <input
                            className="w-full p-3 bg-stone-50 rounded-xl border-none focus:ring-2 focus:ring-qrave-accent transition-all"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. Truffle Pizza"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-stone-400 mb-1">Description</label>
                        <textarea
                            className="w-full p-3 bg-stone-50 rounded-xl border-none focus:ring-2 focus:ring-qrave-accent resize-none transition-all"
                            rows={3}
                            value={formData.description || ''}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Describe the dish..."
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold uppercase text-stone-400 mb-1">Price</label>
                            <input
                                type="number"
                                className="w-full p-3 bg-stone-50 rounded-xl border-none focus:ring-2 focus:ring-qrave-accent transition-all"
                                value={formData.price}
                                onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-stone-400 mb-1">Category</label>
                            <input
                                className="w-full p-3 bg-stone-50 rounded-xl border-none focus:ring-2 focus:ring-qrave-accent transition-all"
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                                placeholder="e.g. Starters"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-stone-400 mb-1">Image URL</label>
                        <input
                            className="w-full p-3 bg-stone-50 rounded-xl border-none focus:ring-2 focus:ring-qrave-accent transition-all"
                            value={formData.imageUrl || ''}
                            onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                            placeholder="https://..."
                        />
                    </div>
                    <div className="flex gap-6 pt-2">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={formData.isVegetarian}
                                onChange={e => setFormData({ ...formData, isVegetarian: e.target.checked })}
                                className="w-5 h-5 rounded text-qrave-accent focus:ring-qrave-accent border-stone-300"
                            />
                            <span className="text-sm font-medium text-stone-600 group-hover:text-qrave-dark transition-colors">Vegetarian</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={formData.available}
                                onChange={e => setFormData({ ...formData, available: e.target.checked })}
                                className="w-5 h-5 rounded text-qrave-accent focus:ring-qrave-accent border-stone-300"
                            />
                            <span className="text-sm font-medium text-stone-600 group-hover:text-qrave-dark transition-colors">Available</span>
                        </label>
                    </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-stone-100">
                    <Button variant="ghost" onClick={onClose} className="flex-1">Cancel</Button>
                    <Button onClick={handleSubmit} className="flex-1" isLoading={isLoading}>
                        {initialData ? 'Save Changes' : 'Create Item'}
                    </Button>
                </div>
            </div>
        </div>
    );
};
