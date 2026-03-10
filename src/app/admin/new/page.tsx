import Navbar from '@/components/Navbar'
import PartForm from '../PartForm'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function NewPartPage() {
    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Navbar />

            <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-8">
                <div className="mb-6">
                    <Link href="/admin" className="inline-flex items-center text-sm font-medium text-foreground/60 hover:text-primary transition-colors mb-4">
                        <ChevronLeft size={16} className="mr-1" />
                        กลับไปหน้าจัดการ
                    </Link>
                    <h1 className="text-3xl font-bold text-foreground">เพิ่มอะไหล่ใหม่</h1>
                </div>

                <PartForm />
            </main>
        </div>
    )
}
