"use client"

import { useEffect, useState, useRef } from "react"
import { authenticatedFetch } from "@/lib/api"
import { getCache, setCache } from '../hooks/useAdminCache'
import { CategoriesTab } from '../components'
import type { UICategory } from '../types'

export default function CategoriesPage() {
    const [categories, setCategories] = useState<UICategory[]>([])
    const [selectedCategories, setSelectedCategories] = useState<string[]>([])
    const [newCategoryName, setNewCategoryName] = useState("")

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const initialLoadDone = useRef(false)

    // Helper: fetch categories
    const fetchCategories = async () => {
        const res = await authenticatedFetch(`/admin/categories`)
        const uiCats: UICategory[] = (res ?? []).map((c: any) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            productCount: c._count?.products ?? 0,
        }))
        setCategories(uiCats)
    }

    // Initial load
    useEffect(() => {
        const loadAll = async () => {
            try {
                setError(null)
                const cached = getCache()
                if (cached && cached.categories) {
                    setCategories(cached.categories)
                    setLoading(false)
                    initialLoadDone.current = true
                } else {
                    setLoading(true)
                }

                await fetchCategories()

            } catch (e: any) {
                console.error(e)
                setError(e?.message || "Failed to load categories")
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
            categories,
        })
    }, [categories])

    const handleAddCategory = async () => {
        const name = newCategoryName.trim()
        if (!name) return
        try {
            await authenticatedFetch(`/admin/categories`, {
                method: "POST",
                body: JSON.stringify({ name }),
            })
            setNewCategoryName("")
            await fetchCategories()
        } catch (err: any) {
            alert(err?.message || "Failed to add category")
        }
    }

    const handleDeleteCategory = async (id: string) => {
        try {
            await authenticatedFetch(`/admin/categories/${id}`, { method: "DELETE" })
            setCategories((prev) => prev.filter((c) => c.id !== id))
        } catch (err: any) {
            alert(err?.message || "Failed to delete category")
        }
    }

    const handleBulkDeleteCategories = async () => {
        if (selectedCategories.length === 0) return
        if (!confirm(`Delete ${selectedCategories.length} selected categor${selectedCategories.length > 1 ? "ies" : "y"}?`)) return
        try {
            for (const id of selectedCategories) {
                await authenticatedFetch(`/admin/categories/${id}`, { method: "DELETE" })
            }
            setSelectedCategories([])
            await fetchCategories()
        } catch (err: any) {
            alert(err?.message || "Failed to delete selected categories")
        }
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Categories</h1>
                    <p className="text-slate-600">Organize your products with categories</p>
                </div>
            </div>

            <CategoriesTab
                categories={categories}
                selectedCategories={selectedCategories}
                setSelectedCategories={setSelectedCategories}
                newCategoryName={newCategoryName}
                setNewCategoryName={setNewCategoryName}
                handleAddCategory={handleAddCategory}
                handleDeleteCategory={handleDeleteCategory}
                handleBulkDeleteCategories={handleBulkDeleteCategories}
            />
        </div>
    )
}
