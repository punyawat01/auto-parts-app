'use server'

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function importPartsFromExcel(data: any[]) {
    try {
        let importedCount = 0;

        // Optimize inserting by pre-fetching categories
        const existingCategories = await prisma.category.findMany();
        const categoryMap = new Map(existingCategories.map(c => [c.name.trim().toLowerCase(), c.id]));

        for (const row of data) {
            const partNumber = row['รหัสอะไหล่']?.toString().trim();
            if (!partNumber) continue;

            const name = row['ชื่ออะไหล่']?.toString().trim();
            if (!name) continue; // Name is required

            // Prepare Category
            let categoryId = null;
            const categoryName = row['หมวดหมู่']?.toString().trim();
            if (categoryName) {
                const searchKey = categoryName.toLowerCase();
                if (categoryMap.has(searchKey)) {
                    categoryId = categoryMap.get(searchKey);
                } else {
                    const newCategory = await prisma.category.create({ data: { name: categoryName } });
                    categoryMap.set(searchKey, newCategory.id);
                    categoryId = newCategory.id;
                }
            }

            // Prepare Subcategory
            let subcategoryId = null;
            const subcategoryName = row['หมวดหมู่ย่อย']?.toString().trim();
            if (subcategoryName && categoryId) {
                // Look for existing subcategory
                const existingSub = await prisma.subcategory.findFirst({
                    where: {
                        name: subcategoryName,
                        categoryId: categoryId
                    }
                });

                if (existingSub) {
                    subcategoryId = existingSub.id;
                } else {
                    // Create new subcategory
                    const newSub = await prisma.subcategory.create({
                        data: {
                            name: subcategoryName,
                            categoryId: categoryId
                        }
                    });
                    subcategoryId = newSub.id;
                }
            }

            // Dimension parsing helper
            const pFloat = (val: any) => {
                if (!val) return null;
                const f = parseFloat(val);
                return isNaN(f) ? null : f;
            };

            const partData = {
                partNumber,
                name,
                partBrand: row['ยี่ห้ออะไหล่']?.toString().trim() || null,
                engineCode: row['รหัสเครื่องยนต์']?.toString().trim() || null,
                chassisNumber: row['เลขตัวถัง']?.toString().trim() || null,
                price: pFloat(row['ราคา']),
                width: pFloat(row['กว้าง (A)']),
                length: pFloat(row['ยาว (B)']),
                height: pFloat(row['สูง (C)']),
                innerDiameter: pFloat(row['รูใน (ID)']),
                outerDiameter: pFloat(row['รูนอก (OD)']),
                description: row['รายละเอียด']?.toString().trim() || null,
                categoryId,
                subcategoryId
            };

            // Upsert the core part
            const part = await prisma.part.upsert({
                where: { partNumber },
                update: partData,
                create: partData,
            });

            // Handle Alternative Numbers if simple comma separated format
            const altsStr = row['รหัสเทียบ/OEM']?.toString().trim();
            if (altsStr) {
                // Wipe old ones on update to prevent infinite append
                await prisma.alternativePartNumber.deleteMany({ where: { partId: part.id } });

                // Super basic split by comma. Expecting format: "123 (OEM), 456"
                const parts = altsStr.split(',').map((s: string) => s.trim()).filter((s: string) => s);
                const altData = [];
                for (const p of parts) {
                    let num = p;
                    let note = null;
                    const match = p.match(/(.*?)\((.*?)\)/);
                    if (match) {
                        num = match[1].trim();
                        note = match[2].trim();
                    }
                    if (num) {
                        altData.push({ partId: part.id, number: num, note });
                    }
                }

                if (altData.length > 0) {
                    await prisma.alternativePartNumber.createMany({
                        data: altData
                    });
                }
            }

            // Note: We skip complex compatibilities import for now as it's highly structured
            // The user requested a "simple" import/export.

            importedCount++;
        }

        revalidatePath('/');
        revalidatePath('/admin');
        return { success: true, importedCount };

    } catch (error: any) {
        console.error('Import Error:', error);
        return { success: false, error: 'Failed to import records' };
    }
}
