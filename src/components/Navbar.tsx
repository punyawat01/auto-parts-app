import Link from "next/link";
import { Wrench } from "lucide-react";

export default function Navbar() {
    return (
        <nav className="w-full border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="bg-primary p-2 rounded-lg text-primary-foreground">
                                <Wrench size={24} />
                            </div>
                            <span className="font-bold text-xl tracking-tight text-foreground">
                                ANG<span className="text-primary"> PRO</span>
                            </span>
                        </Link>
                    </div>
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-8">
                            <Link
                                href="/"
                                className="text-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors"
                            >
                                ค้นหาอะไหล่
                            </Link>
                            <Link
                                href="/admin"
                                className="text-foreground/70 hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors"
                            >
                                จัดการสินค้าคลัง
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
