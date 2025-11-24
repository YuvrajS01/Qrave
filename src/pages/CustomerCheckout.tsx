import React, { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Minus, Plus, CreditCard } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';
import * as db from '../../services/mockDb';
import { Order, OrderStatus } from '../../types';

export const CustomerCheckout = () => {
    const { slug } = useParams();
    const [searchParams] = useSearchParams();
    const tableNumber = parseInt(searchParams.get('table') || '0');
    const navigate = useNavigate();

    const { cart, addToCart, removeFromCart, clearCart, cartTotal } = useCart();
    const [customerNote, setCustomerNote] = useState('');

    const placeOrder = async () => {
        // We need the restaurant ID. For now, we'll fetch it again or pass it via context/params.
        // Ideally, we should have a RestaurantContext.
        // For this MVP, let's fetch the restaurant by slug to get the ID.
        if (!slug) return;

        const restaurant = await api.getRestaurantBySlug(slug);
        if (!restaurant) return;

        const newOrder: Order = {
            id: `temp_${Date.now()}`, // Will be replaced by DB ID
            tableNumber,
            items: cart,
            total: cartTotal,
            status: OrderStatus.PENDING,
            timestamp: Date.now(),
            customerNote
        };

        const orderId = await api.createOrder(newOrder, restaurant.id);
        if (orderId) {
            clearCart();
            navigate(`/r/${slug}/order/${orderId}?table=${tableNumber}`);
        }
    };

    const total = cartTotal;

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <header className="px-6 py-4 border-b border-stone-100 flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-stone-50 rounded-full">
                    <ArrowLeft size={24} />
                </button>
                <h2 className="font-serif text-2xl font-bold">Checkout</h2>
            </header>

            <main className="flex-1 overflow-y-auto p-6">
                <div className="space-y-6">
                    <div className="bg-stone-50 rounded-2xl p-4 space-y-4">
                        {cart.map(item => (
                            <div key={item.id} className="flex justify-between items-center">
                                <div className="flex-1">
                                    <p className="font-serif text-lg leading-none mb-1">{item.name}</p>
                                    <p className="font-sans text-sm text-stone-400">${item.price}</p>
                                </div>
                                <div className="flex items-center gap-3 bg-white rounded-full px-2 py-1 shadow-sm">
                                    <button onClick={() => removeFromCart(item.id)} className="p-1"><Minus size={14} /></button>
                                    <span className="font-sans font-medium w-4 text-center">{item.quantity}</span>
                                    <button onClick={() => addToCart(item)} className="p-1"><Plus size={14} /></button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-2">Special Requests</label>
                        <textarea
                            className="w-full p-3 bg-stone-50 rounded-xl border-none focus:ring-2 focus:ring-qrave-accent resize-none text-sm"
                            rows={3}
                            placeholder="Allergic to peanuts? Extra spicy?"
                            value={customerNote}
                            onChange={(e) => setCustomerNote(e.target.value)}
                        />
                    </div>

                    <div className="border-t border-dashed border-stone-200 pt-4 space-y-2">
                        <div className="flex justify-between text-stone-500 font-sans">
                            <span>Subtotal</span>
                            <span>${total.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-stone-500 font-sans">
                            <span>Taxes (10%)</span>
                            <span>${(total * 0.1).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-2xl font-serif font-bold text-qrave-dark pt-2">
                            <span>Total</span>
                            <span>${(total * 1.1).toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </main>

            <div className="p-6 border-t border-stone-100">
                <Button onClick={placeOrder} size="lg" className="w-full flex items-center justify-between group">
                    <span>Pay with Razorpay</span>
                    <div className="flex items-center gap-2">
                        <span className="font-mono text-white/80">${(total * 1.1).toFixed(2)}</span>
                        <CreditCard size={20} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                </Button>
            </div>
        </div>
    );
};
