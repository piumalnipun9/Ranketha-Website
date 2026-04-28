import type React from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const companyName = process.env.NEXT_PUBLIC_COMPANY_NAME || 'Ranketha'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-white">
            {/* Navigation */}
            <nav className="bg-white/90 backdrop-blur-md border-b border-[#072C2B]/10 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-3">
                            <Image src="/companyLogo.svg" alt={`${companyName} Logo`} width={32} height={32} className="object-contain w-8 h-8" />
                            <Link href="/admin">
                                <span className="text-xl font-bold text-[#072C2B]">
                                    {companyName} Admin
                                </span>
                            </Link>
                        </div>

                        <div className="flex items-center space-x-4">
                            <Link href="/" className="text-[#072C2B] hover:text-[#072C2B]/70 font-medium transition-colors">
                                View Store
                            </Link>
                            <Button
                                variant="outline"
                                size="sm"
                                className="border-[#072C2B] text-[#072C2B] hover:bg-[#072C2B] hover:text-white"
                            >
                                Logout
                            </Button>
                        </div>
                    </div>
                </div>
            </nav>

            <main>
                {children}
            </main>
        </div>
    )
}
