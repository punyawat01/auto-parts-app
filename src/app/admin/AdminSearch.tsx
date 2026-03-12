'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Search, ChevronDown, ChevronUp } from 'lucide-react'
import { getBrands, getModelsByBrand, getYearsByModel } from '@/app/actions/vehicles'
import { getCategories, getSubcategories } from '@/app/actions/parts'

export default function AdminSearch() {
    const router = useRouter()
    const searchParams = useSearchParams()

    // Initialize state from URL params
    const [query, setQuery] = useState(searchParams.get('q') || '')
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('categoryId') || '')
    const [selectedSubcategory, setSelectedSubcategory] = useState(searchParams.get('subcategoryId') || '')
    const [selectedBrand, setSelectedBrand] = useState(searchParams.get('brand') || '')
    const [selectedModel, setSelectedModel] = useState(searchParams.get('model') || '')
    const [selectedYear, setSelectedYear] = useState(searchParams.get('year') || '')

    // Form options
    const [categories, setCategories] = useState<any[]>([])
    const [subcategories, setSubcategories] = useState<any[]>([])
    const [brands, setBrands] = useState<any[]>([])
    const [models, setModels] = useState<any[]>([])
    const [years, setYears] = useState<any[]>([])

    const [isExpanded, setIsExpanded] = useState(false)

    // Load Initial Categories
    useEffect(() => {
        getCategories().then(res => {
            if (res.success) setCategories(res.data || [])
        })
    }, [])

    // Load Brands & Subcategories when Category changes
    useEffect(() => {
        const catId = selectedCategory ? Number(selectedCategory) : undefined
        getBrands(catId).then(res => {
            if (res.success) setBrands(res.data || [])
        })

        setSubcategories([])
        if (catId) {
            getSubcategories(catId).then(res => {
                if (res.success) setSubcategories(res.data || [])
            })
        } else {
            setSelectedSubcategory('')
        }
    }, [selectedCategory])

    // Load Models
    useEffect(() => {
        setModels([])
        const foundBrand = brands.find(b => b.name.toLowerCase() === selectedBrand.toLowerCase())
        const catId = selectedCategory ? Number(selectedCategory) : undefined
        if (foundBrand) {
            getModelsByBrand(foundBrand.id, catId).then(res => {
                if (res.success) setModels(res.data || [])
            })
        } else {
            setSelectedModel('')
            setSelectedYear('')
        }
    }, [selectedBrand, brands, selectedCategory])

    // Load Years
    useEffect(() => {
        setYears([])
        const foundModel = models.find(m => m.name.toLowerCase() === selectedModel.toLowerCase())
        const catId = selectedCategory ? Number(selectedCategory) : undefined
        if (foundModel) {
            getYearsByModel(foundModel.id, catId).then(res => {
                if (res.success) setYears(res.data || [])
            })
        } else {
            setSelectedYear('')
        }
    }, [selectedModel, models, selectedCategory])

    // Debounce pushing to URL when state changes
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            const params = new URLSearchParams()
            if (query) params.set('q', query)
            if (selectedCategory) params.set('categoryId', selectedCategory)
            if (selectedSubcategory) params.set('subcategoryId', selectedSubcategory)
            if (selectedBrand) params.set('brand', selectedBrand)
            if (selectedModel) params.set('model', selectedModel)
            if (selectedYear) params.set('year', selectedYear)

            const searchSt = params.toString()
            router.push(`/admin${searchSt ? `?${searchSt}` : ''}`, { scroll: false })
        }, 400)
        return () => clearTimeout(timeoutId)
    }, [query, selectedCategory, selectedSubcategory, selectedBrand, selectedModel, selectedYear, router])

    return (
        <div className="flex flex-col gap-3 w-full max-w-4xl">
            <div className="flex gap-2 w-full">
                <div className="relative flex-1">
                    <input
                        type="text"
                        placeholder="พิมพ์ค้นหารหัสอะไหล่, ชื่อรหัสเครื่อง, ยี่ห้อ..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-card text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm"
                    />
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                </div>
                <button 
                    onClick={() => setIsExpanded(!isExpanded)} 
                    className="flex items-center gap-1 px-3 py-2 bg-muted/50 rounded-lg text-sm text-foreground/80 hover:bg-muted border border-border transition-colors whitespace-nowrap"
                >
                    ตัวกรอง {isExpanded ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                </button>
            </div>

            {isExpanded && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-muted/20 border border-border/50 rounded-xl mt-2 animate-in fade-in slide-in-from-top-2">
                     <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-foreground/70">หมวดหมู่</label>
                        <select
                            className="p-2 text-sm rounded-lg border border-border bg-background"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                            <option value="">-- ทั้งหมด --</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    {selectedCategory && (
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-foreground/70">หมวดหมู่ย่อย</label>
                            <select
                                className="p-2 text-sm rounded-lg border border-border bg-background"
                                value={selectedSubcategory}
                                onChange={(e) => setSelectedSubcategory(e.target.value)}
                            >
                                <option value="">-- ทั้งหมด --</option>
                                {subcategories.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                    )}

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-foreground/70">ยี่ห้อรถ (Brand)</label>
                        <input
                            list="adminBrandList"
                            placeholder="พิมพ์/เลือกยี่ห้อ"
                            className="p-2 text-sm rounded-lg border border-border bg-background"
                            value={selectedBrand}
                            onChange={(e) => setSelectedBrand(e.target.value)}
                        />
                        <datalist id="adminBrandList">{brands.map(b => <option key={b.id} value={b.name} />)}</datalist>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-foreground/70">รุ่นรถ (Model)</label>
                        <input
                            list="adminModelList"
                            placeholder="พิมพ์/เลือกรุ่น"
                            className="p-2 text-sm rounded-lg border border-border bg-background"
                            value={selectedModel}
                            onChange={(e) => setSelectedModel(e.target.value)}
                        />
                        <datalist id="adminModelList">{models.map(m => <option key={m.id} value={m.name} />)}</datalist>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-foreground/70">ปี (Year)</label>
                        <input
                            list="adminYearList"
                            placeholder="พิมพ์/เลือกปี"
                            className="p-2 text-sm rounded-lg border border-border bg-background"
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                        />
                        <datalist id="adminYearList">{years.map(y => <option key={y.id} value={y.year} />)}</datalist>
                    </div>
                </div>
            )}
        </div>
    )
}
