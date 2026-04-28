'use client'

import { useState, useCallback } from 'react'
import { UICategory } from '../types'
import { authenticatedFetch } from '@/lib/api'

export function useCategories() {
    const [categories, setCategories] = useState<UICategory[]>([])
    const [selectedCategories, setSelectedCategories] = useState<string[]>([])
    const [newCategoryName, setNewCategoryName] = useState("")

    const fetchCategories = useCallback(async () => {
        const res = await authenticatedFetch(`/admin/categories`)
        const uiCats: UICategory[] = (res ?? []).map((c: any) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            productCount: c._count?.products ?? 0,
        }))
        setCategories(uiCats)
        return uiCats
    }, [])

    const handleAddCategory = useCallback(async () => {
        const name = newCategoryName.trim()
        if (!name) return false
        try {
            await authenticatedFetch(`/admin/categories`, {
                method: "POST",
                body: JSON.stringify({ name }),
            })
            setNewCategoryName("")
            await fetchCategories()
            return true
        } catch (err: any) {
            alert(err?.message || "Failed to add category")
            return false
        }
    }, [newCategoryName, fetchCategories])

    const handleDeleteCategory = useCallback(async (id: string) => {
        try {
            await authenticatedFetch(`/admin/categories/${id}`, { method: "DELETE" })
            setCategories((prev) => prev.filter((c) => c.id !== id))
            return true
        } catch (err: any) {
            alert(err?.message || "Failed to delete category")
            return false
        }
    }, [])

    const handleBulkDeleteCategories = useCallback(async () => {
        if (selectedCategories.length === 0) return false
        if (!confirm(`Delete ${selectedCategories.length} selected categor${selectedCategories.length > 1 ? "ies" : "y"}?`)) return false
        try {
            for (const id of selectedCategories) {
                await authenticatedFetch(`/admin/categories/${id}`, { method: "DELETE" })
            }
            setSelectedCategories([])
            await fetchCategories()
            return true
        } catch (err: any) {
            alert(err?.message || "Failed to delete selected categories")
            return false
        }
    }, [selectedCategories, fetchCategories])

    return {
        // State
        categories,
        setCategories,
        selectedCategories,
        setSelectedCategories,
        newCategoryName,
        setNewCategoryName,
        // Actions
        fetchCategories,
        handleAddCategory,
        handleDeleteCategory,
        handleBulkDeleteCategories,
    }
}
