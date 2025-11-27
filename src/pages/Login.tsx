import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChefHat, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { api } from '../services/api';

export const Login = () => {
    const navigate = useNavigate();
    const [slug, setSlug] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // Hardcoded Superadmin Login
            if (slug === 'superadmin' && password === 'admin123') {
                localStorage.setItem('qrave_superadmin', 'true');
                navigate('/super-admin');
                return;
            }

            const restaurant = await api.login(slug, password);
            if (restaurant) {
                localStorage.setItem('qrave_user', JSON.stringify(restaurant));
                navigate(`/admin/${restaurant.slug}`);
            }
        } catch (err) {
            setError('Invalid credentials');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl shadow-stone-200/50 w-full max-w-md border border-stone-100">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-qrave-dark text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-stone-300">
                        <ChefHat size={32} />
                    </div>
                    <h1 className="font-serif text-3xl font-bold text-qrave-dark mb-2">Restaurant Login</h1>
                    <p className="text-stone-500">Access your kitchen dashboard</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold uppercase text-stone-400 mb-1">Restaurant Slug</label>
                        <input
                            type="text"
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            className="w-full p-3 bg-stone-50 border-stone-200 rounded-xl focus:ring-2 focus:ring-qrave-dark focus:outline-none transition-all"
                            placeholder="e.g. demo-restaurant"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-stone-400 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 bg-stone-50 border-stone-200 rounded-xl focus:ring-2 focus:ring-qrave-dark focus:outline-none transition-all"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center font-medium">
                            {error}
                        </div>
                    )}

                    <Button type="submit" className="w-full py-4 text-lg" isLoading={isLoading}>
                        Login <ArrowRight size={20} className="ml-2" />
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <a href="/" className="text-sm text-stone-400 hover:text-qrave-dark transition-colors">
                        Back to Home
                    </a>
                </div>
            </div>
        </div>
    );
};
