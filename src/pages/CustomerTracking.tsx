import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Clock, ChefHat, CheckCircle, ArrowLeft, UtensilsCrossed, Receipt } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { api } from '../services/api';
import * as db from '../services/mockDb';
import { Order, OrderStatus } from '../types';

export const CustomerTracking = () => {
    const { slug, orderId } = useParams();
    const [searchParams] = useSearchParams();
    const tableNumber = searchParams.get('table') || '0';
    const navigate = useNavigate();

    const [activeOrder, setActiveOrder] = useState<Order | null>(null);

    useEffect(() => {
        const fetchOrder = async () => {
            if (orderId) {
                const order = await api.getOrder(orderId);
                if (order) setActiveOrder(order);
            }
        };
        fetchOrder();
    }, [orderId]);

    // Realtime Subscription
    useEffect(() => {
        if (orderId && activeOrder && (activeOrder.status !== OrderStatus.COMPLETED && activeOrder.status !== OrderStatus.CANCELLED)) {
            const subscription = api.subscribeToOrder(orderId, (payload) => {
                if (payload.new) {
                    setActiveOrder(prev => prev ? { ...prev, status: payload.new.status } : null);
                }
            });

            return () => {
                subscription.unsubscribe();
            };
        }
    }, [orderId, activeOrder]);

    if (!activeOrder) return <div>Loading Order...</div>;

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <header className="px-4 md:px-6 py-4 border-b border-stone-100 flex items-center gap-4 sticky top-0 bg-white z-30">
                <button onClick={() => navigate(`/r/${slug}?table=${tableNumber}`)} className="p-2 -ml-2 hover:bg-stone-50 rounded-full transition-colors">
                    <ArrowLeft size={24} className="text-qrave-dark" />
                </button>
                <h2 className="font-serif text-xl md:text-2xl font-bold text-qrave-dark">Order Status</h2>
            </header>

            <main className="flex-1 overflow-y-auto p-4 md:p-6">
                <div className="max-w-xl mx-auto space-y-8">
                    <div className="text-center space-y-2">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Clock size={40} className="text-green-600" />
                        </div>
                        <h3 className="font-serif text-2xl font-bold text-qrave-dark">
                            {activeOrder.status === OrderStatus.PENDING && "Order Sent!"}
                            {activeOrder.status === OrderStatus.PREPARING && "Cooking..."}
                            {activeOrder.status === OrderStatus.READY && "Ready to Serve!"}
                            {activeOrder.status === OrderStatus.COMPLETED && "Enjoy!"}
                        </h3>
                        <p className="text-stone-500">Order #{activeOrder.id.slice(-4)}</p>
                    </div>

                    <div className="bg-stone-50 rounded-2xl p-6 space-y-6">
                        <div className="flex items-center gap-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeOrder.status === OrderStatus.PENDING ? 'bg-orange-500 text-white' : 'bg-green-500 text-white'}`}>
                                <CheckCircle size={16} />
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-qrave-dark">Order Received</p>
                                <p className="text-xs text-stone-400">We've got your order</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeOrder.status === OrderStatus.PREPARING || activeOrder.status === OrderStatus.READY || activeOrder.status === OrderStatus.COMPLETED
                                ? 'bg-orange-500 text-white'
                                : 'bg-stone-200 text-stone-400'
                                }`}>
                                <ChefHat size={16} />
                            </div>
                            <div className="flex-1">
                                <p className={`font-bold ${activeOrder.status === OrderStatus.PENDING ? 'text-stone-400' : 'text-qrave-dark'}`}>Preparing</p>
                                <p className="text-xs text-stone-400">Chef is working on it</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeOrder.status === OrderStatus.READY || activeOrder.status === OrderStatus.COMPLETED
                                ? 'bg-green-500 text-white'
                                : 'bg-stone-200 text-stone-400'
                                }`}>
                                <UtensilsCrossed size={16} />
                            </div>
                            <div className="flex-1">
                                <p className={`font-bold ${activeOrder.status === OrderStatus.READY || activeOrder.status === OrderStatus.COMPLETED ? 'text-qrave-dark' : 'text-stone-400'}`}>Ready to Serve</p>
                                <p className="text-xs text-stone-400">Coming to your table</p>
                            </div>
                        </div>
                    </div>

                    <Button onClick={() => navigate(`/r/${slug}?table=${tableNumber}`)} variant="secondary" className="w-full py-4">
                        Order More Items
                    </Button>

                    {(activeOrder.status === OrderStatus.READY || activeOrder.status === OrderStatus.COMPLETED) && (
                        <Button onClick={() => navigate(`/r/${slug}/orders/${orderId}/invoice`)} variant="outline" className="w-full py-4 flex items-center justify-center gap-2">
                            <Receipt size={20} />
                            View Invoice
                        </Button>
                    )}
                </div>
            </main>
        </div>
    );
};
