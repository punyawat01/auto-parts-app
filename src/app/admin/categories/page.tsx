import { prisma } from '@/lib/prisma'
import CategoryList from './CategoryList'

export const dynamic = 'force-dynamic'

export default async function CategoriesPage() {
    const categories = await prisma.category.findMany({
        orderBy: { name: 'asc' },
        include: {
            _count: {
                select: { parts: true }
            }
        }
    });

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground">จัดการหมวดหมู่อะไหล่</h1>
                <p className="text-foreground/60 mt-1">เพิ่ม แก้ไข ลบ และดูจำนวนอะไหล่ในแต่ละหมวดหมู่</p>
            </div>

            <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
                <CategoryList initialCategories={categories} />
            </div>
        </div>
    )
}
