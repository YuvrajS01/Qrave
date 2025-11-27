import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, ExternalLink, Utensils } from 'lucide-react';
import { api } from '../services/api';
import { Button } from '../../components/ui/Button';

interface Restaurant {
    id: string;
    name: string;
    slug: string;
    _count?: {
        orders: number;
        menu: number;
    };
}

export const SuperAdmin = () => {
    const navigate = useNavigate();
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [newRestaurant, setNewRestaurant] = useState({ name: '', slug: '', password: '' });

    useEffect(() => {
        loadRestaurants();
    }, []);

    const loadRestaurants = async () => {
        const data = await api.getRestaurants();
        setRestaurants(data);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newRestaurant.name || !newRestaurant.slug) return;

        try {
            await api.createRestaurant(newRestaurant);
            setNewRestaurant({ name: '', slug: '', password: '' });
            setIsCreating(false);
            loadRestaurants();
        } catch (error) {
            alert('Failed to create restaurant');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure? This will delete the restaurant and all its data.')) return;
        try {
            await api.deleteRestaurant(id);
            loadRestaurants();
        } catch (error) {
            alert('Failed to delete restaurant');
        }
    };

    return (
        <div className="min-h-screen bg-stone-50 p-8">
            <div className="max-w-5xl mx-auto">
                <header className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="font-serif text-4xl font-bold text-qrave-dark mb-2">Super Admin</h1>
                        <p className="text-stone-500">Manage all restaurants on the platform</p>
                    </div>
                    <Button onClick={() => setIsCreating(true)} className="flex items-center gap-2">
                        <Plus size={20} /> Add Restaurant
                    </Button>
                </header>

                {isCreating && (
                    <div className="mb-8 bg-white p-6 rounded-2xl shadow-sm border border-stone-200 animate-in fade-in slide-in-from-top-4">
                        <h3 className="font-bold text-lg mb-4">New Restaurant</h3>
                        <form onSubmit={handleCreate} className="flex gap-4 items-end">
                            <div className="flex-1">
                                <label className="block text-xs font-bold uppercase text-stone-400 mb-1">Name</label>
                                <input
                                    type="text"
                                    value={newRestaurant.name}
                                    onChange={e => setNewRestaurant({ ...newRestaurant, name: e.target.value })}
                                    className="w-full p-2 border border-stone-200 rounded-lg"
                                    placeholder="e.g. The Burger Joint"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs font-bold uppercase text-stone-400 mb-1">Slug</label>
                                <input
                                    type="text"
                                    value={newRestaurant.slug}
                                    onChange={e => setNewRestaurant({ ...newRestaurant, slug: e.target.value })}
                                    className="w-full p-2 border border-stone-200 rounded-lg"
                                    placeholder="e.g. burger-joint"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs font-bold uppercase text-stone-400 mb-1">Password</label>
                                <input
                                    type="password"
                                    value={newRestaurant.password}
                                    onChange={e => setNewRestaurant({ ...newRestaurant, password: e.target.value })}
                                    className="w-full p-2 border border-stone-200 rounded-lg"
                                    placeholder="Optional"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button type="button" variant="ghost" onClick={() => setIsCreating(false)}>Cancel</Button>
                                <Button type="submit">Create</Button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {restaurants.map(restaurant => (
                        <div key={restaurant.id} className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 hover:shadow-md transition-shadow group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 bg-stone-100 rounded-xl flex items-center justify-center text-stone-400 group-hover:bg-qrave-dark group-hover:text-white transition-colors">
                                    <Utensils size={24} />
                                </div>
                                <button
                                    onClick={() => handleDelete(restaurant.id)}
                                    className="p-2 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            <h3 className="font-serif text-xl font-bold text-qrave-dark mb-1">{restaurant.name}</h3>
                            <p className="text-sm text-stone-400 font-mono mb-6">/r/{restaurant.slug}</p>

                            <div className="flex gap-4 text-sm text-stone-500 mb-6">
                                <div>
                                    <span className="font-bold text-qrave-dark">{restaurant._count?.menu || 0}</span> Items
                                </div>
                                <div>
                                    <span className="font-bold text-qrave-dark">{restaurant._count?.orders || 0}</span> Orders
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    onClick={() => window.open(`/r/${restaurant.slug}`, '_blank')}
                                    variant="outline"
                                    className="flex-1 flex items-center justify-center gap-2"
                                >
                                    Visit <ExternalLink size={16} />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
