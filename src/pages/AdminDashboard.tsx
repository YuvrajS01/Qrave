import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ChefHat,
    LayoutDashboard,
    UtensilsCrossed,
    LogOut,
    Clock,
    Sparkles,
    Edit2,
    X
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { OrderCard } from '../../components/admin/OrderCard';
import { api } from '../services/api';
import * as db from '../../services/mockDb';
import * as gemini from '../../services/geminiService';
import { Restaurant, OrderStatus, MenuItem } from '../../types';

type AdminView = 'DASHBOARD' | 'MENU';

export const AdminDashboard = () => {
    const navigate = useNavigate();
    const [view, setView] = useState<AdminView>('DASHBOARD');
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);

    // Admin State
    const [newItemName, setNewItemName] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        const fetchRestaurantData = async () => {
            // For MVP, hardcode slug. In real app, get from auth context.
            const data = await api.getRestaurantBySlug('demo-restaurant');
            if (data) {
                // Fetch orders separately
                const orders = await api.getOrders(data.id);
                setRestaurant({ ...data, orders });
            }
        };
        fetchRestaurantData();
    }, []);

    // Realtime Orders
    useEffect(() => {
        if (restaurant?.id) {
            const subscription = api.subscribeToOrders(restaurant.id, (payload) => {
                if (payload.eventType === 'INSERT') {
                    // We need to fetch the full order with items, or just trigger a re-fetch
                    // For simplicity, let's re-fetch all orders (not efficient but safe)
                    api.getOrders(restaurant.id).then(orders => {
                        setRestaurant(prev => prev ? ({ ...prev, orders }) : null);
                    });
                } else if (payload.eventType === 'UPDATE') {
                    setRestaurant(prev => prev ? ({
                        ...prev,
                        orders: prev.orders.map(o => o.id === payload.new.id ? { ...o, status: payload.new.status } : o)
                    }) : null);
                }
            });

            return () => {
                subscription.unsubscribe();
            };
        }
    }, [restaurant?.id]);

    const handleAiGenerate = async () => {
        if (!newItemName || !restaurant) return;
        setIsGenerating(true);
        const details = await gemini.generateMenuItemDetails(newItemName);
        if (details) {
            const newItem: MenuItem = {
                id: `temp_${Date.now()}`, // DB will assign ID
                name: newItemName,
                ...details,
                imageUrl: `https://picsum.photos/seed/${newItemName.replace(/\s/g, '')}/400/300`,
                available: true
            };

            const success = await api.addMenuItem(newItem, restaurant.id);
            if (success) {
                // Refresh menu
                const updated = await api.getRestaurantBySlug('demo-restaurant');
                if (updated) {
                    // Keep existing orders
                    setRestaurant(prev => prev ? ({ ...prev, menu: updated.menu }) : null);
                }
                setNewItemName('');
            }
        }
        setIsGenerating(false);
    };

    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

    const handleUpdateItem = async () => {
        if (!editingItem || !restaurant) return;

        const success = await api.updateMenuItem(editingItem.id, editingItem);
        if (success) {
            setRestaurant(prev => prev ? ({
                ...prev,
                menu: prev.menu.map(item => item.id === editingItem.id ? editingItem : item)
            }) : null);
            setEditingItem(null);
        }
    };

    const handleStatusChange = async (orderId: string, status: OrderStatus) => {
        const success = await api.updateOrderStatus(orderId, status);
        if (success) {
            setRestaurant(prev => prev ? ({
                ...prev,
                orders: prev.orders.map(o => o.id === orderId ? { ...o, status } : o)
            }) : null);
        }
    };

    // Sort orders: Pending first, then active, then completed
    const sortedOrders = restaurant ? [...restaurant.orders].sort((a, b) => {
        const statusWeight = { [OrderStatus.PENDING]: 0, [OrderStatus.PREPARING]: 1, [OrderStatus.READY]: 2, [OrderStatus.COMPLETED]: 3, [OrderStatus.CANCELLED]: 4 };
        return statusWeight[a.status] - statusWeight[b.status] || b.timestamp - a.timestamp;
    }) : [];

    if (!restaurant) {
        return (
            <div className="min-h-screen bg-stone-50 flex items-center justify-center">
                <p className="text-stone-500">Loading restaurant data...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-stone-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-qrave-dark text-white p-6 hidden md:flex flex-col justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-10">
                        <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                            <ChefHat size={18} />
                        </div>
                        <h1 className="font-serif text-xl font-bold">Qrave Admin</h1>
                    </div>
                    <nav className="space-y-2">
                        <button
                            onClick={() => setView('DASHBOARD')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${view === 'DASHBOARD' ? 'bg-white/10 text-white' : 'text-stone-400 hover:text-white'}`}
                        >
                            <LayoutDashboard size={20} />
                            <span className="font-sans text-sm font-medium">Live Orders</span>
                        </button>
                        <button
                            onClick={() => setView('MENU')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${view === 'MENU' ? 'bg-white/10 text-white' : 'text-stone-400 hover:text-white'}`}
                        >
                            <UtensilsCrossed size={20} />
                            <span className="font-sans text-sm font-medium">Menu Manager</span>
                        </button>
                    </nav>
                </div>
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-3 px-4 py-3 text-stone-500 hover:text-white transition-colors"
                >
                    <LogOut size={18} />
                    <span className="text-sm">Logout</span>
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <header className="bg-white border-b border-stone-200 px-8 py-5 flex justify-between items-center sticky top-0 z-30">
                    <h2 className="font-serif text-2xl font-bold text-qrave-dark">
                        {view === 'DASHBOARD' ? 'Kitchen Display System' : 'Menu Management'}
                    </h2>
                    <div className="flex items-center gap-4">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-sm font-medium text-stone-500">System Operational</span>
                    </div>
                </header>

                <div className="p-8">
                    {view === 'DASHBOARD' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {sortedOrders.length === 0 ? (
                                <div className="col-span-full py-20 text-center text-stone-400">
                                    <Clock size={48} className="mx-auto mb-4 opacity-20" />
                                    <p>No active orders</p>
                                </div>
                            ) : (
                                sortedOrders.map(order => (
                                    <OrderCard
                                        key={order.id}
                                        order={order}
                                        onStatusChange={handleStatusChange}
                                    />
                                ))
                            )}
                        </div>
                    ) : (
                        <div className="max-w-4xl mx-auto">
                            <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 mb-8">
                                <h3 className="font-serif text-xl font-bold mb-4 flex items-center gap-2">
                                    <Sparkles className="text-purple-500" size={20} />
                                    AI Menu Generator
                                </h3>
                                <div className="flex gap-4">
                                    <input
                                        type="text"
                                        placeholder="e.g. Lobster Thermidor"
                                        className="flex-1 bg-stone-50 border-stone-200 rounded-xl px-4 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                        value={newItemName}
                                        onChange={(e) => setNewItemName(e.target.value)}
                                    />
                                    <Button
                                        onClick={handleAiGenerate}
                                        disabled={!newItemName}
                                        isLoading={isGenerating}
                                        className="bg-purple-600 hover:bg-purple-700 text-white"
                                    >
                                        Auto-Create
                                    </Button>
                                </div>
                                <p className="text-xs text-stone-400 mt-2">
                                    Powered by Gemini 2.5 Flash. Generates description, price, category, and image automatically.
                                </p>
                            </div>

                            <div className="space-y-4">
                                {restaurant?.menu.slice().reverse().map(item => (
                                    <div key={item.id} className="flex gap-4 bg-white p-4 rounded-xl border border-stone-200 items-center">
                                        <img src={item.imageUrl} className="w-16 h-16 rounded-lg object-cover bg-stone-100" />
                                        <div className="flex-1">
                                            <div className="flex justify-between">
                                                <h4 className="font-bold font-serif text-lg">{item.name}</h4>
                                                <div className="flex items-center gap-4">
                                                    <span className="font-mono text-stone-500">${item.price}</span>
                                                    <button
                                                        onClick={() => setEditingItem(item)}
                                                        className="p-2 hover:bg-stone-100 rounded-full text-stone-400 hover:text-qrave-dark transition-colors"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="text-sm text-stone-500 line-clamp-1">{item.description}</p>
                                            <div className="flex gap-2 mt-2">
                                                <span className="text-[10px] uppercase font-bold tracking-wider bg-stone-100 px-2 py-0.5 rounded text-stone-500">{item.category}</span>
                                                {item.isVegetarian && <span className="text-[10px] uppercase font-bold tracking-wider bg-green-100 px-2 py-0.5 rounded text-green-700">Veg</span>}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Edit Modal */}
            {editingItem && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="font-serif text-xl font-bold">Edit Item</h3>
                            <button onClick={() => setEditingItem(null)} className="p-2 hover:bg-stone-100 rounded-full">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-bold uppercase text-stone-400">Name</label>
                                <input
                                    className="w-full p-2 bg-stone-50 rounded-lg border-none focus:ring-2 focus:ring-qrave-accent"
                                    value={editingItem.name}
                                    onChange={e => setEditingItem({ ...editingItem, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase text-stone-400">Description</label>
                                <textarea
                                    className="w-full p-2 bg-stone-50 rounded-lg border-none focus:ring-2 focus:ring-qrave-accent resize-none"
                                    rows={3}
                                    value={editingItem.description || ''}
                                    onChange={e => setEditingItem({ ...editingItem, description: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold uppercase text-stone-400">Price</label>
                                    <input
                                        type="number"
                                        className="w-full p-2 bg-stone-50 rounded-lg border-none focus:ring-2 focus:ring-qrave-accent"
                                        value={editingItem.price}
                                        onChange={e => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase text-stone-400">Category</label>
                                    <input
                                        className="w-full p-2 bg-stone-50 rounded-lg border-none focus:ring-2 focus:ring-qrave-accent"
                                        value={editingItem.category}
                                        onChange={e => setEditingItem({ ...editingItem, category: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-4 pt-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={editingItem.isVegetarian}
                                        onChange={e => setEditingItem({ ...editingItem, isVegetarian: e.target.checked })}
                                        className="rounded text-qrave-accent focus:ring-qrave-accent"
                                    />
                                    <span className="text-sm font-medium">Vegetarian</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={editingItem.available}
                                        onChange={e => setEditingItem({ ...editingItem, available: e.target.checked })}
                                        className="rounded text-qrave-accent focus:ring-qrave-accent"
                                    />
                                    <span className="text-sm font-medium">Available</span>
                                </label>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button variant="secondary" onClick={() => setEditingItem(null)} className="flex-1">Cancel</Button>
                            <Button onClick={handleUpdateItem} className="flex-1">Save Changes</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
