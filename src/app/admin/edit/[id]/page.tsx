import Navbar from '@/components/Navbar'
import PartForm from '../../PartForm'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function EditPartPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const partId = parseInt(id);
    if (isNaN(partId)) notFound();

    const part = await prisma.part.findUnique({
        where: { id: partId },
        include: {
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
            },
            alternativeNumbers: true
        }
    });

    if (!part) notFound();

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Navbar />

            <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-8">
                <div className="mb-6">
                    <Link href="/admin" className="inline-flex items-center text-sm font-medium text-foreground/60 hover:text-primary transition-colors mb-4">
                        <ChevronLeft size={16} className="mr-1" />
                        กลับไปหน้าจัดการ
                    </Link>
                    <h1 className="text-3xl font-bold text-foreground">แก้ไขข้อมูลอะไหล่</h1>
                </div>

                <PartForm initialData={part} />
            </main>
        </div>
    )
}
