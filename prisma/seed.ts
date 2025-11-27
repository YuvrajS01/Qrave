import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Create Demo Restaurant
    const restaurant = await prisma.restaurant.upsert({
        where: { slug: 'demo-restaurant' },
        update: {},
        create: {
            slug: 'demo-restaurant',
            name: 'Parmar Hotel',
            password: 'password',
            menu: {
                create: [
                    {
                        name: 'Butter Chicken',
                        description: 'Tender chicken pieces cooked in a rich tomato and cashew gravy with butter and cream.',
                        price: 450,
                        category: 'Mains',
                        imageUrl: 'https://picsum.photos/seed/butterchicken/400/300',
                        isVegetarian: false,
                        available: true,
                    },
                    {
                        name: 'Paneer Tikka Masala',
                        description: 'Grilled paneer cubes simmered in a spicy and aromatic tomato-onion gravy.',
                        price: 380,
                        category: 'Mains',
                        imageUrl: 'https://picsum.photos/seed/paneertikka/400/300',
                        isVegetarian: true,
                        available: true,
                    },
                    {
                        name: 'Chicken Biryani',
                        description: 'Aromatic basmati rice cooked with succulent chicken pieces and exotic spices.',
                        price: 400,
                        category: 'Mains',
                        imageUrl: 'https://picsum.photos/seed/biryani/400/300',
                        isVegetarian: false,
                        available: true,
                    },
                    {
                        name: 'Dal Makhani',
                        description: 'Whole black lentils and kidney beans cooked overnight with butter and cream.',
                        price: 320,
                        category: 'Mains',
                        imageUrl: 'https://picsum.photos/seed/dalmakhani/400/300',
                        isVegetarian: true,
                        available: true,
                    },
                    {
                        name: 'Masala Dosa',
                        description: 'Crispy rice crepe filled with spiced potato masala, served with chutney and sambar.',
                        price: 180,
                        category: 'Starters',
                        imageUrl: 'https://picsum.photos/seed/dosa/400/300',
                        isVegetarian: true,
                        available: true,
                    },
                    {
                        name: 'Mango Lassi',
                        description: 'Refreshing yogurt-based drink blended with sweet mango pulp.',
                        price: 120,
                        category: 'Drinks',
                        imageUrl: 'https://picsum.photos/seed/lassi/400/300',
                        isVegetarian: true,
                        available: true,
                    },
                    {
                        name: 'Masala Chai',
                        description: 'Traditional Indian spiced tea brewed with milk and aromatic spices.',
                        price: 100,
                        category: 'Drinks',
                        imageUrl: 'https://picsum.photos/seed/chai/400/300',
                        isVegetarian: true,
                        available: true,
                    },
                    {
                        name: 'Gulab Jamun',
                        description: 'Soft milk solids dumplings soaked in rose-flavored sugar syrup.',
                        price: 150,
                        category: 'Desserts',
                        imageUrl: 'https://picsum.photos/seed/gulabjamun/400/300',
                        isVegetarian: true,
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
