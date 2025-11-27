import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScanLine } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/Button';

export const Landing = () => {
    const [table, setTable] = useState('5');
    const navigate = useNavigate();

    const handleStart = () => {
        // In a real app, we might validate the table or restaurant slug here.
        // For now, we assume a default restaurant slug "demo-restaurant".
        navigate(`/r/demo-restaurant?table=${table}`);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-qrave-base">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-orange-400 via-transparent to-transparent"></div>

            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="w-full max-w-sm text-center z-10"
            >
                <div className="w-20 h-20 bg-qrave-dark text-white rounded-2xl mx-auto flex items-center justify-center mb-8 shadow-2xl shadow-qrave-dark/30 rotate-3">
                    <ScanLine size={40} />
                </div>
                <h1 className="font-serif text-5xl text-qrave-dark mb-4 leading-none">Qrave.</h1>
                <p className="font-sans text-stone-500 mb-10 text-lg">The friction-less dining experience.</p>

                <div className="bg-white p-6 rounded-3xl shadow-xl shadow-stone-200/50 mb-8 border border-white">
                    <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Table Number</label>
                    <input
                        type="number"
                        value={table}
                        onChange={(e) => setTable(e.target.value)}
                        className="w-full text-center text-4xl font-serif font-bold text-qrave-dark border-b-2 border-stone-100 focus:border-qrave-accent focus:outline-none py-2 bg-transparent"
                    />
                </div>

                <Button onClick={handleStart} size="lg" variant="secondary" className="w-full">
                    View Menu
                </Button>

                <p className="mt-8 text-xs text-stone-400 font-sans">
                    Are you a restaurant owner? <br />
                    <span className="underline cursor-pointer hover:text-qrave-dark transition-colors" onClick={() => navigate('/login')}>Login to Dashboard</span>
                </p>
            </motion.div>
        </div>
    );
};
