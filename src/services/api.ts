import { MenuItem, Order, OrderStatus, Restaurant } from '../types';

const API_URL = 'http://localhost:3001/api';

// --- API Methods ---

export const api = {
    getRestaurantBySlug: async (slug: string): Promise<Restaurant | null> => {
        try {
            const res = await fetch(`${API_URL}/restaurants/${slug}`);
            if (!res.ok) return null;

            const data = await res.json();

            // Map backend data to frontend types
            const menu: MenuItem[] = data.menu.map((item: any) => ({
                id: item.id,
                name: item.name,
                description: item.description,
                price: item.price,
                category: item.category,
                imageUrl: item.imageUrl,
                isVegetarian: item.isVegetarian,
                isSpicy: item.isSpicy,
                available: item.available
            }));

            return {
                id: data.id,
                name: data.name,
                menu,
                orders: [], // Fetched separately
                tables: 0
            };
        } catch (e) {
            console.error(e);
            return null;
        }
    },

    createOrder: async (order: Order, restaurantId: string): Promise<string | null> => {
        try {
            const res = await fetch(`${API_URL}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    restaurantId,
                    tableNumber: order.tableNumber,
                    items: order.items,
                    total: order.total,
                    customerNote: order.customerNote
                })
            });

            if (!res.ok) return null;
            const data = await res.json();
            return data.id;
        } catch (e) {
            console.error(e);
            return null;
        }
    },

    getOrder: async (orderId: string): Promise<Order | null> => {
        try {
            const res = await fetch(`${API_URL}/orders/${orderId}`);
            if (!res.ok) return null;

            const order = await res.json();

            const items = order.items.map((oi: any) => ({
                id: oi.menuItem.id,
                name: oi.menuItem.name,
                description: oi.menuItem.description,
                price: oi.menuItem.price,
                category: oi.menuItem.category,
                imageUrl: oi.menuItem.imageUrl,
                isVegetarian: oi.menuItem.isVegetarian,
                isSpicy: oi.menuItem.isSpicy,
                available: oi.menuItem.available,
                quantity: oi.quantity
            }));

            return {
                id: order.id,
                tableNumber: order.tableNumber,
                items,
                total: order.total,
                status: order.status as OrderStatus,
                timestamp: new Date(order.createdAt).getTime(),
                customerNote: order.customerNote
            };
        } catch (e) {
            console.error(e);
            return null;
        }
    },

    subscribeToOrder: (orderId: string, callback: (payload: any) => void) => {
        // Polling implementation for local DB
        const interval = setInterval(async () => {
            const order = await api.getOrder(orderId);
            if (order) {
                callback({ new: order });
            }
        }, 3000);

        return {
            unsubscribe: () => clearInterval(interval)
        };
    },

    // --- Admin Methods ---

    getOrders: async (restaurantId: string): Promise<Order[]> => {
        try {
            const res = await fetch(`${API_URL}/orders?restaurantId=${restaurantId}`);
            if (!res.ok) return [];

            const orders = await res.json();

            return orders.map((order: any) => ({
                id: order.id,
                tableNumber: order.tableNumber,
                items: order.items.map((oi: any) => ({
                    id: oi.menuItem.id,
                    name: oi.menuItem.name,
                    description: oi.menuItem.description,
                    price: oi.menuItem.price,
                    category: oi.menuItem.category,
                    imageUrl: oi.menuItem.imageUrl,
                    isVegetarian: oi.menuItem.isVegetarian,
                    isSpicy: oi.menuItem.isSpicy,
                    available: oi.menuItem.available,
                    quantity: oi.quantity
                })),
                total: order.total,
                status: order.status as OrderStatus,
                timestamp: new Date(order.createdAt).getTime(),
                customerNote: order.customerNote
            }));
        } catch (e) {
            console.error(e);
            return [];
        }
    },

    updateOrderStatus: async (orderId: string, status: OrderStatus): Promise<boolean> => {
        try {
            const res = await fetch(`${API_URL}/orders/${orderId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            return res.ok;
        } catch (e) {
            console.error(e);
            return false;
        }
    },

    addMenuItem: async (item: MenuItem, restaurantId: string): Promise<boolean> => {
        try {
            const res = await fetch(`${API_URL}/menu-items`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    restaurantId,
                    name: item.name,
                    description: item.description,
                    price: item.price,
                    category: item.category,
                    imageUrl: item.imageUrl,
                    isVegetarian: item.isVegetarian,
                    isSpicy: item.isSpicy,
                    available: item.available
                })
            });
            return res.ok;
        } catch (e) {
            console.error(e);
            return false;
        }
    },

    updateMenuItem: async (id: string, updates: Partial<MenuItem>): Promise<boolean> => {
        try {
            const res = await fetch(`${API_URL}/menu-items/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: updates.name,
                    description: updates.description,
                    price: updates.price,
                    category: updates.category,
                    imageUrl: updates.imageUrl,
                    isVegetarian: updates.isVegetarian,
                    isSpicy: updates.isSpicy,
                    available: updates.available
                })
            });
            return res.ok;
        } catch (e) {
            console.error(e);
            return false;
        }
    },

    subscribeToOrders: (restaurantId: string, callback: (payload: any) => void) => {
        // Polling implementation for local DB
        // We can't easily detect INSERT vs UPDATE with simple polling without keeping state.
        // For MVP, we'll just emit an 'INSERT' event periodically with the full list or just let the component re-fetch.
        // Actually, the AdminDashboard re-fetches on INSERT.
        // Let's just simulate an INSERT event every 5 seconds to force a refresh.

        const interval = setInterval(() => {
            callback({ eventType: 'INSERT' });
        }, 5000);

        return {
            unsubscribe: () => clearInterval(interval)
        };
    }
};
