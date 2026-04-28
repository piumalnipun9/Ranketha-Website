"use client"

import { useEffect, useState } from "react"
import { authenticatedFetch } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Loader2, TrendingUp, DollarSign, Package } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ProductSales {
    name: string
    image: string
    quantity: number
    revenue: number
}

interface MonthlyData {
    count: number
    revenue: number
    topProducts: ProductSales[]
}

interface SalesResponse {
    summary: any
    timeSeries: Record<string, MonthlyData>
}

export default function SalesPage() {
    const currentYear = new Date().getFullYear()
    const [year, setYear] = useState(currentYear.toString())
    const [data, setData] = useState<SalesResponse | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Generate last 5 years
    const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString())

    useEffect(() => {
        const fetchSales = async () => {
            setLoading(true)
            try {
                // Calculate start and end dates for the selected year
                const startDate = `${year}-01-01`
                const endDate = `${year}-12-31`

                const res = await authenticatedFetch(`/admin/analytics/sales?period=monthly&start=${startDate}&end=${endDate}`)
                setData(res)
            } catch (err: any) {
                setError(err.message || 'Failed to fetch sales data')
            } finally {
                setLoading(false)
            }
        }

        fetchSales()
    }, [year])

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p className="text-red-500">Error: {error}</p>
            </div>
        )
    }

    // Generate chart data for all 12 months
    const chartData = Array.from({ length: 12 }, (_, i) => {
        const month = i + 1
        const dateKey = `${year}-${month}`
        const stats = data?.timeSeries?.[dateKey]
        return {
            date: dateKey,
            displayDate: new Date(Number(year), i).toLocaleString('default', { month: 'short' }),
            revenue: stats?.revenue || 0,
            orders: stats?.count || 0
        }
    })

    // Sort months for display (newest first)
    const sortedMonths = Object.entries(data?.timeSeries || {})
        .sort((a, b) => b[0].localeCompare(a[0]))

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                        <TrendingUp className="h-8 w-8 text-emerald-600" />
                        Monthly Sales
                    </h1>
                    <p className="text-slate-600">Track monthly revenue and top selling products</p>
                </div>
                <div className="w-[180px]">
                    <Select value={year} onValueChange={setYear}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent>
                            {years.map((y) => (
                                <SelectItem key={y} value={y}>{y}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Sales Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>Revenue Overview</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="displayDate" />
                                <YAxis
                                    yAxisId="left"
                                    tickFormatter={(value) => `LKR ${value.toLocaleString()}`}
                                />
                                <YAxis
                                    yAxisId="right"
                                    orientation="right"
                                    dataKey="orders"
                                />
                                <Tooltip
                                    formatter={(value: any, name: any) => [
                                        name === 'Revenue' ? `LKR ${value.toLocaleString()}` : value,
                                        name === 'Revenue' ? 'Revenue' : 'Orders'
                                    ]}
                                />
                                <Legend />
                                <Bar yAxisId="left" dataKey="revenue" fill="#10b981" name="Revenue" radius={[4, 4, 0, 0]} />
                                <Bar yAxisId="right" dataKey="orders" fill="#6366f1" name="Orders" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Monthly Top Products */}
            <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Top Selling Items by Month</h2>
                <div className="space-y-8">
                    {sortedMonths.map(([month, stats]) => (
                        <Card key={month} className="overflow-hidden">
                            <CardHeader className="bg-slate-50 border-b">
                                <div className="flex justify-between items-center">
                                    <CardTitle className="text-xl">{month}</CardTitle>
                                    <div className="flex gap-6 text-sm text-slate-600">
                                        <div className="flex items-center gap-1">
                                            <DollarSign className="h-4 w-4" />
                                            Revenue: <span className="font-semibold text-slate-900">LKR {stats.revenue.toLocaleString()}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Package className="h-4 w-4" />
                                            Orders: <span className="font-semibold text-slate-900">{stats.count}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                {stats.topProducts.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {stats.topProducts.map((product, idx) => (
                                            <div key={idx} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                                                <div className="h-16 w-16 bg-slate-100 rounded-md overflow-hidden flex-shrink-0 border border-slate-200">
                                                    {product.image ? (
                                                        <img
                                                            src={product.image}
                                                            alt={product.name}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="h-full w-full flex items-center justify-center text-slate-400">
                                                            <Package className="h-8 w-8" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-medium text-slate-900 truncate" title={product.name}>
                                                        {product.name}
                                                    </h4>
                                                    <div className="mt-1 flex items-center gap-4 text-sm text-slate-600">
                                                        <span>Qty: {product.quantity}</span>
                                                        <span>LKR {product.revenue.toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-center text-slate-500 py-4">No specific product data for this month.</p>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
}
