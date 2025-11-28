import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const url = process.env.DATABASE_URL;
        if (!url) {
            console.log('DATABASE_URL is not set');
            return;
        }

        // Mask the password for safety
        const maskedUrl = url.replace(/:[^:@]+@/, ':****@');
        console.log(`Connecting to: ${maskedUrl}`);

        const count = await prisma.restaurant.count();
        console.log(`Number of restaurants in DB: ${count}`);

        const restaurants = await prisma.restaurant.findMany({
            select: { id: true, name: true, slug: true }
        });
        console.log('Restaurants found:', restaurants);

    } catch (e) {
        console.error('Error connecting to DB:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
