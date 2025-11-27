const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    const r = await prisma.restaurant.findUnique({ where: { slug: 'demo-restaurant' } });
    console.log(r.id);
}
main();
