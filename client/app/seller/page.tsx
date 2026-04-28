"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { authenticatedFetch } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, ShoppingBag, Calendar, Package } from "lucide-react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"

interface SellerStats {
    totalSales: number
    totalOrders: number
    monthlySales: number
    monthlyOrders: number
}

interface SellerOrder {
    id: string
    createdAt: string
    status: string
    totalAmount: number
    user: {
        name: string | null
        email: string
    }
}

interface MonthlySummary {
    year: number
    month: number
    monthName: string
    totalSales: number
    orderCount: number
}

export default function SellerPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState<SellerStats>({
        totalSales: 0,
        totalOrders: 0,
        monthlySales: 0,
        monthlyOrders: 0
    })
    const [monthlySummaries, setMonthlySummaries] = useState<MonthlySummary[]>([])

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const statsRes = await authenticatedFetch('/seller/dashboard')
                if (!statsRes) {
                    return
                }
                setStats(statsRes)
                await fetchAllOrdersAndGroup()
            } catch (err) {
                console.error("Failed to load seller dashboard", err)
            } finally {
                setLoading(false)
            }
        }
        loadDashboard()
    }, [])

    const fetchAllOrdersAndGroup = async () => {
        try {
            const res = await authenticatedFetch(`/seller/orders?page=1&limit=500`)
            const allOrders: SellerOrder[] = res.orders || []

            const monthMap = new Map<string, MonthlySummary>()

            allOrders.forEach(order => {
                const date = new Date(order.createdAt)
                const year = date.getFullYear()
                const month = date.getMonth() + 1
                const monthKey = `${year}-${month}`
                const monthName = date.toLocaleDateString('en-US', { month: 'long' })

                if (!monthMap.has(monthKey)) {
                    monthMap.set(monthKey, {
                        year,
                        month,
                        monthName,
                        totalSales: 0,
                        orderCount: 0
                    })
                }

                const summary = monthMap.get(monthKey)!
                summary.totalSales += order.totalAmount
                summary.orderCount += 1
            })

            // Sort by year desc, then month desc
            const summaries = Array.from(monthMap.values()).sort((a, b) => {
                if (b.year !== a.year) return b.year - a.year
                return b.month - a.month
            })
            setMonthlySummaries(summaries)
        } catch (err) {
            console.error(err)
        }
    }

    const handleMonthClick = (year: number, month: number) => {
        router.push(`/seller/${year}/${month}`)
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50 flex items-center justify-center">
                <div className="text-lg text-slate-600">Loading Seller Dashboard...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50">
            {/* Navigation */}
            <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-3">
                            <Image src="/roboclub-logo.png" alt="RoboClub Logo" width={32} height={32} className="object-contain w-8 h-8" />
                            <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent">
                                Seller Dashboard
                            </span>
                        </div>

                        <div className="flex items-center space-x-4">
                            <Link href="/" className="text-slate-700 hover:text-orange-600 font-medium transition-colors">
                                View Store
                            </Link>
                            <Button variant="outline" size="sm">
                                Logout
                            </Button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Seller Dashboard</h1>
                        <p className="text-slate-600">Track your sales and order performance</p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card className="bg-white/80 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <DollarSign className="h-8 w-8 text-green-600" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-slate-600">Total Sales</p>
                                    <p className="text-2xl font-bold text-slate-900">LKR {stats.totalSales.toLocaleString()}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/80 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <Calendar className="h-8 w-8 text-orange-600" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-slate-600">Monthly Sales</p>
                                    <p className="text-2xl font-bold text-slate-900">LKR {stats.monthlySales.toLocaleString()}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/80 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <Package className="h-8 w-8 text-blue-600" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-slate-600">Total Orders</p>
                                    <p className="text-2xl font-bold text-slate-900">{stats.totalOrders}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/80 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <ShoppingBag className="h-8 w-8 text-purple-600" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-slate-600">Monthly Orders</p>
                                    <p className="text-2xl font-bold text-slate-900">{stats.monthlyOrders}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Monthly Sales Summary */}
                <Card className="bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-orange-600" />
                            Monthly Sales Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border border-slate-200">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Year</TableHead>
                                        <TableHead>Month</TableHead>
                                        <TableHead className="text-right">Total Sales</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {monthlySummaries.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center h-24 text-slate-500">
                                                No sales data found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        monthlySummaries.map((summary) => (
                                            <TableRow
                                                key={`${summary.year}-${summary.month}`}
                                                className="cursor-pointer hover:bg-orange-50 transition-colors"
                                                onClick={() => handleMonthClick(summary.year, summary.month)}
                                            >
                                                <TableCell className="font-medium text-slate-900">{summary.year}</TableCell>
                                                <TableCell className="font-medium text-slate-700">{summary.monthName}</TableCell>
                                                <TableCell className="text-right font-bold text-green-600">
                                                    LKR {summary.totalSales.toLocaleString()}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
