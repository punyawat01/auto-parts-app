'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// Define the shape of data required to save a part
export type SavePartInput = {
    id?: number;
    partNumber: string;
    name: string;
    partBrand?: string;
    engineCode?: string;
    chassisNumber?: string;
    description?: string;
    price?: number;
    width?: number;
    length?: number;
    height?: number;
    innerDiameter?: number;
    outerDiameter?: number;
    categoryId?: number;
    subcategoryId?: number;
    compatibilities?: { brandName: string; modelName: string; year: string; notes?: string }[];
    alternativeNumbers?: { number: string; note?: string }[];
}

export async function savePart(data: SavePartInput) {
    try {
        const {
            id, partNumber, name, partBrand, engineCode, chassisNumber, description, price, categoryId, subcategoryId, compatibilities, alternativeNumbers,
            width, length, height, innerDiameter, outerDiameter
        } = data;

        if (id) {
            // UPDATE existing part
            const updated = await prisma.part.update({
                where: { id },
                data: {
                    partNumber,
                    name,
                    partBrand,
                    engineCode,
                    chassisNumber,
                    description,
                    price,
                    width,
                    length,
                    height,
                    innerDiameter,
                    outerDiameter,
                    categoryId,
                    subcategoryId,
                }
            });

            if (compatibilities) {
                // Remove old compatibilities
                await prisma.compatibility.deleteMany({
                    where: { partId: id }
                });

                // Resolve/Create Vehicles
                const resolvedCompatibilities = [];
                for (const comp of compatibilities) {
                    const brand = await prisma.brand.upsert({
                        where: { name: comp.brandName },
                        update: {},
                        create: { name: comp.brandName }
                    });

                    const model = await prisma.model.upsert({
                        where: { brandId_name: { brandId: brand.id, name: comp.modelName } },
                        update: {},
                        create: { brandId: brand.id, name: comp.modelName }
                    });

                    const vehicle = await prisma.vehicle.upsert({
                        where: { modelId_year: { modelId: model.id, year: comp.year } },
                        update: {},
                        create: { modelId: model.id, year: comp.year }
                    });

                    resolvedCompatibilities.push({ vehicleId: vehicle.id, notes: comp.notes });
                }

                // Insert new compatibilities in chunks to avoid SQLite variable limits (safe chunk size = 50-100)
                const chunkSize = 100;
                for (let i = 0; i < resolvedCompatibilities.length; i += chunkSize) {
                    const chunk = resolvedCompatibilities.slice(i, i + chunkSize);
                    await prisma.compatibility.createMany({
                        data: chunk.map(comp => ({
                            partId: id,
                            vehicleId: comp.vehicleId,
                            notes: comp.notes
                        }))
                    });
                }
            }

            if (alternativeNumbers !== undefined) {
                // Remove old alternative numbers
                await prisma.alternativePartNumber.deleteMany({
                    where: { partId: id }
                });

                if (alternativeNumbers.length > 0) {
                    await prisma.alternativePartNumber.createMany({
                        data: alternativeNumbers.map(alt => ({
                            partId: id,
                            number: alt.number,
                            note: alt.note
                        }))
                    });
                }
            }

            revalidatePath('/');
            return { success: true, data: updated };
        } else {
            // CREATE new part
            const created = await prisma.part.create({
                data: {
                    partNumber,
                    name,
                    partBrand,
                    description,
                    price,
                    width,
                    length,
                    height,
                    innerDiameter,
                    outerDiameter,
                    categoryId,
                    subcategoryId,
                }
            });

            if (compatibilities && compatibilities.length > 0) {
                const resolvedCompatibilities = [];
                for (const comp of compatibilities) {
                    const brand = await prisma.brand.upsert({
                        where: { name: comp.brandName },
                        update: {},
                        create: { name: comp.brandName }
                    });

                    const model = await prisma.model.upsert({
                        where: { brandId_name: { brandId: brand.id, name: comp.modelName } },
                        update: {},
                        create: { brandId: brand.id, name: comp.modelName }
                    });

                    const vehicle = await prisma.vehicle.upsert({
                        where: { modelId_year: { modelId: model.id, year: comp.year } },
                        update: {},
                        create: { modelId: model.id, year: comp.year }
                    });

                    resolvedCompatibilities.push({ vehicleId: vehicle.id, notes: comp.notes });
                }

                const chunkSize = 100;
                for (let i = 0; i < resolvedCompatibilities.length; i += chunkSize) {
                    const chunk = resolvedCompatibilities.slice(i, i + chunkSize);
                    await prisma.compatibility.createMany({
                        data: chunk.map(comp => ({
                            partId: created.id,
                            vehicleId: comp.vehicleId,
                            notes: comp.notes
                        }))
                    });
                }
            }

            if (alternativeNumbers && alternativeNumbers.length > 0) {
                await prisma.alternativePartNumber.createMany({
                    data: alternativeNumbers.map(alt => ({
                        partId: created.id,
                        number: alt.number,
                        note: alt.note
                    }))
                });
            }

            revalidatePath('/');
            return { success: true, data: created };
        }
    } catch (error) {
        console.error('Error saving part:', error);
        return { success: false, error: 'Failed to save part' };
    }
}

export async function deletePart(id: number) {
    try {
        await prisma.part.delete({
            where: { id }
        });
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Error deleting part:', error);
        return { success: false, error: 'Failed to delete part' };
    }
}
