import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const restaurant = await prisma.restaurant.findFirst();
        if (!restaurant) {
            console.log('No restaurant found');
            return;
        }

        console.log('Initial Address:', restaurant.address);

        const updated = await prisma.restaurant.update({
            where: { id: restaurant.id },
            data: { address: '123 Test St, Test City' }
        });

        console.log('Updated Address:', updated.address);

        if (updated.address === '123 Test St, Test City') {
            console.log('Verification SUCCESS');
        } else {
            console.log('Verification FAILED');
        }

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
