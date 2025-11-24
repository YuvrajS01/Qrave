import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, MenuItem } from '../../types';

interface CartContextType {
    cart: CartItem[];
    addToCart: (item: MenuItem) => void;
    removeFromCart: (itemId: string) => void;
    clearCart: () => void;
    cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [cart, setCart] = useState<CartItem[]>(() => {
        const stored = localStorage.getItem('qrave_cart');
        return stored ? JSON.parse(stored) : [];
    });

    useEffect(() => {
        localStorage.setItem('qrave_cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (item: MenuItem) => {
        setCart(prev => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { ...item, quantity: 1 }];
        });
    };

    const removeFromCart = (itemId: string) => {
        setCart(prev => prev.reduce((acc, item) => {
            if (item.id === itemId) {
                if (item.quantity > 1) return [...acc, { ...item, quantity: item.quantity - 1 }];
                return acc;
            }
            return [...acc, item];
        }, [] as CartItem[]));
    };

    const clearCart = () => setCart([]);

    const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, cartTotal }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within a CartProvider');
    return context;
};
