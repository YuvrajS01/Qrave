import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Receipt } from 'lucide-react';
import { api } from '../services/api';
import { Order } from '../types';
import { Button } from '../../components/ui/Button';

export const Invoice = () => {
    const { slug, orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState<Order | null>(null);

    useEffect(() => {
        const fetchOrder = async () => {
            if (orderId) {
                const data = await api.getOrder(orderId);
                if (data) setOrder(data);
            }
        };
        fetchOrder();
    }, [orderId]);

    if (!order) return <div className="p-8 text-center">Loading Invoice...</div>;

    const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.05;
    const total = subtotal + tax;

    return (
        <div className="min-h-screen bg-stone-100 p-4 md:p-8 flex justify-center">
            <div className="bg-white w-full max-w-2xl shadow-lg rounded-xl overflow-hidden flex flex-col">
                {/* Header - Hidden in Print */}
                <div className="bg-qrave-dark text-white p-4 flex justify-between items-center print:hidden">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm hover:text-stone-300 transition-colors">
                        <ArrowLeft size={16} /> Back
                    </button>
                    <h1 className="font-serif font-bold text-lg">Invoice Preview</h1>
                    <Button onClick={() => window.print()} className="flex items-center gap-2 bg-white text-qrave-dark hover:bg-stone-200">
                        <Printer size={16} /> Print
                    </Button>
                </div>

                {/* Invoice Content */}
                <div className="p-8 md:p-12 bg-white print:p-0" id="invoice-content">
                    <div className="flex justify-between items-start mb-12">
                        <div>
                            <div className="flex items-center gap-2 text-qrave-dark mb-2">
                                <Receipt size={24} />
                                <span className="font-serif text-2xl font-bold tracking-tight">Qrave</span>
                            </div>
                            <p className="text-stone-500 text-sm">123 Food Street, Indiranagar</p>
                            <p className="text-stone-500 text-sm">Bangalore, KA 560038</p>
                        </div>
                        <div className="text-right">
                            <h2 className="text-4xl font-serif font-bold text-grey-200 mb-2">INVOICE</h2>
                            <p className="text-stone-500 font-mono text-sm">#{order.id.slice(0, 8).toUpperCase()}</p>
                            <p className="text-stone-500 text-sm">{new Date(order.timestamp).toLocaleDateString()}</p>
                        </div>
                    </div>

                    <div className="mb-12">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-4">Bill To</h3>
                        <p className="font-bold text-lg">Table {order.tableNumber}</p>
                        <p className="text-stone-500">Dine-in Customer</p>
                    </div>

                    <table className="w-full mb-12">
                        <thead>
                            <tr className="border-b-2 border-stone-100 text-left">
                                <th className="py-3 text-xs font-bold uppercase tracking-wider text-stone-400">Item</th>
                                <th className="py-3 text-xs font-bold uppercase tracking-wider text-stone-400 text-center">Qty</th>
                                <th className="py-3 text-xs font-bold uppercase tracking-wider text-stone-400 text-right">Price</th>
                                <th className="py-3 text-xs font-bold uppercase tracking-wider text-stone-400 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-50">
                            {order.items.map((item) => (
                                <tr key={item.id}>
                                    <td className="py-4 font-medium text-qrave-dark">{item.name}</td>
                                    <td className="py-4 text-center text-stone-500">{item.quantity}</td>
                                    <td className="py-4 text-right text-stone-500">₹{item.price.toFixed(2)}</td>
                                    <td className="py-4 text-right font-bold text-stone-700">₹{(item.price * item.quantity).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="flex justify-end">
                        <div className="w-64 space-y-3">
                            <div className="flex justify-between text-stone-500">
                                <span>Subtotal</span>
                                <span>₹{subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-stone-500">
                                <span>GST (5%)</span>
                                <span>₹{tax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-xl font-bold text-qrave-dark pt-4 border-t-2 border-stone-100">
                                <span>Total</span>
                                <span>₹{total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-16 pt-8 border-t border-stone-100 text-center text-stone-400 text-sm">
                        <p>Thank you for dining with us!</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
