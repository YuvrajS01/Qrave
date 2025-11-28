import express from 'express';
import cors from 'cors';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, '../dist')));

// Get All Restaurants
app.get('/api/restaurants', async (req, res) => {
    try {
        const restaurants = await prisma.restaurant.findMany({
            include: { _count: { select: { orders: true, menu: true } } }
        });
        // Remove passwords from response
        const safeRestaurants = restaurants.map(({ password, ...rest }) => rest);
        res.json(safeRestaurants);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create Restaurant
app.post('/api/restaurants', async (req, res) => {
    try {
        const { name, slug, password, address } = req.body;
        const restaurant = await prisma.restaurant.create({
            data: {
                name,
                slug,
                address: address || 'Default Address', // Default empty address if not provided
                password: password || 'password' // Default password if not provided
            }
        });
        const { password: _, ...safeRestaurant } = restaurant;
        res.json(safeRestaurant);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Login
app.post('/api/login', async (req, res) => {
    try {
        const { slug, password } = req.body;
        const restaurant = await prisma.restaurant.findUnique({
            where: { slug }
        });

        if (!restaurant || restaurant.password !== password) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const { password: _, ...safeRestaurant } = restaurant;
        res.json(safeRestaurant);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete Restaurant
app.delete('/api/restaurants/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.restaurant.delete({ where: { id } });
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get Restaurant by Slug
app.get('/api/restaurants/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        const restaurant = await prisma.restaurant.findUnique({
            where: { slug },
            include: { menu: true }
        });

        if (!restaurant) {
            return res.status(404).json({ error: 'Restaurant not found' });
        }

        res.json(restaurant);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update Restaurant Details
app.put('/api/restaurants/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, address } = req.body;

        const restaurant = await prisma.restaurant.update({
            where: { id },
            data: { name, address }
        });

        const { password: _, ...safeRestaurant } = restaurant;
        res.json(safeRestaurant);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get Orders for Restaurant
app.get('/api/orders', async (req, res) => {
    try {
        const { restaurantId } = req.query;
        if (!restaurantId) {
            return res.status(400).json({ error: 'Missing restaurantId' });
        }

        const orders = await prisma.order.findMany({
            where: { restaurantId: String(restaurantId) },
            include: { items: { include: { menuItem: true } } },
            orderBy: { createdAt: 'desc' }
        });

        res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create Order
app.post('/api/orders', async (req, res) => {
    try {
        const { restaurantId, tableNumber, items, total, customerNote } = req.body;

        const order = await prisma.order.create({
            data: {
                restaurantId,
                tableNumber,
                total,
                customerNote,
                status: 'PENDING',
                items: {
                    create: items.map((item: any) => ({
                        menuItemId: item.id,
                        quantity: item.quantity,
                        priceAtTime: item.price
                    }))
                }
            }
        });

        res.json(order);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get Single Order
app.get('/api/orders/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const order = await prisma.order.findUnique({
            where: { id },
            include: {
                items: { include: { menuItem: true } },
                restaurant: true
            }
        });

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json(order);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update Order Status
app.patch('/api/orders/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const order = await prisma.order.update({
            where: { id },
            data: { status }
        });

        res.json(order);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete All Completed/Cancelled Orders for a Restaurant
app.delete('/api/orders/completed', async (req, res) => {
    try {
        const { restaurantId } = req.query;
        console.log(`[DELETE /api/orders/completed] Request received for restaurantId: ${restaurantId}`);

        if (!restaurantId) {
            console.error('[DELETE /api/orders/completed] Missing restaurantId');
            return res.status(400).json({ error: 'Missing restaurantId' });
        }

        const count = await prisma.order.count({
            where: {
                restaurantId: String(restaurantId),
                status: { in: ['COMPLETED', 'CANCELLED'] }
            }
        });
        console.log(`[DELETE /api/orders/completed] Found ${count} orders to delete`);

        const result = await prisma.order.deleteMany({
            where: {
                restaurantId: String(restaurantId),
                status: { in: ['COMPLETED', 'CANCELLED'] }
            }
        });
        console.log(`[DELETE /api/orders/completed] Deleted ${result.count} orders`);

        res.json({ success: true, count: result.count });
    } catch (error) {
        console.error('[DELETE /api/orders/completed] Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete Single Order
app.delete('/api/orders/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.order.delete({ where: { id } });
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Add Menu Item
app.post('/api/menu-items', async (req, res) => {
    try {
        const { restaurantId, ...itemData } = req.body;

        const menuItem = await prisma.menuItem.create({
            data: {
                restaurantId,
                ...itemData
            }
        });

        res.json(menuItem);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update Menu Item
app.put('/api/menu-items/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { restaurantId, ...itemData } = req.body; // Exclude restaurantId if present, though it shouldn't change

        const menuItem = await prisma.menuItem.update({
            where: { id },
            data: itemData
        });

        res.json(menuItem);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Catch-all middleware to serve the frontend for any unmatched routes
app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
