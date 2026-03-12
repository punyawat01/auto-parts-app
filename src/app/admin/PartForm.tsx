'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { savePart, SavePartInput } from '@/app/actions/admin'
import { getCategories, getSubcategories } from '@/app/actions/parts'
import { getBrands, getModelsByBrand, getYearsByModel } from '@/app/actions/vehicles'
import { Loader2, Plus, Trash2, Pencil } from 'lucide-react'
import { getDimensionConfigs, DimensionField } from '@/lib/dimensionConfig'

// Basic typescript definitions for the form
type CompatibilityItem = {
    vehicleId: number;
    brandId: number;
    modelId: number;
    notes: string;
}

type AlternativeNumberItem = {
    number: string;
    note: string;
}

export default function PartForm({ initialData }: { initialData?: any }) {
    const router = useRouter();
    const [categories, setCategories] = useState<any[]>([]);
    const [subcategories, setSubcategories] = useState<any[]>([]);
    const [brands, setBrands] = useState<any[]>([]);

    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    // Form State
    const [partNumber, setPartNumber] = useState(initialData?.partNumber || '');
    const [name, setName] = useState(initialData?.name || '');
    const [partBrand, setPartBrand] = useState(initialData?.partBrand || '');
    const [engineCode, setEngineCode] = useState(initialData?.engineCode || '');
    const [chassisNumber, setChassisNumber] = useState(initialData?.chassisNumber || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [price, setPrice] = useState<string>(initialData?.price ? String(initialData.price) : '');
    const [categoryId, setCategoryId] = useState<string>(initialData?.categoryId ? String(initialData.categoryId) : '');
    const [subcategoryId, setSubcategoryId] = useState<string>(initialData?.subcategoryId ? String(initialData.subcategoryId) : '');

    // Dimensions State
    const [width, setWidth] = useState<string>(initialData?.width ? String(initialData.width) : '');
    const [length, setLength] = useState<string>(initialData?.length ? String(initialData.length) : '');
    const [height, setHeight] = useState<string>(initialData?.height ? String(initialData.height) : '');
    const [innerDiameter, setInnerDiameter] = useState<string>(initialData?.innerDiameter ? String(initialData.innerDiameter) : '');
    const [outerDiameter, setOuterDiameter] = useState<string>(initialData?.outerDiameter ? String(initialData.outerDiameter) : '');

    // Compatibilities State
    const [compatibilities, setCompatibilities] = useState<any[]>([]);
    const [editCompIndex, setEditCompIndex] = useState<number | null>(null);

    // Local state for the "Add Compatibility" row
    const [newCompBrand, setNewCompBrand] = useState('');
    const [newCompModel, setNewCompModel] = useState('');
    const [newCompYear, setNewCompYear] = useState('');
    const [newCompNotes, setNewCompNotes] = useState('');

    const [availableModels, setAvailableModels] = useState<any[]>([]);
    const [availableYears, setAvailableYears] = useState<any[]>([]);

    // Alternative Numbers State
    const [alternativeNumbers, setAlternativeNumbers] = useState<AlternativeNumberItem[]>([]);
    const [editAltIndex, setEditAltIndex] = useState<number | null>(null);
    const [newAltNumber, setNewAltNumber] = useState('');
    const [newAltNote, setNewAltNote] = useState('');

    // Find category name for dimensions
    const selectedCategoryObj = categories.find(c => String(c.id) === String(categoryId));
    const dimensionConfigs = getDimensionConfigs(selectedCategoryObj?.name);
    

    const hasDim = (key: DimensionField) => dimensionConfigs.some(c => c.key === key);
    const getDimLabel = (key: DimensionField) => dimensionConfigs.find(c => c.key === key)?.label || '';

    // Load Categories & Brands
    useEffect(() => {
        getCategories().then(res => { if (res.success) setCategories(res.data || []) });
        getBrands().then(res => { if (res.success) setBrands(res.data || []) });

        // If we have initial compatibilities from DB, map them
        if (initialData?.compatibilities) {
            const mapped = initialData.compatibilities.map((c: any) => ({
                brandName: c.vehicle?.model?.brand?.name || '',
                modelName: c.vehicle?.model?.name || '',
                year: c.vehicle?.year || '',
                notes: c.notes || '',
                vehicleLabel: `${c.vehicle?.model?.brand?.name} ${c.vehicle?.model?.name} ${c.vehicle?.year}`
            }));
            setCompatibilities(mapped);
        }

        if (initialData?.alternativeNumbers) {
            setAlternativeNumbers(initialData.alternativeNumbers.map((a: any) => ({
                number: a.number,
                note: a.note || ''
            })));
        }
    }, [initialData]);

    // Handle Category change to load Subcategories
    useEffect(() => {
        setSubcategories([]);
        if (categoryId) {
            getSubcategories(Number(categoryId)).then(res => {
                if (res.success) setSubcategories(res.data || []);
            });
        }
    }, [categoryId]);

    // Handle New Compatibility Brand Change (Autocomplete)
    useEffect(() => {
        setAvailableModels([]);
        const foundBrand = brands.find(b => b.name.toLowerCase() === newCompBrand.toLowerCase());
        if (foundBrand) {
            getModelsByBrand(foundBrand.id).then(res => {
                if (res.success) setAvailableModels(res.data || []);
            });
        }
    }, [newCompBrand, brands]);

    // Handle New Compatibility Model Change (Autocomplete)
    useEffect(() => {
        setAvailableYears([]);
        const foundModel = availableModels.find(m => m.name.toLowerCase() === newCompModel.toLowerCase());
        if (foundModel) {
            getYearsByModel(foundModel.id).then(res => {
                if (res.success) setAvailableYears(res.data || []);
            });
        }
    }, [newCompModel, availableModels]);

    const handleAddCompatibility = () => {
        if (!newCompBrand || !newCompModel || !newCompYear) return;

        if (editCompIndex !== null) {
            const updated = [...compatibilities];
            updated[editCompIndex] = {
                brandName: newCompBrand,
                modelName: newCompModel,
                year: newCompYear,
                notes: newCompNotes,
                vehicleLabel: `${newCompBrand} ${newCompModel} ${newCompYear}`
            };
            setCompatibilities(updated);
            setEditCompIndex(null);
            setNewCompBrand('');
            setNewCompModel('');
            setNewCompYear('');
            setNewCompNotes('');
            return;
        }

        // We no longer rely on specific IDs, just the string fields exactly as typed
        const isDuplicate = compatibilities.some(c =>
            c.brandName.toLowerCase() === newCompBrand.toLowerCase() &&
            c.modelName.toLowerCase() === newCompModel.toLowerCase() &&
            c.year.toLowerCase() === newCompYear.toLowerCase()
        );

        if (isDuplicate) return;

        setCompatibilities([...compatibilities, {
            brandName: newCompBrand,
            modelName: newCompModel,
            year: newCompYear,
            notes: newCompNotes,
            vehicleLabel: `${newCompBrand} ${newCompModel} ${newCompYear}`
        }]);

        // Reset row notes but keep brand/model to allow quickly adding another note/year for same model if needed
        setNewCompNotes('');
        setNewCompYear('');
    };

    const editCompatibility = (index: number) => {
        const c = compatibilities[index];
        setNewCompBrand(c.brandName);
        setNewCompModel(c.modelName);
        setNewCompYear(c.year);
        setNewCompNotes(c.notes);
        setEditCompIndex(index);
    };

    const removeCompatibility = (index: number) => {
        setCompatibilities(compatibilities.filter((_, i) => i !== index));
        if (editCompIndex === index) {
            setEditCompIndex(null);
            setNewCompBrand('');
            setNewCompModel('');
            setNewCompYear('');
            setNewCompNotes('');
        }
    };

    const handleAddAlternativeNumber = () => {
        if (!newAltNumber.trim()) return;

        if (editAltIndex !== null) {
            const updated = [...alternativeNumbers];
            updated[editAltIndex] = { number: newAltNumber.trim(), note: newAltNote.trim() };
            setAlternativeNumbers(updated);
            setEditAltIndex(null);
            setNewAltNumber('');
            setNewAltNote('');
            return;
        }

        const isDuplicate = alternativeNumbers.some(a => a.number.toLowerCase() === newAltNumber.trim().toLowerCase());
        if (isDuplicate) return;

        setAlternativeNumbers([...alternativeNumbers, { number: newAltNumber.trim(), note: newAltNote.trim() }]);
        setNewAltNumber('');
        setNewAltNote('');
    };

    const editAlternativeNumber = (index: number) => {
        const a = alternativeNumbers[index];
        setNewAltNumber(a.number);
        setNewAltNote(a.note);
        setEditAltIndex(index);
    };

    const removeAlternativeNumber = (index: number) => {
        setAlternativeNumbers(alternativeNumbers.filter((_, i) => i !== index));
        if (editAltIndex === index) {
            setEditAltIndex(null);
            setNewAltNumber('');
            setNewAltNote('');
        }
    };



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError('');

        if (!partNumber || !name) {
            setError('กรุณากรอกรหัสอะไหล่และชื่ออะไหล่');
            setIsSaving(false);
            return;
        }

        // Auto commit pending edits
        let finalCompatibilities = [...compatibilities];
        if (editCompIndex !== null) {
            finalCompatibilities[editCompIndex] = {
                brandName: newCompBrand,
                modelName: newCompModel,
                year: newCompYear,
                notes: newCompNotes,
                vehicleLabel: `${newCompBrand} ${newCompModel} ${newCompYear}`
            };
            setEditCompIndex(null);
            setNewCompBrand('');
            setNewCompModel('');
            setNewCompYear('');
            setNewCompNotes('');
        }

        let finalAlternativeNumbers = [...alternativeNumbers];
        if (editAltIndex !== null) {
            finalAlternativeNumbers[editAltIndex] = { number: newAltNumber.trim(), note: newAltNote.trim() };
            setEditAltIndex(null);
            setNewAltNumber('');
            setNewAltNote('');
        }

        const payload: SavePartInput = {
            id: initialData?.id,
            partNumber,
            name,
            partBrand,
            engineCode,
            chassisNumber,
            description,
            price: price ? parseFloat(price) : undefined,
            width: width ? parseFloat(width) : undefined,
            length: length ? parseFloat(length) : undefined,
            height: height ? parseFloat(height) : undefined,
            innerDiameter: innerDiameter ? parseFloat(innerDiameter) : undefined,
            outerDiameter: outerDiameter ? parseFloat(outerDiameter) : undefined,
            categoryId: categoryId ? Number(categoryId) : undefined,
            subcategoryId: subcategoryId ? Number(subcategoryId) : undefined,
            compatibilities: finalCompatibilities.map(c => ({
                brandName: c.brandName,
                modelName: c.modelName,
                year: c.year,
                notes: c.notes
            })),
            alternativeNumbers: finalAlternativeNumbers
        };

        const res = await savePart(payload);

        if (res.success) {
            router.push('/admin');
            router.refresh();
        } else {
            setError(res.error || 'Failed to save part');
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm border border-red-200">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-8">
            

                {/* Basic Info */}
                <div>
                    <h3 className="text-lg font-semibold border-b border-border pb-2 mb-4">ข้อมูลพื้นฐาน</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium">รหัสอะไหล่ (Part Number) *</label>
                            <input required value={partNumber} onChange={e => setPartNumber(e.target.value)} className="p-2 border border-border rounded-lg bg-background" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium">ชื่ออะไหล่ (Name) *</label>
                            <input required value={name} onChange={e => setName(e.target.value)} className="p-2 border border-border rounded-lg bg-background" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium">ยี่ห้ออะไหล่ (Brand)</label>
                            <input value={partBrand} onChange={e => setPartBrand(e.target.value)} placeholder="เช่น Brembo, แท้ศูนย์" className="p-2 border border-border rounded-lg bg-background" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium">รหัสเครื่องยนต์ (Engine Code)</label>
                            <input value={engineCode} onChange={e => setEngineCode(e.target.value)} placeholder="เช่น 1GD, 2TR" className="p-2 border border-border rounded-lg bg-background" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium">เลขตัวถัง (Chassis No./VIN)</label>
                            <input value={chassisNumber} onChange={e => setChassisNumber(e.target.value)} placeholder="เช่น GUN122, TGN140" className="p-2 border border-border rounded-lg bg-background" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium">หมวดหมู่หลัก (Category)</label>
                            <select value={categoryId} onChange={e => { setCategoryId(e.target.value); setSubcategoryId(''); }} className="p-2 border border-border rounded-lg bg-background">
                                <option value="">-- ไม่ระบุ --</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium">หมวดหมู่ย่อย (Subcategory)</label>
                            <select value={subcategoryId} onChange={e => setSubcategoryId(e.target.value)} disabled={!categoryId || subcategories.length === 0} className="p-2 border border-border rounded-lg bg-background disabled:opacity-50">
                                <option value="">-- ไม่ระบุ --</option>
                                {subcategories.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium">ราคา (Price)</label>
                            <input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} className="p-2 border border-border rounded-lg bg-background" />
                        </div>
                        <div className="flex flex-col gap-2 md:col-span-2">
                            <label className="text-sm font-medium">รายละเอียดเพิ่มเติม (Description)</label>
                            <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} className="p-2 border border-border rounded-lg bg-background" />
                        </div>
                    </div>
                </div>

                {/* Dimensions */}
                <div>
                    <h3 className="text-lg font-semibold border-b border-border pb-2 mb-4">ขนาดอะไหล่ (Dimensions)</h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {hasDim('width') && (
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium">{getDimLabel('width')}</label>
                                <input type="number" step="0.01" value={width} onChange={e => setWidth(e.target.value)} placeholder="0.00" className="p-2 border border-border rounded-lg bg-background" />
                            </div>
                        )}
                        {hasDim('length') && (
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium">{getDimLabel('length')}</label>
                                <input type="number" step="0.01" value={length} onChange={e => setLength(e.target.value)} placeholder="0.00" className="p-2 border border-border rounded-lg bg-background" />
                            </div>
                        )}
                        {hasDim('height') && (
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium">{getDimLabel('height')}</label>
                                <input type="number" step="0.01" value={height} onChange={e => setHeight(e.target.value)} placeholder="0.00" className="p-2 border border-border rounded-lg bg-background" />
                            </div>
                        )}
                        {hasDim('innerDiameter') && (
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-blue-600 dark:text-blue-400">{getDimLabel('innerDiameter')}</label>
                                <input type="number" step="0.01" value={innerDiameter} onChange={e => setInnerDiameter(e.target.value)} placeholder="0.00" className="p-2 border border-border rounded-lg bg-background border-blue-200 dark:border-blue-900 focus:ring-blue-500" />
                            </div>
                        )}
                        {hasDim('outerDiameter') && (
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-blue-600 dark:text-blue-400">{getDimLabel('outerDiameter')}</label>
                                <input type="number" step="0.01" value={outerDiameter} onChange={e => setOuterDiameter(e.target.value)} placeholder="0.00" className="p-2 border border-border rounded-lg bg-background border-blue-200 dark:border-blue-900 focus:ring-blue-500" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Alternative Part Numbers */}
                <div>
                    <h3 className="text-lg font-semibold border-b border-border pb-2 mb-4">รหัสเทียบ / รหัส OEM (Alternative Numbers)</h3>

                    <div className="bg-muted/30 p-4 rounded-lg mb-4 flex flex-col md:flex-row gap-4 items-end border border-border">
                        <div className="flex-1">
                            <label className="text-xs font-medium text-muted-foreground block mb-1">รหัสเทียบ / OEM *</label>
                            <input
                                placeholder="เช่น 04465-YZZE1"
                                value={newAltNumber}
                                onChange={e => setNewAltNumber(e.target.value)}
                                className="w-full p-2 text-sm border border-border rounded-lg bg-background"
                                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddAlternativeNumber(); } }}
                            />
                        </div>
                        <div className="flex-1">
                            <label className="text-xs font-medium text-muted-foreground block mb-1">หมายเหตุ (เช่น แท้เบิกศูนย์, เกรดโรงงาน)</label>
                            <input
                                placeholder="เช่น OEM, เบิกญี่ปุ่น"
                                value={newAltNote}
                                onChange={e => setNewAltNote(e.target.value)}
                                className="w-full p-2 text-sm border border-border rounded-lg bg-background"
                                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddAlternativeNumber(); } }}
                            />
                        </div>
                        <button
                            type="button"
                            onClick={handleAddAlternativeNumber}
                            disabled={!newAltNumber.trim()}
                            className="bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-border flex items-center justify-center min-w-[100px] h-[38px] disabled:opacity-50"
                        >
                            <span className="flex items-center gap-1 font-bold whitespace-nowrap"><Plus size={16} /> {editAltIndex !== null ? 'อัพเดต' : 'กำหนด'}</span>
                        </button>
                    </div>

                    <div className="border border-border rounded-lg overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-muted/50 border-b border-border">
                                <tr>
                                    <th className="p-3 font-medium">รหัสอะไหล่เทียบ</th>
                                    <th className="p-3 font-medium">หมายเหตุ</th>
                                    <th className="p-3 font-medium w-24 text-center">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {alternativeNumbers.length === 0 ? (
                                    <tr><td colSpan={3} className="p-4 text-center text-foreground/50">ยังไม่ได้กำหนดรหัสเทียบ</td></tr>
                                ) : alternativeNumbers.map((a, idx) => (
                                    <tr key={idx} className={`border-b border-border last:border-0 hover:bg-muted/20 ${editAltIndex === idx ? 'bg-primary/5' : ''}`}>
                                        <td className="p-3 font-mono text-primary">{a.number}</td>
                                        <td className="p-3 text-foreground/70">{a.note || '-'}</td>
                                        <td className="p-3 text-center flex justify-center gap-2">
                                            <button type="button" onClick={() => editAlternativeNumber(idx)} className="text-blue-500 hover:text-blue-700 p-1">
                                                <Pencil size={16} />
                                            </button>
                                            <button type="button" onClick={() => removeAlternativeNumber(idx)} className="text-red-500 hover:text-red-700 p-1">
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Compatibilities */}
                <div>
                    <h3 className="text-lg font-semibold border-b border-border pb-2 mb-4">รุ่นรถที่รองรับ (Compatibility)</h3>

                    <div className="bg-muted/30 p-4 rounded-lg mb-4 flex flex-col md:flex-row gap-4 items-end border border-border">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                            {/* Brand Input */}
                            <div className="relative">
                                <input
                                    list="brandList"
                                    placeholder="ยี่ห้อ (เช่น Toyota)"
                                    value={newCompBrand}
                                    onChange={e => setNewCompBrand(e.target.value)}
                                    className="w-full p-2 text-sm border border-border rounded-lg"
                                />
                                <datalist id="brandList">
                                    {brands.map(b => <option key={b.id} value={b.name} />)}
                                </datalist>
                            </div>

                            {/* Model Input */}
                            <div className="relative">
                                <input
                                    list="modelList"
                                    placeholder="รุ่น (เช่น Hilux)"
                                    value={newCompModel}
                                    onChange={e => setNewCompModel(e.target.value)}
                                    className="w-full p-2 text-sm border border-border rounded-lg"
                                />
                                <datalist id="modelList">
                                    {availableModels.map(m => <option key={m.id} value={m.name} />)}
                                </datalist>
                            </div>

                            {/* Year Input */}
                            <div className="relative">
                                <input
                                    list="yearList"
                                    placeholder="ปี (เช่น 2020 หรือ 2015-2020)"
                                    value={newCompYear}
                                    onChange={e => setNewCompYear(e.target.value)}
                                    className="w-full p-2 text-sm border border-border rounded-lg"
                                />
                                <datalist id="yearList">
                                    {availableYears.map(y => <option key={y.id} value={y.year} />)}
                                </datalist>
                            </div>
                        </div>
                        <div className="flex-1 w-full">
                            <input placeholder="หมายเหตุ (เช่น 2.4 4WD)" value={newCompNotes} onChange={e => setNewCompNotes(e.target.value)} className="w-full p-2 text-sm border border-border rounded-lg" />
                        </div>
                        <button
                            type="button"
                            onClick={handleAddCompatibility}
                            disabled={!newCompBrand || !newCompModel || !newCompYear}
                            className="bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-border shadow-sm flex items-center justify-center min-w-[100px] h-10 disabled:opacity-50"
                        >
                            <span className="flex items-center gap-1 font-bold whitespace-nowrap"><Plus size={16} /> {editCompIndex !== null ? 'อัพเดต' : 'กำหนด'}</span>
                        </button>
                    </div>

                    <div className="border border-border rounded-lg overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-muted/50 border-b border-border">
                                <tr>
                                    <th className="p-3 font-medium">รุ่นรถ</th>
                                    <th className="p-3 font-medium">หมายเหตุ</th>
                                    <th className="p-3 font-medium w-24 text-center">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {compatibilities.length === 0 ? (
                                    <tr><td colSpan={3} className="p-4 text-center text-foreground/50">ยังไม่ได้กำหนดรุ่นรถ</td></tr>
                                ) : compatibilities.map((c, idx) => (
                                    <tr key={idx} className={`border-b border-border last:border-0 hover:bg-muted/20 ${editCompIndex === idx ? 'bg-primary/5' : ''}`}>
                                        <td className="p-3">
                                            {/* @ts-ignore */}
                                            {c.vehicleLabel || `Vehicle ID: ${c.vehicleId}`}
                                        </td>
                                        <td className="p-3 text-foreground/70">{c.notes || '-'}</td>
                                        <td className="p-3 text-center flex justify-center gap-2">
                                            <button type="button" onClick={() => editCompatibility(idx)} className="text-blue-500 hover:text-blue-700 p-1">
                                                <Pencil size={16} />
                                            </button>
                                            <button type="button" onClick={() => removeCompatibility(idx)} className="text-red-500 hover:text-red-700 p-1">
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="flex justify-end gap-4 mt-4 pt-4 border-t border-border">
                    <button
                        type="button"
                        onClick={() => router.push('/admin')}
                        className="px-6 py-2 rounded-lg border border-border hover:bg-muted font-medium transition-colors"
                    >
                        ยกเลิก
                    </button>
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium transition-colors flex items-center gap-2"
                    >
                        {isSaving && <Loader2 size={16} className="animate-spin" />}
                        บันทึกข้อมูล
                    </button>
                </div>

            </form>
        </div>
    )
}
