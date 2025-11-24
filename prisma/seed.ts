import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Create Demo Restaurant
    const restaurant = await prisma.restaurant.upsert({
        where: { slug: 'demo-restaurant' },
        update: {},
        create: {
            slug: 'demo-restaurant',
            name: 'The Obsidian Fork',
            menu: {
                create: [
                    {
                        name: 'Truffle Mushroom Risotto',
                        description: 'Arborio rice slowly cooked with porcini broth, finished with truffle oil and aged parmesan.',
                        price: 24,
                        category: 'Mains',
                        imageUrl: 'https://picsum.photos/seed/risotto/400/300',
                        isVegetarian: true,
                        available: true,
                    },
                    {
                        name: 'Crispy Pork Belly',
                        description: 'Slow-roasted pork belly with a crackling skin, served on a bed of apple fennel slaw.',
                        price: 28,
                        category: 'Mains',
                        imageUrl: 'https://picsum.photos/seed/pork/400/300',
                        available: true,
                    },
                    {
                        name: 'Burrata & Heirloom',
                        description: 'Fresh burrata cheese with heirloom tomatoes, basil pesto, and balsamic glaze.',
                        price: 18,
                        category: 'Starters',
                        imageUrl: 'https://picsum.photos/seed/burrata/400/300',
                        isVegetarian: true,
                        available: true,
                    },
                    {
                        name: 'Yuzu Cheese Tart',
                        description: 'Zesty yuzu curd in a buttery pastry shell, topped with toasted meringue.',
                        price: 12,
                        category: 'Desserts',
                        imageUrl: 'https://picsum.photos/seed/tart/400/300',
                        isVegetarian: true,
                        available: true,
                    },
                    {
                        name: 'Wagyu Beef Sliders',
                        description: 'Two premium wagyu patties, brioche bun, caramelized onions, and secret sauce.',
                        price: 22,
                        category: 'Starters',
                        imageUrl: 'https://picsum.photos/seed/sliders/400/300',
                        available: true,
                    }
                ]
            }
        },
    });

    console.log({ restaurant });
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
