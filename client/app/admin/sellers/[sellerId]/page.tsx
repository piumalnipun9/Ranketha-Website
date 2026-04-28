"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { authenticatedFetch } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Calendar, Package, ArrowLeft, User } from "lucide-react"
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

interface SellerOrder {
    id: string
    createdAt: string
    status: string
    totalAmount: number
    user?: {
        id: string
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

interface SellerInfo {
    id: string
    name: string | null
    email: string
}

export default function AdminSellerDetailPage() {
    const params = useParams()
    const router = useRouter()
    const sellerId = params.sellerId as string

    const [loading, setLoading] = useState(true)
    const [seller, setSeller] = useState<SellerInfo | null>(null)
    const [monthlySummaries, setMonthlySummaries] = useState<MonthlySummary[]>([])
    const [totalSales, setTotalSales] = useState(0)
    const [totalOrders, setTotalOrders] = useState(0)

    useEffect(() => {
        const loadSellerData = async () => {
            try {
                // Fetch seller info directly from the users endpoint
                const sellerRes = await authenticatedFetch(`/admin/users/${sellerId}`)
                if (sellerRes) {
                    setSeller({
                        id: sellerRes.id,
                        name: sellerRes.name,
                        email: sellerRes.email
                    })
                }

                // Fetch all orders for this seller
                const ordersRes = await authenticatedFetch(`/admin/orders?userId=${sellerId}&limit=500`)
                const allOrders: SellerOrder[] = ordersRes?.orders || []

                // Group by month
                const monthMap = new Map<string, MonthlySummary>()
                let total = 0

                allOrders.forEach(order => {
                    if (order.status === 'CART') return

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
                    total += order.totalAmount
                })

                const summaries = Array.from(monthMap.values()).sort((a, b) => {
                    if (b.year !== a.year) return b.year - a.year
                    return b.month - a.month
                })

                setMonthlySummaries(summaries)
                setTotalSales(total)
                setTotalOrders(allOrders.filter(o => o.status !== 'CART').length)
            } catch (err) {
                console.error("Failed to load seller data", err)
            } finally {
                setLoading(false)
            }
        }
        loadSellerData()
    }, [sellerId])

    const handleMonthClick = (year: number, month: number) => {
        router.push(`/admin/sellers/${sellerId}/${year}/${month}`)
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
                <div className="text-lg text-slate-600">Loading...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            {/* Navigation */}
            <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-3">
                            <Image src="/roboclub-logo.png" alt="RoboClub Logo" width={32} height={32} className="object-contain w-8 h-8" />
                            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                                RoboClub Admin
                            </span>
                        </div>

                        <div className="flex items-center space-x-4">
                            <Link href="/" className="text-slate-700 hover:text-blue-600 font-medium transition-colors">
                                View Store
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Back Button & Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push('/admin')}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Admin
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                            <User className="h-8 w-8 text-orange-600" />
                            {seller?.name || "Seller"}
                        </h1>
                        <p className="text-slate-600">{seller?.email}</p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <Card className="bg-white/80 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <DollarSign className="h-8 w-8 text-green-600" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-slate-600">Total Sales</p>
                                    <p className="text-2xl font-bold text-slate-900">LKR {totalSales.toLocaleString()}</p>
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
                                    <p className="text-2xl font-bold text-slate-900">{totalOrders}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Monthly Sales Summary */}
                <Card className="bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-blue-600" />
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
                                                No sales data found for this seller.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        monthlySummaries.map((summary) => (
                                            <TableRow
                                                key={`${summary.year}-${summary.month}`}
                                                className="cursor-pointer hover:bg-blue-50 transition-colors"
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
