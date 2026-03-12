const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const subs = await prisma.subcategory.findMany();
    const parts = await prisma.part.findMany();

    if (subs.length > 0 && parts.length > 0) {
        const sub = subs[0]; // Let's use the first subcategory: Pads

        // Assign to the first part
        const updatedPart = await prisma.part.update({
            where: { id: parts[0].id },
            data: {
                categoryId: sub.categoryId,
                subcategoryId: sub.id
            }
        });

        console.log(`Updated part "${updatedPart.name}" with subcategory:`, sub.name);
    } else {
        console.log('Not enough data to seed subcategories to parts.');
    }

    // Double check search functionality
    const searched = await prisma.part.findMany({
        where: { subcategoryId: subs[0].id },
        include: { subcategory: true }
    });
    console.log('Search result by subcategoryId:', searched.length, 'parts found.');
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
