import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
const PORT = 3001;

app.use(cors());
app.use(express.json());

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
            include: { items: { include: { menuItem: true } } }
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

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
