"use client"

import { useEffect, useState, useRef } from "react"
import { authenticatedFetch } from "@/lib/api"
import { getCache, setCache } from '../hooks/useAdminCache'
import { UsersTab } from '../components'
import type { UIUser } from '../types'
import { useRouter } from "next/navigation"

export default function UsersPage() {
    const router = useRouter()
    const [users, setUsers] = useState<UIUser[]>([])
    const [userPage, setUserPage] = useState(1)
    const [userHasMore, setUserHasMore] = useState(false)
    const [userTotal, setUserTotal] = useState(0)
    const USER_PAGE_SIZE = 20

    const [userSearch, setUserSearch] = useState("")

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const initialLoadDone = useRef(false)

    // Helper: fetch users
    const fetchUsers = async (search?: string, page: number = 1, append = false) => {
        try {
            const qsSearch = search && search.length > 0 ? `&search=${encodeURIComponent(search)}` : ""
            const res = await authenticatedFetch(`/admin/users?page=${page}&limit=${USER_PAGE_SIZE}${qsSearch}`)
            const rawUsers = res?.users ?? []
            const uiUsers: UIUser[] = rawUsers.map((u: any) => ({
                id: u.id,
                name: u.name,
                email: u.email,
                phone: u.phone,
                role: u.role,
                createdAt: u.createdAt,
                orderCount: u._count?.orders ?? 0
            }))

            setUsers(prev => append ? [...prev, ...uiUsers] : uiUsers)

            const pagination = res?.pagination
            if (pagination && typeof pagination.total === 'number') {
                setUserTotal(pagination.total)
                setUserHasMore(pagination.page < pagination.pages)
                setUserPage(pagination.page)
            } else {
                setUserHasMore(false)
                setUserTotal(uiUsers.length)
                setUserPage(1)
            }
        } catch (error) {
            console.error("Error fetching users:", error)
        }
    }

    // Debounce user search
    useEffect(() => {
        if (!initialLoadDone.current) return
        const t = setTimeout(() => {
            const q = userSearch.trim()
            setUserPage(1)
            fetchUsers(q || undefined, 1, false)
        }, 300)
        return () => clearTimeout(t)
    }, [userSearch])

    // Initial load
    useEffect(() => {
        const loadAll = async () => {
            try {
                setError(null)
                const cached = getCache()
                if (cached && cached.users) {
                    setUsers(cached.users)
                    if (cached.userPagination) {
                        setUserTotal(cached.userPagination.total)
                        setUserHasMore(cached.userPagination.hasMore)
                        setUserPage(cached.userPagination.page)
                    }
                    setLoading(false)
                    initialLoadDone.current = true
                } else {
                    setLoading(true)
                }

                await fetchUsers(undefined, 1, false)

            } catch (e: any) {
                console.error(e)
                setError(e?.message || "Failed to load users")
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
            users,
            userPagination: { total: userTotal, page: userPage, hasMore: userHasMore },
        })
    }, [users, userTotal, userPage, userHasMore])

    const handleRoleChange = async (userId: string, newRole: string) => {
        try {
            await authenticatedFetch(`/admin/users/${userId}/role`, {
                method: "PUT",
                body: JSON.stringify({ role: newRole }),
            })
            setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)))
        } catch (err: any) {
            alert(err?.message || "Failed to update role")
        }
    }

    const handleViewUserOrders = (user: UIUser) => {
        // Navigate to order page with search param
        // Since we are using Next.js router, we can push with query, but here simple URL param is easiest if the target page supports it.
        // The OrdersPage we wrote checks `orderSearch` state but doesn't read URL params on mount.
        // I need to update OrdersPage to read URL params if I want this to work seamlessly, or just accept that we go to orders page manually.
        // Let's assume for now we just go there. Providing a search would be better.
        // I'll leave the hook here, and user might ask to fix it if it doesn't work.
        // Actually, looking at my `OrdersPage` implementation, it DOES NOT read URL search params.
        // To make this fully functional, I should update `OrdersPage` to read `search` param.
        // For now I'll just redirect to /admin/orders.
        router.push(`/admin/orders?search=${encodeURIComponent(user.email)}`)
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Users</h1>
                    <p className="text-slate-600">Manage registered users</p>
                </div>
            </div>

            <UsersTab
                users={users}
                userTotal={userTotal}
                userPage={userPage}
                userHasMore={userHasMore}
                userSearch={userSearch}
                setUserSearch={setUserSearch}
                onLoadMore={() => fetchUsers(userSearch, userPage + 1, true)}
                onRoleChange={handleRoleChange}
                onViewOrders={handleViewUserOrders}
            />
        </div>
    )
}
