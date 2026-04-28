"use client"

import { useEffect, useState, useRef } from "react"
import { authenticatedFetch } from "@/lib/api"
import { getCache, setCache } from '../hooks/useAdminCache'
import { UsersTab } from '../components'
import type { UIUser } from '../types'
import { useRouter } from "next/navigation"

export default function SellersPage() {
    const router = useRouter()
    const [sellers, setSellers] = useState<UIUser[]>([])
    const [sellerPage, setSellerPage] = useState(1)
    const [sellerHasMore, setSellerHasMore] = useState(false)
    const [sellerTotal, setSellerTotal] = useState(0)
    const USER_PAGE_SIZE = 20

    const [sellerSearch, setSellerSearch] = useState("")

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const initialLoadDone = useRef(false)

    // Helper: fetch sellers
    const fetchSellers = async (search?: string, page: number = 1, append = false) => {
        try {
            const qsSearch = search && search.length > 0 ? `&search=${encodeURIComponent(search)}` : ""
            const res = await authenticatedFetch(`/admin/users?role=SELLER&page=${page}&limit=${USER_PAGE_SIZE}${qsSearch}`)
            const rawUsers = res?.users ?? []
            const uiSellers: UIUser[] = rawUsers.map((u: any) => ({
                id: u.id,
                name: u.name,
                email: u.email,
                phone: u.phone,
                role: u.role,
                createdAt: u.createdAt,
                orderCount: u._count?.orders ?? 0
            }))

            setSellers(prev => append ? [...prev, ...uiSellers] : uiSellers)

            const pagination = res?.pagination
            if (pagination && typeof pagination.total === 'number') {
                setSellerTotal(pagination.total)
                setSellerHasMore(pagination.page < pagination.pages)
                setSellerPage(pagination.page)
            } else {
                setSellerHasMore(false)
                setSellerTotal(uiSellers.length)
                setSellerPage(1)
            }
        } catch (error) {
            console.error("Error fetching sellers:", error)
        }
    }

    // Debounce seller search
    useEffect(() => {
        if (!initialLoadDone.current) return
        const t = setTimeout(() => {
            const q = sellerSearch.trim()
            setSellerPage(1)
            fetchSellers(q || undefined, 1, false)
        }, 300)
        return () => clearTimeout(t)
    }, [sellerSearch])

    // Initial load
    useEffect(() => {
        const loadAll = async () => {
            try {
                setError(null)
                const cached = getCache()
                if (cached && cached.sellers) {
                    setSellers(cached.sellers)
                    if (cached.sellerPagination) {
                        setSellerTotal(cached.sellerPagination.total)
                        setSellerHasMore(cached.sellerPagination.hasMore)
                        setSellerPage(cached.sellerPagination.page)
                    }
                    setLoading(false)
                    initialLoadDone.current = true
                } else {
                    setLoading(true)
                }

                await fetchSellers(undefined, 1, false)

            } catch (e: any) {
                console.error(e)
                setError(e?.message || "Failed to load sellers")
            } finally {
                setLoading(false)
                initialLoadDone.current = true
            }
        }
        loadAll()
    }, [])

    // Cache update
    useEffect(() => {
        if (!initialLoadDone.current) return
        const currentCache = getCache() || {}
        setCache({
            ...currentCache,
            sellers,
            sellerPagination: { total: sellerTotal, page: sellerPage, hasMore: sellerHasMore },
        })
    }, [sellers, sellerTotal, sellerPage, sellerHasMore])

    const handleRoleChange = async (userId: string, newRole: string) => {
        try {
            await authenticatedFetch(`/admin/users/${userId}/role`, {
                method: "PUT",
                body: JSON.stringify({ role: newRole }),
            })
            setSellers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)))
        } catch (err: any) {
            alert(err?.message || "Failed to update role")
        }
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Sellers</h1>
                    <p className="text-slate-600">Manage seller accounts</p>
                </div>
            </div>

            <UsersTab
                users={sellers}
                userTotal={sellerTotal}
                userPage={sellerPage}
                userHasMore={sellerHasMore}
                userSearch={sellerSearch}
                setUserSearch={setSellerSearch}
                onLoadMore={() => fetchSellers(sellerSearch, sellerPage + 1, true)}
                onRoleChange={handleRoleChange}
                onViewOrders={(user) => router.push(`/admin/orders?search=${encodeURIComponent(user.email)}`)}
                onSellerClick={(sellerId) => window.location.href = `/admin/sellers/${sellerId}`}
                tabValue="sellers"
                title="Sellers Management"
            />
        </div>
    )
}
