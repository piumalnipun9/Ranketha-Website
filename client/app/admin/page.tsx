"use client"

import { useEffect, useState, useRef } from "react"
import { BarChart3, Package, Users, DollarSign, Laptop, ReceiptText, List, Layers, ShoppingCart, FolderKanban, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Link from "next/link"
import { authenticatedFetch } from "@/lib/api"
import { getCache, setCache } from './hooks/useAdminCache'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
  })
  const [totalExpenses, setTotalExpenses] = useState(0)
  const [inventoryValue, setInventoryValue] = useState(0)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const initialLoadDone = useRef(false)

  // Helper: fetch expenses summary
  const fetchExpensesSummary = async () => {
    try {
      const res = await authenticatedFetch(`/admin/expenses/summary/by`)
      const total = typeof res?.total === 'number' ? res.total : 0
      setTotalExpenses(total)
    } catch (_) {
      setTotalExpenses(0)
    }
  }

  useEffect(() => {
    const loadAll = async () => {
      try {
        setError(null)

        // Try to load from cache first for instant display
        const cached = getCache()
        if (cached) {
          if (cached.dashboard) setStats(cached.dashboard)
          if (cached.inventoryValue !== undefined) setInventoryValue(cached.inventoryValue)
          if (cached.totalExpenses !== undefined) setTotalExpenses(cached.totalExpenses)
          setLoading(false)
          initialLoadDone.current = true
        } else {
          setLoading(true)
        }

        // Fetch dashboard data
        const [dashboard,] = await Promise.all([
          authenticatedFetch("/admin"),
          fetchExpensesSummary(),
        ])

        // Process dashboard data
        const totalOrders = dashboard?.counts?.orders ?? 0
        const totalProducts = dashboard?.counts?.products ?? 0
        const totalCustomers = dashboard?.counts?.users ?? 0
        const totalSales = Array.isArray(dashboard?.salesData)
          ? dashboard.salesData.reduce((sum: number, s: any) => sum + (s?._sum?.totalAmount ?? 0), 0)
          : 0
        const dashboardStats = { totalSales, totalOrders, totalProducts, totalCustomers }
        setStats(dashboardStats)
        const invValue = typeof dashboard?.inventoryValue === 'number' ? dashboard.inventoryValue : 0
        setInventoryValue(invValue)

      } catch (e: any) {
        console.error(e)
        setError(e?.message || "Failed to load admin data")
      } finally {
        setLoading(false)
        initialLoadDone.current = true
      }
    }

    loadAll();
  }, [])

  // Update cache when data changes
  useEffect(() => {
    if (!initialLoadDone.current) return
    const currentCache = getCache() || {}
    setCache({
      ...currentCache,
      dashboard: stats,
      inventoryValue,
      totalExpenses,
    })
  }, [stats, inventoryValue, totalExpenses])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-[#072C2B]/70">Loading dashboard...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-red-600">{error}</span>
      </div>
    )
  }

  const navItems = [
    { title: "Products", href: "/admin/products", icon: Package, color: "text-[#072C2B]", description: "Manage inventory, add items" },
    { title: "Orders", href: "/admin/orders", icon: ShoppingCart, color: "text-[#072C2B]", description: "View and process orders" },
    { title: "Sales", href: "/admin/sales", icon: TrendingUp, color: "text-[#072C2B]", description: "View monthly sales and top items" },
    { title: "Categories", href: "/admin/categories", icon: List, color: "text-[#072C2B]", description: "Organize product categories" },
    { title: "Projects", href: "/admin/projects", icon: FolderKanban, color: "text-[#072C2B]", description: "Manage portfolio projects" },
    { title: "Expenses", href: "/admin/expenses", icon: ReceiptText, color: "text-[#072C2B]", description: "Track business expenses" },
    { title: "Users", href: "/admin/users", icon: Users, color: "text-[#072C2B]", description: "Manage customer accounts" },
    { title: "Sellers", href: "/admin/sellers", icon: Users, color: "text-[#072C2B]", description: "Manage seller accounts" },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#072C2B]">Admin Dashboard</h1>
          <p className="text-[#072C2B]/70">Overview of your store performance</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="bg-white border border-[#072C2B]/10">
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-[#FDCB00]" />
              <div className="ml-4">
                <p className="text-sm font-medium text-[#072C2B]/70">Total Sales</p>
                <p className="text-2xl font-bold text-[#072C2B]">LKR {stats.totalSales.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-[#072C2B]/10">
          <CardContent className="p-6">
            <div className="flex items-center">
              <ReceiptText className="h-8 w-8 text-[#FDCB00]" />
              <div className="ml-4">
                <p className="text-sm font-medium text-[#072C2B]/70">Total Expenses</p>
                <p className="text-2xl font-bold text-[#072C2B]">LKR {totalExpenses.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-[#072C2B]/10">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-[#FDCB00]" />
              <div className="ml-4">
                <p className="text-sm font-medium text-[#072C2B]/70">Total Orders</p>
                <p className="text-2xl font-bold text-[#072C2B]">{stats.totalOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-[#072C2B]/10">
          <CardContent className="p-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-[#FDCB00]" />
              <div className="ml-4">
                <p className="text-sm font-medium text-[#072C2B]/70">Products</p>
                <p className="text-2xl font-bold text-[#072C2B]">{stats.totalProducts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-[#072C2B]/10">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-[#FDCB00]" />
              <div className="ml-4">
                <p className="text-sm font-medium text-[#072C2B]/70">Customers</p>
                <p className="text-2xl font-bold text-[#072C2B]">{stats.totalCustomers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-[#072C2B]/10">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Laptop className="h-8 w-8 text-[#FDCB00]" />
              <div className="ml-4">
                <p className="text-sm font-medium text-[#072C2B]/70">Inventory Value</p>
                <p className="text-2xl font-bold text-[#072C2B]">LKR {inventoryValue.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-2xl font-bold text-[#072C2B] mb-6">Management</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {navItems.map((item) => (
          <Link href={item.href} key={item.title}>
            <Card className="h-full hover:shadow-md transition-shadow cursor-pointer bg-white border border-[#072C2B]/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-medium">
                  {item.title}
                </CardTitle>
                <item.icon className={`h-6 w-6 ${item.color}`} />
              </CardHeader>
              <CardContent>
                <CardDescription>{item.description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
