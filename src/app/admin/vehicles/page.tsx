import { prisma } from '@/lib/prisma'
import VehicleManager from './VehicleManager'

export const dynamic = 'force-dynamic'

export default async function VehiclesPage() {
    const brands = await prisma.brand.findMany({
        orderBy: { name: 'asc' },
        include: {
            models: {
                orderBy: { name: 'asc' },
                include: { _count: { select: { vehicles: true } } }
            },
            _count: { select: { models: true } }
        }
    });

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">จัดการยี่ห้อและรุ่นรถ</h1>
            </div>
            {/* pass data to interactive client component */}
            <VehicleManager initialBrands={brands} />
        </div>
    );
}
