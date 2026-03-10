import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { Plus, Edit, Trash2 } from 'lucide-react'
import DeletePartButton from './DeletePartButton'
import ExcelActions from '@/components/ExcelActions'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
    const parts = await prisma.part.findMany({
        include: { category: true, alternativeNumbers: true },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Navbar />

            <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">จัดการคลังอะไหล่</h1>
                        <p className="text-foreground/60 mt-1">เพิ่ม แก้ไข ลบ ข้อมูลอะไหล่และตรวจสอบความเข้ากันได้</p>
                    </div>
                    <div className="flex gap-3">
                        <ExcelActions />
                        <Link href="/admin/new" className="bg-primary text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary/90 transition-colors">
                            <Plus size={20} />
                            <span>เพิ่มอะไหล่ใหม่</span>
                        </Link>
                    </div>
                </div>

                <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-muted/50 border-b border-border">
                                    <th className="p-4 font-semibold text-foreground/70">รหัสอะไหล่</th>
                                    <th className="p-4 font-semibold text-foreground/70">ชื่ออะไหล่</th>
                                    <th className="p-4 font-semibold text-foreground/70">ยี่ห้ออะไหล่</th>
                                    <th className="p-4 font-semibold text-foreground/70">หมวดหมู่</th>
                                    <th className="p-4 font-semibold text-foreground/80 text-right">ราคา</th>
                                    <th className="p-4 font-semibold text-foreground/80 text-center">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {parts.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-foreground/50">
                                            ยังไม่มีข้อมูลอะไหล่ในระบบ
                                        </td>
                                    </tr>
                                ) : parts.map(part => (
                                    <tr key={part.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                                        <td className="p-4 font-mono text-sm">
                                            <div className="text-primary font-bold">{part.partNumber}</div>
                                            {part.alternativeNumbers && part.alternativeNumbers.length > 0 && (
                                                <div className="mt-1 flex flex-wrap gap-1">
                                                    {part.alternativeNumbers.map(alt => (
                                                        <span key={alt.id} title={alt.note || "รหัสเทียบ"} className="inline-block bg-secondary/10 text-secondary-foreground px-1.5 py-0.5 rounded text-[10px] border border-secondary/20 block w-max">
                                                            {alt.number}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4">{part.name}</td>
                                        <td className="p-4">
                                            {part.partBrand ? (
                                                <span className="inline-block bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-semibold">
                                                    {part.partBrand}
                                                </span>
                                            ) : (
                                                <span className="text-foreground/40 text-sm">-</span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            {part.category ? (
                                                <span className="bg-muted px-2 py-1 rounded text-xs">{part.category.name}</span>
                                            ) : (
                                                <span className="text-foreground/40 text-xs">-</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right font-medium">
                                            {part.price ? `฿${part.price.toLocaleString()}` : '-'}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <Link href={`/admin/edit/${part.id}`} className="p-2 text-foreground/60 hover:text-primary transition-colors rounded-lg hover:bg-primary/10">
                                                    <Edit size={18} />
                                                </Link>
                                                <DeletePartButton id={part.id} name={part.name} />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
