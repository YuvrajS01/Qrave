import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { UtensilsCrossed, ArrowLeft } from 'lucide-react';
import { MenuCard } from '../../components/customer/MenuCard';
import { CartDrawer } from '../../components/customer/CartDrawer';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';
import * as db from "../services/mockDb";
import { Restaurant } from '../types';

export const CustomerMenu = () => {
    const { slug } = useParams();
    const [searchParams] = useSearchParams();
    const tableNumber = searchParams.get('table') || '0';
    const navigate = useNavigate();

    const { cart, addToCart } = useCart();
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);

    useEffect(() => {
        const fetchRestaurant = async () => {
            if (slug) {
                const data = await api.getRestaurantBySlug(slug); // Changed from db.getRestaurantBySlug to api.getRestaurantBySlug
                if (data) {
                    setRestaurant(data);
                }
            }
        };
        fetchRestaurant();
    }, [slug]);

    if (!restaurant) return <div className="min-h-screen flex items-center justify-center text-qrave-dark font-serif text-xl">Loading Menu...</div>; // Updated loading message

    const categories = db.getMenuByCategory(restaurant.menu); // Changed from db.getMenuByCategory to api.getMenuByCategory

    return (
        <div className="min-h-screen bg-qrave-base pb-32">
            <header className="sticky top-0 z-40 bg-qrave-base/95 backdrop-blur-md px-4 md:px-6 py-4 border-b border-stone-200/50 flex justify-between items-center transition-all duration-300">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/')} className="p-2 -ml-2 hover:bg-black/5 rounded-full transition-colors">
                        <ArrowLeft size={20} className="text-qrave-dark" />
                    </button>
                    <div>
                        <h1 className="font-serif text-xl md:text-2xl font-bold text-qrave-dark leading-none">{restaurant.name}</h1>
                        <p className="text-xs md:text-sm font-sans text-stone-500">Table {tableNumber}</p>
                    </div>
                </div>
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <UtensilsCrossed size={18} className="text-qrave-dark" />
                </div>
            </header>

            <main className="p-4 md:p-6 space-y-8 max-w-5xl mx-auto">
                {Object.entries(categories).map(([category, items]) => (
                    <section key={category}>
                        <h2 className="font-sans text-xs font-bold uppercase tracking-widest text-stone-400 mb-4 ml-1">{category}</h2>
                        <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4">
                            {items.map((item, idx) => (
                                <MenuCard key={item.id} item={item} index={idx} onAdd={addToCart} />
                            ))}
                        </div>
                    </section>
                ))}
            </main>

            <CartDrawer items={cart} onCheckout={() => navigate(`/r/${slug}/checkout?table=${tableNumber}`)} />
        </div>
    );
};
