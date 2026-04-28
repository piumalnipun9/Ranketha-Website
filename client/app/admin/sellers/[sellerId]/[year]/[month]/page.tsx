"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { authenticatedFetch } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Calendar, Package, ArrowLeft, ShoppingBag } from "lucide-react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"

interface SellerOrder {
    id: string
    createdAt: string
    status: string
    totalAmount: number
    user?: {
        name: string | null
        email: string
    }
}

interface MonthlyStats {
    totalSales: number
    totalOrders: number
    averageOrderValue: number
}

export default function AdminSellerMonthlyPage() {
    const params = useParams()
    const router = useRouter()
    const sellerId = params.sellerId as string
    const year = Number(params.year)
    const month = Number(params.month)

    const [loading, setLoading] = useState(true)
    const [orders, setOrders] = useState<SellerOrder[]>([])
    const [stats, setStats] = useState<MonthlyStats>({
        totalSales: 0,
        totalOrders: 0,
        averageOrderValue: 0
    })
    const [sellerName, setSellerName] = useState("")

    const monthName = new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long' })

    useEffect(() => {
        const loadMonthlyData = async () => {
            try {
                // Fetch seller info
                const userRes = await authenticatedFetch(`/admin/users?search=${sellerId}`)
                const users = userRes?.users || []
                const sellerUser = users.find((u: any) => u.id === sellerId)
                if (sellerUser) {
                    setSellerName(sellerUser.name || sellerUser.email)
                }

                // Fetch all orders for this seller
                const ordersRes = await authenticatedFetch(`/admin/orders?userId=${sellerId}&limit=500`)
                const allOrders: SellerOrder[] = ordersRes?.orders || []

                // Filter orders for this specific month
                const monthlyOrders = allOrders.filter(order => {
                    if (order.status === 'CART') return false
                    const date = new Date(order.createdAt)
                    return date.getFullYear() === year && date.getMonth() + 1 === month
                })

                setOrders(monthlyOrders)

                // Calculate stats
                const totalSales = monthlyOrders.reduce((sum, order) => sum + order.totalAmount, 0)
                const totalOrders = monthlyOrders.length
                const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0

                setStats({
                    totalSales,
                    totalOrders,
                    averageOrderValue
                })
            } catch (err) {
                console.error("Failed to load monthly data", err)
            } finally {
                setLoading(false)
            }
        }
        loadMonthlyData()
    }, [sellerId, year, month])

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
                        onClick={() => router.push(`/admin/sellers/${sellerId}`)}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">{monthName} {year}</h1>
                        <p className="text-slate-600">Orders for {sellerName}</p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                                    <p className="text-sm font-medium text-slate-600">Avg Order Value</p>
                                    <p className="text-2xl font-bold text-slate-900">LKR {stats.averageOrderValue.toLocaleString()}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Orders Table */}
                <Card className="bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-blue-600" />
                            Orders in {monthName} {year}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border border-slate-200">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Order ID</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {orders.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center h-24 text-slate-500">
                                                No orders found for this month.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        orders.map((order) => (
                                            <TableRow key={order.id}>
                                                <TableCell className="font-medium">
                                                    {order.id.slice(0, 8)}...
                                                </TableCell>
                                                <TableCell className="text-slate-600">
                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className={
                                                        order.status === 'DELIVERED' ? 'bg-green-50 text-green-700 border-green-200' :
                                                            order.status === 'SHIPPED' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                                order.status === 'CANCELLED' ? 'bg-red-50 text-red-700 border-red-200' :
                                                                    'bg-yellow-50 text-yellow-700 border-yellow-200'
                                                    }>
                                                        {order.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right font-medium text-slate-900">
                                                    LKR {order.totalAmount.toLocaleString()}
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
