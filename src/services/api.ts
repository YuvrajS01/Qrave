import { supabase } from '../lib/supabase';
import { MenuItem, Order, OrderStatus, Restaurant } from '../types';

// --- Types mapping ---
// We need to map between our frontend camelCase types and DB snake_case types

interface DbRestaurant {
    id: string;
    slug: string;
    name: string;
    owner_id: string;
}

interface DbMenuItem {
    id: string;
    restaurant_id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    image_url: string;
    is_vegetarian: boolean;
    is_spicy: boolean;
    available: boolean;
}

interface DbOrder {
    id: string;
    restaurant_id: string;
    table_number: number;
    status: OrderStatus;
    total: number;
    customer_note?: string;
    created_at: string;
}

interface DbOrderItem {
    id: string;
    order_id: string;
    menu_item_id: string;
    quantity: number;
    price_at_time: number;
    menu_items: DbMenuItem; // Joined
}

// --- API Methods ---

export const api = {
    getRestaurantBySlug: async (slug: string): Promise<Restaurant | null> => {
        const { data: restaurant, error } = await supabase
            .from('restaurants')
            .select('*')
            .eq('slug', slug)
            .single();

        if (error || !restaurant) {
            console.error('Error fetching restaurant:', error);
            return null;
        }

        const { data: menuItems, error: menuError } = await supabase
            .from('menu_items')
            .select('*')
            .eq('restaurant_id', restaurant.id);

        if (menuError) {
            console.error('Error fetching menu:', menuError);
            return null;
        }

        // Map to frontend types
        const menu: MenuItem[] = (menuItems || []).map(item => ({
            id: item.id,
            name: item.name,
            description: item.description,
            price: item.price,
            category: item.category,
            imageUrl: item.image_url,
            isVegetarian: item.is_vegetarian,
            isSpicy: item.is_spicy,
            available: item.available
        }));

        return {
            id: restaurant.id,
            name: restaurant.name,
            menu,
            orders: [], // We fetch orders separately or via subscription
            tables: 0 // Not in DB yet
        };
    },

    createOrder: async (order: Order, restaurantId: string): Promise<string | null> => {
        // 1. Create Order
        const { data: newOrder, error: orderError } = await supabase
            .from('orders')
            .insert({
                restaurant_id: restaurantId,
                table_number: order.tableNumber,
                status: order.status,
                total: order.total,
                customer_note: order.customerNote
            })
            .select()
            .single();

        if (orderError || !newOrder) {
            console.error('Error creating order:', orderError);
            return null;
        }

        // 2. Create Order Items
        const orderItems = order.items.map(item => ({
            order_id: newOrder.id,
            menu_item_id: item.id,
            quantity: item.quantity,
            price_at_time: item.price
        }));

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems);

        if (itemsError) {
            console.error('Error creating order items:', itemsError);
            return null;
        }

        return newOrder.id;
    },

    getOrder: async (orderId: string): Promise<Order | null> => {
        const { data: order, error } = await supabase
            .from('orders')
            .select(`
        *,
        order_items (
          quantity,
          menu_items (*)
        )
      `)
            .eq('id', orderId)
            .single();

        if (error || !order) {
            console.error('Error fetching order:', error);
            return null;
        }

        // Map to frontend types
        const items = order.order_items.map((oi: any) => ({
            id: oi.menu_items.id,
            name: oi.menu_items.name,
            description: oi.menu_items.description,
            price: oi.menu_items.price,
            category: oi.menu_items.category,
            imageUrl: oi.menu_items.image_url,
            isVegetarian: oi.menu_items.is_vegetarian,
            isSpicy: oi.menu_items.is_spicy,
            available: oi.menu_items.available,
            quantity: oi.quantity
        }));

        return {
            id: order.id,
            tableNumber: order.table_number,
            items,
            total: order.total,
            status: order.status as OrderStatus,
            timestamp: new Date(order.created_at).getTime(),
            customerNote: order.customer_note
        };
    },

    subscribeToOrder: (orderId: string, callback: (payload: any) => void) => {
        return supabase
            .channel(`order:${orderId}`)
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` },
                callback
            )
            .subscribe();
    },

    // --- Admin Methods ---

    getOrders: async (restaurantId: string): Promise<Order[]> => {
        const { data: orders, error } = await supabase
            .from('orders')
            .select(`
        *,
        order_items (
          quantity,
          menu_items (*)
        )
      `)
            .eq('restaurant_id', restaurantId)
            .order('created_at', { ascending: false });

        if (error || !orders) {
            console.error('Error fetching orders:', error);
            return [];
        }

        return orders.map((order: any) => ({
            id: order.id,
            tableNumber: order.table_number,
            items: order.order_items.map((oi: any) => ({
                id: oi.menu_items.id,
                name: oi.menu_items.name,
                description: oi.menu_items.description,
                price: oi.menu_items.price,
                category: oi.menu_items.category,
                imageUrl: oi.menu_items.image_url,
                isVegetarian: oi.menu_items.is_vegetarian,
                isSpicy: oi.menu_items.is_spicy,
                available: oi.menu_items.available,
                quantity: oi.quantity
            })),
            total: order.total,
            status: order.status as OrderStatus,
            timestamp: new Date(order.created_at).getTime(),
            customerNote: order.customer_note
        }));
    },

    updateOrderStatus: async (orderId: string, status: OrderStatus): Promise<boolean> => {
        const { error } = await supabase
            .from('orders')
            .update({ status })
            .eq('id', orderId);

        if (error) {
            console.error('Error updating order status:', error);
            return false;
        }
        return true;
    },

    addMenuItem: async (item: MenuItem, restaurantId: string): Promise<boolean> => {
        const { error } = await supabase
            .from('menu_items')
            .insert({
                restaurant_id: restaurantId,
                name: item.name,
                description: item.description,
                price: item.price,
                category: item.category,
                image_url: item.imageUrl,
                is_vegetarian: item.isVegetarian,
                is_spicy: item.isSpicy,
                available: item.available
            });

        if (error) {
            console.error('Error adding menu item:', error);
            return false;
        }
        return true;
    },

    subscribeToOrders: (restaurantId: string, callback: (payload: any) => void) => {
        return supabase
            .channel(`restaurant_orders:${restaurantId}`)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'orders', filter: `restaurant_id=eq.${restaurantId}` },
                callback
            )
            .subscribe();
    }
};
