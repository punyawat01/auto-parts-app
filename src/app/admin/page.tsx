import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { Plus, Edit, Trash2 } from 'lucide-react'
import DeletePartButton from './DeletePartButton'
import ExcelActions from '@/components/ExcelActions'
import AdminSearch from './AdminSearch'
import { Suspense } from 'react'
import { getDimensionConfigs } from '@/lib/dimensionConfig'

export const dynamic = 'force-dynamic'

export default async function AdminPage(props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const searchParams = await props.searchParams;
    const q = typeof searchParams.q === 'string' ? searchParams.q : undefined;
    const categoryId = typeof searchParams.categoryId === 'string' ? Number(searchParams.categoryId) : undefined;
    const subcategoryId = typeof searchParams.subcategoryId === 'string' ? Number(searchParams.subcategoryId) : undefined;
    const brand = typeof searchParams.brand === 'string' ? searchParams.brand : undefined;
    const model = typeof searchParams.model === 'string' ? searchParams.model : undefined;
    const year = typeof searchParams.year === 'string' ? searchParams.year : undefined;

    const vehicleFilter: any = {};
    if (year) vehicleFilter.year = year;
    if (model || brand) {
        vehicleFilter.model = {};
        if (model) vehicleFilter.model.name = model;
        if (brand) vehicleFilter.model.brand = { name: brand };
    }

    const parts = await prisma.part.findMany({
        where: {
            AND: [
                q ? {
                    AND: q.split(/[\s+]+/).filter(Boolean).map(term => ({
                        OR: [
                            { partNumber: { contains: term } },
                            { name: { contains: term } },
                            { description: { contains: term } },
                            { partBrand: { contains: term } },
                            { engineCode: { contains: term } },
                            { chassisNumber: { contains: term } },
                            { alternativeNumbers: { some: { number: { contains: term } } } },
                            { compatibilities: { some: { vehicle: { model: { name: { contains: term } } } } } },
                            { compatibilities: { some: { vehicle: { model: { brand: { name: { contains: term } } } } } } },
                            { compatibilities: { some: { vehicle: { year: { contains: term } } } } }
                        ]
                    }))
                } : {},
                categoryId ? { categoryId } : {},
                subcategoryId ? { subcategoryId } : {},
                (brand || model || year) ? {
                    compatibilities: {
                        some: {
                            vehicle: vehicleFilter
                        }
                    }
                } : {}
            ]
        } as any,
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

                <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm flex flex-col">
                    <div className="p-4 border-b border-border bg-muted/20 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <Suspense fallback={<div className="h-10 w-full md:w-[400px] bg-muted animate-pulse rounded-lg"></div>}>
                            <AdminSearch />
                        </Suspense>
                        <div className="text-sm text-foreground/60 font-medium">
                            พบ {parts.length} รายการ
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-muted/50 border-b border-border text-sm">
                                    <th className="p-3 font-semibold text-foreground/70 w-[20%]">รหัสอะไหล่</th>
                                    <th className="p-3 font-semibold text-foreground/70 w-[50%]">ข้อมูลอะไหล่</th>
                                    <th className="p-3 font-semibold text-foreground/70 w-[15%] text-center">หมวดหมู่/ยี่ห้อ</th>
                                    <th className="p-3 font-semibold text-foreground/80 text-right w-[10%]">ราคา</th>
                                    <th className="p-3 font-semibold text-foreground/80 text-center w-[5%]">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {parts.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-foreground/50">
                                            ยังไม่มีข้อมูลอะไหล่ในระบบ
                                        </td>
                                    </tr>
                                ) : parts.map(part => (
                                    <tr key={part.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                                        <td className="p-3 align-top font-mono text-sm">
                                            <div className="text-primary font-bold">{part.partNumber}</div>
                                            {(part.engineCode || part.chassisNumber) && (
                                                <div className="mt-1 flex flex-col gap-1 text-[11px]">
                                                    {part.engineCode && (
                                                        <span className="text-amber-600 dark:text-amber-400 font-semibold" title="รหัสเครื่องยนต์">
                                                            {part.engineCode}
                                                        </span>
                                                    )}
                                                    {part.chassisNumber && (
                                                        <span className="text-purple-600 dark:text-purple-400 font-semibold" title="เลขตัวถัง">
                                                            {part.chassisNumber}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                            {part.alternativeNumbers && part.alternativeNumbers.length > 0 && (
                                                <div className="mt-2 flex flex-wrap gap-1">
                                                    {part.alternativeNumbers.map(alt => (
                                                        <span key={alt.id} title={alt.note || "รหัสเทียบ"} className="inline-block bg-secondary/10 text-secondary-foreground px-1.5 py-0.5 rounded text-[10px] border border-secondary/20 block w-max">
                                                            {alt.number}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-3 align-top">
                                            <div className="font-semibold text-foreground mb-1">{part.name}</div>
                                            {part.description && (
                                                <div className="text-xs text-foreground/70 mb-2 max-w-xl line-clamp-2" title={part.description}>
                                                    {part.description}
                                                </div>
                                            )}
                                            
                                            {/* Dimensions */}
                                            {(part.width || part.length || part.height || part.innerDiameter || part.outerDiameter) && (
                                                <div className="flex flex-wrap gap-1.5 mb-2 mt-1">
                                                    {(() => {
                                                        const configs = getDimensionConfigs(part.category?.name);
                                                        const renderDim = (key: 'width'|'length'|'height'|'innerDiameter'|'outerDiameter', val: any) => {
                                                            const conf = configs.find(c => c.key === key);
                                                            if (!conf || !val) return null;
                                                            const isDia = key === 'innerDiameter' || key === 'outerDiameter';
                                                            return (
                                                                <span key={key} className={`${isDia ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800" : "bg-muted/50 text-foreground/80 border-border"} border text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1`}>
                                                                    <span className="font-medium opacity-70">{conf.shortLabel}:</span> {val}
                                                                </span>
                                                            );
                                                        };
                                                        return (
                                                            <>
                                                                {renderDim('width', part.width)}
                                                                {renderDim('length', part.length)}
                                                                {renderDim('height', part.height)}
                                                                {renderDim('innerDiameter', part.innerDiameter)}
                                                                {renderDim('outerDiameter', part.outerDiameter)}
                                                            </>
                                                        );
                                                    })()}
                                                </div>
                                            )}
                                            
                                            {/* Compatibilities */}
                                            {part.compatibilities && part.compatibilities.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {part.compatibilities.map((comp: any) => (
                                                        <span key={comp.id} className="inline-block bg-primary/5 text-primary border border-primary/10 px-1.5 py-0.5 rounded text-[10px]">
                                                            {comp.vehicle?.model?.brand?.name} {comp.vehicle?.model?.name} {comp.vehicle?.year}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-3 align-top">
                                            <div className="flex flex-col items-center gap-1.5">
                                                {part.category ? (
                                                    <span className="bg-muted px-2 py-0.5 rounded text-[11px] w-full text-center truncate" title={part.category.name}>{part.category.name}</span>
                                                ) : <span className="text-foreground/40 text-[11px]">-</span>}
                                                {part.subcategory && (
                                                    <span className="bg-secondary/10 text-secondary-foreground border border-secondary/20 px-2 py-0.5 rounded text-[11px] w-full text-center truncate" title={part.subcategory.name}>{part.subcategory.name}</span>
                                                )}
                                                {part.partBrand && (
                                                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[11px] font-semibold w-full text-center border border-primary/20 truncate" title={part.partBrand}>
                                                        {part.partBrand}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-3 align-top text-right font-medium">
                                            <div className="text-sm mt-1">
                                                {part.price ? `฿${part.price.toLocaleString()}` : '-'}
                                            </div>
                                        </td>
                                        <td className="p-3 align-top">
                                            <div className="flex items-center justify-center gap-1 mt-0">
                                                <Link href={`/admin/edit/${part.id}`} className="p-1.5 text-foreground/60 hover:text-primary transition-colors rounded-lg hover:bg-primary/10" title="แก้ไข">
                                                    <Edit size={16} />
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
