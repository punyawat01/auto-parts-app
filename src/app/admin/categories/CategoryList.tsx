'use client'

import { useState, Fragment } from 'react'
import { Plus, Edit, Trash2, Check, X, Loader2, ChevronDown, ChevronRight, CornerDownRight } from 'lucide-react'
import { saveCategory, deleteCategory, saveSubcategory, deleteSubcategory } from '@/app/actions/category'

export type SubcategoryWithCount = {
    id: number;
    name: string;
    categoryId: number;
    _count: { parts: number };
}

export type CategoryWithCount = {
    id: number;
    name: string;
    _count: { parts: number };
    subcategories?: SubcategoryWithCount[];
}

export default function CategoryList({ initialCategories }: { initialCategories: CategoryWithCount[] }) {
    const [categories, setCategories] = useState<CategoryWithCount[]>(initialCategories);

    // State for Add New
    const [isAdding, setIsAdding] = useState(false);
    const [newName, setNewName] = useState('');

    // State for Edit
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editName, setEditName] = useState('');

    // State for Subcategories
    const [expandedCategories, setExpandedCategories] = useState<number[]>([]);
    const [isAddingSub, setIsAddingSub] = useState<number | null>(null); // Category ID
    const [newSubName, setNewSubName] = useState('');
    const [editingSubId, setEditingSubId] = useState<number | null>(null);
    const [editSubName, setEditSubName] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const toggleExpand = (categoryId: number) => {
        if (expandedCategories.includes(categoryId)) {
            setExpandedCategories(expandedCategories.filter(id => id !== categoryId));
            if (isAddingSub === categoryId) setIsAddingSub(null);
        } else {
            setExpandedCategories([...expandedCategories, categoryId]);
        }
    };

    const handleAddNew = async () => {
        if (!newName.trim()) return;
        setIsLoading(true);
        setError('');

        const res = await saveCategory(null, newName);
        if (res.success && res.data) {
            setCategories([...categories, { ...res.data, _count: { parts: 0 } }].sort((a, b) => a.name.localeCompare(b.name)));
            setIsAdding(false);
            setNewName('');
        } else {
            setError(res.error || 'Failed to add category');
        }
        setIsLoading(false);
    };

    const handleEditSave = async (id: number) => {
        if (!editName.trim()) return;
        setIsLoading(true);
        setError('');

        const res = await saveCategory(id, editName);
        if (res.success && res.data) {
            setCategories(categories.map(c => c.id === id ? { ...c, name: res.data.name } : c).sort((a, b) => a.name.localeCompare(b.name)));
            setEditingId(null);
        } else {
            setError(res.error || 'Failed to update category');
        }
        setIsLoading(false);
    };

    const handleDelete = async (id: number, name: string, count: number) => {
        if (count > 0) {
            if (!confirm(`หมวดหมู่นี้มีอะไหล่อยู่ ${count} รายการ หากลบหมวดหมู่นี้ อะไหล่จะถูกตั้งเป็น "ไม่ระบุ" หมวดหมู่แทน\n\nต้องการดำเนินการต่อหรือไม่?`)) {
                return;
            }
        } else {
            if (!confirm(`คุณต้องการลบหมวดหมู่ "${name}" ใช่หรือไม่?`)) {
                return;
            }
        }

        setIsLoading(true);
        setError('');
        const res = await deleteCategory(id);
        if (res.success) {
            setCategories(categories.filter(c => c.id !== id));
        } else {
            setError(res.error || 'Failed to delete category');
        }
        setIsLoading(false);
    };

    const handleAddSubcategory = async (categoryId: number) => {
        if (!newSubName.trim()) return;
        setIsLoading(true);
        setError('');

        const res = await saveSubcategory(null, newSubName, categoryId);
        if (res.success && res.data) {
            setCategories(categories.map(c => {
                if (c.id === categoryId) {
                    const newSub = { ...res.data, _count: { parts: 0 } } as unknown as SubcategoryWithCount;
                    return {
                        ...c,
                        subcategories: [...(c.subcategories || []), newSub].sort((a, b) => a.name.localeCompare(b.name))
                    };
                }
                return c;
            }));
            setIsAddingSub(null);
            setNewSubName('');
        } else {
            setError(res.error || 'Failed to add subcategory');
        }
        setIsLoading(false);
    };

    const handleEditSubcategorySave = async (categoryId: number, subId: number) => {
        if (!editSubName.trim()) return;
        setIsLoading(true);
        setError('');

        const res = await saveSubcategory(subId, editSubName, categoryId);
        if (res.success && res.data) {
            setCategories(categories.map(c => {
                if (c.id === categoryId) {
                    return {
                        ...c,
                        subcategories: (c.subcategories || []).map(s => s.id === subId ? { ...s, name: res.data!.name } : s).sort((a, b) => a.name.localeCompare(b.name))
                    };
                }
                return c;
            }));
            setEditingSubId(null);
        } else {
            setError(res.error || 'Failed to update subcategory');
        }
        setIsLoading(false);
    };

    const handleDeleteSubcategory = async (categoryId: number, subId: number, name: string, count: number) => {
        if (count > 0) {
            if (!confirm(`หมวดหมู่ย่อยนี้มีอะไหล่อยู่ ${count} รายการ หากลบหมวดหมู่ย่อยนี้ อะไหล่จะถูกตั้งเป็นไม่มีหมวดหมู่ย่อย\n\nต้องการดำเนินการต่อหรือไม่?`)) {
                return;
            }
        } else {
            if (!confirm(`คุณต้องการลบหมวดหมู่ย่อย "${name}" ใช่หรือไม่?`)) {
                return;
            }
        }

        setIsLoading(true);
        setError('');
        const res = await deleteSubcategory(subId);
        if (res.success) {
            setCategories(categories.map(c => {
                if (c.id === categoryId) {
                    return {
                        ...c,
                        subcategories: (c.subcategories || []).filter(s => s.id !== subId)
                    };
                }
                return c;
            }));
        } else {
            setError(res.error || 'Failed to delete subcategory');
        }
        setIsLoading(false);
    };

    return (
        <div className="w-full">
            {error && (
                <div className="p-4 bg-red-50 text-red-600 border-b border-red-100 text-sm">
                    {error}
                </div>
            )}

            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-muted/50 border-b border-border">
                        <th className="p-4 font-semibold text-foreground/80">ชื่อหมวดหมู่</th>
                        <th className="p-4 font-semibold text-foreground/80 text-center w-32">จำนวนสินค้า</th>
                        <th className="p-4 font-semibold text-foreground/80 text-center w-32">จัดการ</th>
                    </tr>
                </thead>
                <tbody>
                    {/* Add New Row */}
                    {isAdding && (
                        <tr className="border-b border-border bg-primary/5">
                            <td className="p-4">
                                <input
                                    autoFocus
                                    placeholder="ชื่อหมวดหมู่ใหม่..."
                                    className="w-full p-2 border border-border rounded bg-background outline-none focus:border-primary"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddNew()}
                                    disabled={isLoading}
                                />
                            </td>
                            <td className="p-4 text-center text-foreground/40">-</td>
                            <td className="p-4">
                                <div className="flex items-center justify-center gap-2">
                                    <button onClick={handleAddNew} disabled={isLoading} className="text-green-600 hover:bg-green-50 p-2 rounded transition-colors disabled:opacity-50">
                                        {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                                    </button>
                                    <button onClick={() => { setIsAdding(false); setError('') }} disabled={isLoading} className="text-foreground/50 hover:bg-muted p-2 rounded transition-colors disabled:opacity-50">
                                        <X size={18} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    )}

                    {!isAdding && categories.length === 0 ? (
                        <tr>
                            <td colSpan={3} className="p-8 text-center text-foreground/50">
                                ยังไม่มีรายการหมวดหมู่
                            </td>
                        </tr>
                    ) : categories.map(cat => (
                        <Fragment key={cat.id}>
                            <tr className="border-b border-border hover:bg-muted/20 transition-colors">
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => toggleExpand(cat.id)}
                                            className="p-1 hover:bg-muted rounded text-foreground/60 transition-colors"
                                        >
                                            {expandedCategories.includes(cat.id) ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                        </button>
                                        {editingId === cat.id ? (
                                            <input
                                                autoFocus
                                                className="w-full p-2 border border-border rounded bg-background outline-none focus:border-primary font-medium"
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleEditSave(cat.id)}
                                                disabled={isLoading}
                                            />
                                        ) : (
                                            <span className="font-medium cursor-pointer" onClick={() => toggleExpand(cat.id)}>
                                                {cat.name}
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="p-4 text-center">
                                    <span className="bg-muted px-3 py-1 rounded-full text-xs font-semibold text-foreground/70">
                                        {cat._count.parts}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center justify-center gap-2">
                                        {editingId === cat.id ? (
                                            <>
                                                <button onClick={() => handleEditSave(cat.id)} disabled={isLoading} className="text-green-600 hover:bg-green-50 p-2 rounded transition-colors disabled:opacity-50">
                                                    {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                                                </button>
                                                <button onClick={() => { setEditingId(null); setError('') }} disabled={isLoading} className="text-foreground/50 hover:bg-muted p-2 rounded transition-colors disabled:opacity-50">
                                                    <X size={18} />
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => { setEditingId(cat.id); setEditName(cat.name); setError(''); setIsAdding(false); }}
                                                    disabled={isLoading}
                                                    className="text-foreground/60 hover:text-primary hover:bg-primary/10 p-2 rounded transition-colors disabled:opacity-50"
                                                    title="แก้ไขหมวดหมู่"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(cat.id, cat.name, cat._count.parts)}
                                                    disabled={isLoading}
                                                    className="text-foreground/60 hover:text-red-500 hover:bg-red-50 p-2 rounded transition-colors disabled:opacity-50"
                                                    title="ลบหมวดหมู่"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>

                            {/* Subcategories View */}
                            {expandedCategories.includes(cat.id) && (
                                <>
                                    {(cat.subcategories || []).map(sub => (
                                        <tr key={`sub-${sub.id}`} className="border-b border-border/50 bg-muted/5 hover:bg-muted/20 transition-colors">
                                            <td className="p-3 pl-12 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <CornerDownRight size={14} className="text-foreground/40" />
                                                    {editingSubId === sub.id ? (
                                                        <input
                                                            autoFocus
                                                            className="w-full text-sm p-1.5 border border-border rounded bg-background outline-none focus:border-primary"
                                                            value={editSubName}
                                                            onChange={(e) => setEditSubName(e.target.value)}
                                                            onKeyDown={(e) => e.key === 'Enter' && handleEditSubcategorySave(cat.id, sub.id)}
                                                            disabled={isLoading}
                                                        />
                                                    ) : (
                                                        <span className="text-foreground/80">{sub.name}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-3 text-center">
                                                <span className="bg-background border border-border px-2 py-0.5 rounded-full text-[10px] font-medium text-foreground/60">
                                                    {sub._count.parts}
                                                </span>
                                            </td>
                                            <td className="p-3">
                                                <div className="flex items-center justify-center gap-1">
                                                    {editingSubId === sub.id ? (
                                                        <>
                                                            <button onClick={() => handleEditSubcategorySave(cat.id, sub.id)} disabled={isLoading} className="text-green-600 hover:bg-green-50 p-1.5 rounded transition-colors disabled:opacity-50">
                                                                {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                                                            </button>
                                                            <button onClick={() => { setEditingSubId(null); setError('') }} disabled={isLoading} className="text-foreground/50 hover:bg-muted p-1.5 rounded transition-colors disabled:opacity-50">
                                                                <X size={14} />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button
                                                                onClick={() => { setEditingSubId(sub.id); setEditSubName(sub.name); setError(''); setIsAddingSub(null); }}
                                                                disabled={isLoading}
                                                                className="text-foreground/50 hover:text-primary hover:bg-primary/10 p-1.5 rounded transition-colors disabled:opacity-50"
                                                                title="แก้ไขหมวดหมู่ย่อย"
                                                            >
                                                                <Edit size={14} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteSubcategory(cat.id, sub.id, sub.name, sub._count.parts)}
                                                                disabled={isLoading}
                                                                className="text-foreground/50 hover:text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors disabled:opacity-50"
                                                                title="ลบหมวดหมู่ย่อย"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}

                                    {/* Add New Subcategory Row */}
                                    {isAddingSub === cat.id ? (
                                        <tr className="border-b border-border/50 bg-primary/5">
                                            <td className="p-3 pl-12">
                                                <div className="flex items-center gap-2">
                                                    <CornerDownRight size={14} className="text-primary/60" />
                                                    <input
                                                        autoFocus
                                                        placeholder="ชื่อหมวดหมู่ย่อยใหม่..."
                                                        className="w-full text-sm p-1.5 border border-border rounded bg-background outline-none focus:border-primary"
                                                        value={newSubName}
                                                        onChange={(e) => setNewSubName(e.target.value)}
                                                        onKeyDown={(e) => e.key === 'Enter' && handleAddSubcategory(cat.id)}
                                                        disabled={isLoading}
                                                    />
                                                </div>
                                            </td>
                                            <td className="p-3 text-center text-foreground/40 text-sm">-</td>
                                            <td className="p-3">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button onClick={() => handleAddSubcategory(cat.id)} disabled={isLoading} className="text-green-600 hover:bg-green-50 p-1.5 rounded transition-colors disabled:opacity-50">
                                                        {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                                                    </button>
                                                    <button onClick={() => { setIsAddingSub(null); setError('') }} disabled={isLoading} className="text-foreground/50 hover:bg-muted p-1.5 rounded transition-colors disabled:opacity-50">
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        <tr className="border-b border-border/50 bg-muted/5">
                                            <td colSpan={3} className="p-2 pl-12">
                                                <button
                                                    onClick={() => { setIsAddingSub(cat.id); setNewSubName(''); setEditingSubId(null); setError(''); }}
                                                    className="flex items-center gap-1.5 text-xs font-medium text-primary/80 hover:text-primary transition-colors px-2 py-1 rounded hover:bg-primary/10"
                                                >
                                                    <Plus size={14} />เพิ่มหมวดหมู่ย่อย
                                                </button>
                                            </td>
                                        </tr>
                                    )}
                                </>
                            )}
                        </Fragment>
                    ))}
                </tbody>
            </table>

            {!isAdding && (
                <div className="p-4 border-t border-border bg-muted/10">
                    <button
                        onClick={() => { setIsAdding(true); setNewName(''); setEditingId(null); setError(''); }}
                        className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors px-2 py-1"
                    >
                        <Plus size={16} />เพิ่มหมวดหมู่ใหม่
                    </button>
                </div>
            )}
        </div>
    )
}
