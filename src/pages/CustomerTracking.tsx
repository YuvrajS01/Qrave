import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Clock, ChefHat, CheckCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { api } from '../services/api';
import * as db from '../../services/mockDb';
import { Order, OrderStatus } from '../../types';

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

    const steps = [
        { status: OrderStatus.PENDING, label: "Order Sent", icon: Clock },
        { status: OrderStatus.PREPARING, label: "Kitchen Preparing", icon: ChefHat },
        { status: OrderStatus.READY, label: "Ready to Serve", icon: CheckCircle },
    ];

    const isCompleted = activeOrder.status === OrderStatus.COMPLETED;

    return (
        <div className="min-h-screen bg-qrave-dark text-white p-6 flex flex-col items-center justify-center relative overflow-hidden">
            {/* Background Animation */}
            <div className="absolute inset-0 opacity-20">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-600 blur-[120px] rounded-full animate-pulse" />
            </div>

            <div className="relative z-10 w-full max-w-md">
                <div className="text-center mb-12">
                    <h2 className="font-serif text-4xl mb-2">Order #{activeOrder.id.slice(-4)}</h2>
                    <p className="text-stone-400 font-sans">Table {tableNumber}</p>
                </div>

                <div className="space-y-8 relative pl-8 border-l-2 border-stone-800 ml-4">
                    {steps.map((step, idx) => {
                        const isActive = activeOrder.status === step.status;
                        const isPast = steps.findIndex(s => s.status === activeOrder.status) > idx || isCompleted;
                        const Icon = step.icon;

                        return (
                            <div key={idx} className={`relative transition-all duration-500 ${isActive || isPast ? 'opacity-100' : 'opacity-30'}`}>
                                <div className={`absolute -left-[41px] top-0 w-5 h-5 rounded-full border-4 border-qrave-dark ${isActive || isPast ? 'bg-orange-500' : 'bg-stone-800'}`} />
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl ${isActive ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' : 'bg-stone-800 text-stone-400'}`}>
                                        <Icon size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-serif text-xl">{step.label}</h3>
                                        {isActive && <p className="text-sm text-orange-400 animate-pulse">In progress...</p>}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-16 text-center">
                    {isCompleted ? (
                        <div className="bg-green-500/20 text-green-400 p-4 rounded-xl border border-green-500/50">
                            <p className="font-medium">Order Completed. Enjoy your meal!</p>
                            <Button variant="ghost" className="mt-4 text-white hover:text-white hover:bg-white/10" onClick={() => navigate(`/r/${slug}?table=${tableNumber}`)}>Order More</Button>
                        </div>
                    ) : (
                        <p className="text-stone-500 text-sm italic">Keep this screen open to track your order.</p>
                    )}
                </div>
            </div>
        </div>
    );
};
