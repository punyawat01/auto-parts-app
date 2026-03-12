'use client';

import { useState } from 'react';
import { Package, Tag, Layers, ChevronRight, Car, Copy, Check } from 'lucide-react';
import { getDimensionConfigs } from '@/lib/dimensionConfig';

function CopyableBadge({ text, className, title }: { text: string, className?: string, title?: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <span
            onClick={handleCopy}
            title={title || "คลิกเพื่อคัดลอก"}
            className={`inline-flex items-center gap-1.5 cursor-pointer hover:ring-1 hover:ring-primary/50 transition-all active:scale-95 ${className || ''}`}
        >
            {text}
            {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} className="opacity-40" />}
        </span>
    );
}

export default function PartsList({ parts, isSearching }: { parts: any[], isSearching: boolean }) {
    if (isSearching) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="bg-card border border-border rounded-xl p-6 h-48">
                        <div className="h-6 bg-border/50 rounded w-1/3 mb-4"></div>
                        <div className="h-8 bg-border/50 rounded w-3/4 mb-4"></div>
                        <div className="h-4 bg-border/50 rounded w-full mb-2"></div>
                        <div className="h-4 bg-border/50 rounded w-5/6"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (!parts || parts.length === 0) {
        return (
            <div className="bg-card border border-border rounded-xl p-12 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4 text-foreground/30">
                    <Package size={32} />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">ไม่พบรายการอะไหล่</h3>
                <p className="text-foreground/60 max-w-sm">ลองปรับเงื่อนไขการค้นหาใหม่ หรือตรวจสอบรุ่นรถและปีที่เลือกอีกครั้ง</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {parts.map((part) => (
                <div
                    key={part.id}
                    className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-shadow group flex flex-col h-full"
                >
                    <div className="flex justify-between items-start mb-2 gap-4">
                        <div>
                            <h3 className="font-bold text-lg text-foreground mb-1">{part.name}</h3>
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                <CopyableBadge
                                    text={part.partNumber}
                                    title="คัดลอกรหัสอะไหล่"
                                    className="bg-muted text-muted-foreground px-2 py-1 rounded-md text-xs font-medium border border-border"
                                />
                                {part.partBrand && (
                                    <span className="inline-block bg-primary/10 text-primary px-2 py-1 rounded-md text-xs font-bold border border-primary/20">
                                        {part.partBrand}
                                    </span>
                                )}
                                {part.engineCode && (
                                    <span className="inline-block bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-1 rounded-md text-xs font-bold border border-amber-500/20" title="รหัสเครื่องยนต์">
                                        {part.engineCode}
                                    </span>
                                )}
                                {part.chassisNumber && (
                                    <span className="inline-block bg-purple-500/10 text-purple-600 dark:text-purple-400 px-2 py-1 rounded-md text-xs font-bold border border-purple-500/20" title="เลขตัวถัง">
                                        {part.chassisNumber}
                                    </span>
                                )}
                                {part.alternativeNumbers && part.alternativeNumbers.length > 0 && part.alternativeNumbers.map((alt: any) => (
                                    <CopyableBadge
                                        key={alt.id}
                                        text={alt.number}
                                        title={alt.note || "รหัสเทียบ (คลิกเพื่อคัดลอก)"}
                                        className="bg-secondary/10 text-secondary-foreground px-2 py-1 rounded-md text-[10px] sm:text-xs font-mono border border-secondary/20"
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            {part.category && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-muted text-foreground/70">
                                    <Layers size={12} />
                                    {part.category.name}
                                </span>
                            )}
                            {part.subcategory && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-secondary/10 text-secondary-foreground border border-secondary/20">
                                    <Tag size={12} />
                                    {part.subcategory.name}
                                </span>
                            )}
                        </div>
                    </div>

                    <p className="text-sm text-foreground/70 mb-4 line-clamp-2">
                        {part.description || "ไม่มีรายละเอียดเพิ่มเติม"}
                    </p>

                    {/* Dimensions Row */}
                    {(part.width || part.length || part.height || part.innerDiameter || part.outerDiameter) && (
                        <div className="flex flex-wrap gap-2 mb-4 mt-auto">
                            {(() => {
                                const configs = getDimensionConfigs(part.category?.name);
                                const renderDim = (key: 'width'|'length'|'height'|'innerDiameter'|'outerDiameter', val: any) => {
                                    const conf = configs.find(c => c.key === key);
                                    if (!conf || !val) return null;
                                    const isDia = key === 'innerDiameter' || key === 'outerDiameter';
                                    return (
                                        <span key={key} className={`${isDia ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800" : "bg-muted/50 text-foreground/80"} text-[10px] px-2 py-1 rounded`}>
                                            {conf.shortLabel}: {val}
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

                    {/* Compatibility Row */}
                    {part.compatibilities && part.compatibilities.length > 0 && (
                        <div className="mb-4">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground/70 mb-2">
                                <Car size={14} />
                                <span>รุ่นรถที่ใช้ได้:</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {part.compatibilities.map((comp: any) => (
                                    <span key={comp.id} className="inline-block bg-primary/5 text-primary border border-primary/10 px-2 py-0.5 rounded text-[11px]">
                                        {comp.vehicle?.model?.brand?.name} {comp.vehicle?.model?.name} {comp.vehicle?.year}
                                        {comp.notes && <span className="text-primary/60 ml-1">({comp.notes})</span>}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex items-end justify-between mt-auto pt-4 border-t border-border/50">
                        <div>
                            <p className="text-xs text-foreground/50 mb-1">ราคา</p>
                            <p className="text-2xl font-extrabold text-foreground">
                                {part.price ? `฿${part.price.toLocaleString()}` : "ติดต่อสอบถาม"}
                            </p>
                        </div>

                        <button className="h-10 w-10 rounded-full bg-primary/5 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
