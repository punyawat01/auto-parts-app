'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function saveCategory(id: number | null, name: string) {
    try {
        if (!name.trim()) {
            return { success: false, error: 'Category name is required' };
        }

        if (id) {
            // Update
            const category = await prisma.category.update({
                where: { id },
                data: { name }
            });
            revalidatePath('/admin/categories');
            revalidatePath('/admin');
            revalidatePath('/');
            return { success: true, data: category };
        } else {
            // Create
            const category = await prisma.category.create({
                data: { name }
            });
            revalidatePath('/admin/categories');
            revalidatePath('/admin');
            revalidatePath('/');
            return { success: true, data: category };
        }
    } catch (error: any) {
        console.error('Error saving category:', error);
        // Prisma unique constraint error
        if (error.code === 'P2002') {
            return { success: false, error: 'มีชื่อหมวดหมู่นี้ในระบบแล้ว' };
        }
        return { success: false, error: 'Failed to save category' };
    }
}

export async function deleteCategory(id: number) {
    try {
        // Note: the schema sets part.categoryId to null on delete (onDelete: SetNull)
        await prisma.category.delete({
            where: { id }
        });
        revalidatePath('/admin/categories');
        revalidatePath('/admin');
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Error deleting category:', error);
        return { success: false, error: 'Failed to delete category' };
    }
}

export async function saveSubcategory(id: number | null, name: string, categoryId: number) {
    try {
        if (!name.trim()) {
            return { success: false, error: 'Subcategory name is required' };
        }

        if (id) {
            // Update
            const subcategory = await prisma.subcategory.update({
                where: { id },
                data: { name }
            });
            revalidatePath('/admin/categories');
            revalidatePath('/admin');
            revalidatePath('/');
            return { success: true, data: subcategory };
        } else {
            // Create
            const subcategory = await prisma.subcategory.create({
                data: { name, categoryId }
            });
            revalidatePath('/admin/categories');
            revalidatePath('/admin');
            revalidatePath('/');
            return { success: true, data: subcategory };
        }
    } catch (error: any) {
        console.error('Error saving subcategory:', error);
        if (error.code === 'P2002') {
            return { success: false, error: 'มีชื่อหมวดหมู่ย่อยนี้ในระบบแล้ว' };
        }
        return { success: false, error: 'Failed to save subcategory' };
    }
}

export async function deleteSubcategory(id: number) {
    try {
        await prisma.subcategory.delete({
            where: { id }
        });
        revalidatePath('/admin/categories');
        revalidatePath('/admin');
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Error deleting subcategory:', error);
        return { success: false, error: 'Failed to delete subcategory' };
    }
}
