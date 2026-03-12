'use server'

import { prisma } from '@/lib/prisma'

export async function getCategories() {
    try {
        const categories = await prisma.category.findMany({
            orderBy: { name: 'asc' }
        });
        return { success: true, data: categories };
    } catch (error) {
        console.error('Error fetching categories:', error);
        return { success: false, error: 'Failed to fetch categories' };
    }
}

export async function getSubcategories(categoryId: number) {
    try {
        const subcategories = await prisma.subcategory.findMany({
            where: { categoryId },
            orderBy: { name: 'asc' }
        });
        return { success: true, data: subcategories };
    } catch (error) {
        console.error('Error fetching subcategories:', error);
        return { success: false, error: 'Failed to fetch subcategories' };
    }
}

export async function searchParts({
    brandName,
    modelName,
    year,
    categoryId,
    subcategoryId,
    searchTerm,
    width,
    length,
    height,
    innerDiameter,
    outerDiameter
}: {
    brandName?: string;
    modelName?: string;
    year?: string;
    categoryId?: number;
    subcategoryId?: number;
    searchTerm?: string;
    width?: number;
    length?: number;
    height?: number;
    innerDiameter?: number;
    outerDiameter?: number;
}) {
    try {
        const vehicleFilter: any = {};
        if (year) vehicleFilter.year = year;
        if (modelName || brandName) {
            vehicleFilter.model = {};
            if (modelName) vehicleFilter.model.name = modelName;
            if (brandName) vehicleFilter.model.brand = { name: brandName };
        }

        const searchTerms = searchTerm ? searchTerm.split(/[+\s]+/).filter(Boolean) : [];

        // Build Base Filters (non-text search)
        const baseFilters: any[] = [
            categoryId ? { categoryId } : {},
            subcategoryId ? { subcategoryId } : {},
            (brandName || modelName || year) ? {
                compatibilities: {
                    some: {
                        vehicle: vehicleFilter
                    }
                }
            } : {},
            width ? { width: { gte: width - 0.99, lte: width + 0.99 } } : {},
            length ? { length: { gte: length - 0.99, lte: length + 0.99 } } : {},
            height ? { height: { gte: height - 0.99, lte: height + 0.99 } } : {},
            innerDiameter ? { innerDiameter: { gte: innerDiameter - 0.99, lte: innerDiameter + 0.99 } } : {},
            outerDiameter ? { outerDiameter: { gte: outerDiameter - 0.99, lte: outerDiameter + 0.99 } } : {}
        ].filter(f => Object.keys(f).length > 0);

        const finalWhere: any = {};
        const allConditions = [...baseFilters];

        if (searchTerms.length > 0) {
            for (const term of searchTerms) {
                allConditions.push({
                    OR: [
                        { partNumber: { contains: term } },
                        { name: { contains: term } },
                        { description: { contains: term } },
                        { engineCode: { contains: term } },
                        {
                            alternativeNumbers: {
                                some: { number: { contains: term } }
                            }
                        }
                    ]
                });
            }
        }

        if (allConditions.length > 0) {
            finalWhere.AND = allConditions;
        }

        const parts = await prisma.part.findMany({
            where: finalWhere,
            include: {
                category: true,
                subcategory: true,
                alternativeNumbers: true,
                compatibilities: {
                    include: {
                        vehicle: {
                            include: {
                                model: {
                                    include: { brand: true }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: { name: 'asc' }
        });

        return { success: true, data: parts };
    } catch (error) {
        console.error('Error searching parts:', error);
        return { success: false, error: 'Failed to search parts' };
    }
}
