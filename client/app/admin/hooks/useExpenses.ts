'use client'

import { useState, useCallback } from 'react'
import { UIExpense, ExpenseFilters, ExpenseForm } from '../types'
import { authenticatedFetch } from '@/lib/api'

export function useExpenses() {
    const [expenses, setExpenses] = useState<UIExpense[]>([])
    const [expenseCategories, setExpenseCategories] = useState<string[]>([])
    const [totalExpenses, setTotalExpenses] = useState(0)
    const [selectedExpenses, setSelectedExpenses] = useState<string[]>([])
    const [editingExpense, setEditingExpense] = useState<UIExpense | null>(null)
    const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false)
    const [expenseSearch, setExpenseSearch] = useState("")
    const [expenseFilters, setExpenseFilters] = useState<ExpenseFilters>({
        category: "",
        startDate: "",
        endDate: "",
        minAmount: "",
        maxAmount: "",
    })
    const [expenseForm, setExpenseForm] = useState<ExpenseForm>({
        title: "",
        description: "",
        amount: "",
        category: "",
        paymentMethod: "",
        vendor: "",
        date: "",
        notes: "",
        receiptUrl: "",
    })

    const fetchExpenses = useCallback(async (opts?: { search?: string }) => {
        const params = new URLSearchParams()
        if (opts?.search) params.set('search', opts.search)
        if (expenseFilters.category) params.set('category', expenseFilters.category)
        if (expenseFilters.startDate) params.set('startDate', expenseFilters.startDate)
        if (expenseFilters.endDate) params.set('endDate', expenseFilters.endDate)
        if (expenseFilters.minAmount) params.set('minAmount', expenseFilters.minAmount)
        if (expenseFilters.maxAmount) params.set('maxAmount', expenseFilters.maxAmount)
        const res = await authenticatedFetch(`/admin/expenses?${params.toString()}`)
        const arr: UIExpense[] = (res?.expenses ?? res ?? []).map((e: any) => ({
            id: e.id,
            title: e.title,
            description: e.description || "",
            amount: e.amount,
            category: e.category,
            paymentMethod: e.paymentMethod || "",
            vendor: e.vendor || "",
            date: e.date ? new Date(e.date).toLocaleDateString() : "",
            notes: e.notes || "",
            receiptUrl: e.receiptUrl || "",
        }))
        setExpenses(arr)
        // Extract unique categories
        const cats = Array.from(new Set(arr.map(e => e.category).filter(Boolean)))
        setExpenseCategories(cats)
        return arr
    }, [expenseFilters])

    const fetchExpensesSummary = useCallback(async () => {
        try {
            const res = await authenticatedFetch(`/admin/expenses/summary/by`)
            const total = typeof res?.total === 'number' ? res.total : 0
            setTotalExpenses(total)
            return total
        } catch (_) {
            setTotalExpenses(0)
            return 0
        }
    }, [])

    const handleAddExpense = useCallback(() => {
        setEditingExpense(null)
        setExpenseForm({
            title: "",
            description: "",
            amount: "",
            category: "",
            paymentMethod: "",
            vendor: "",
            date: new Date().toISOString().split('T')[0],
            notes: "",
            receiptUrl: "",
        })
        setIsExpenseDialogOpen(true)
    }, [])

    const handleEditExpense = useCallback((expense: UIExpense) => {
        setEditingExpense(expense)
        setExpenseForm({
            title: expense.title,
            description: expense.description || "",
            amount: expense.amount.toString(),
            category: expense.category,
            paymentMethod: expense.paymentMethod || "",
            vendor: expense.vendor || "",
            date: expense.date,
            notes: expense.notes || "",
            receiptUrl: expense.receiptUrl || "",
        })
        setIsExpenseDialogOpen(true)
    }, [])

    const handleSaveExpense = useCallback(async () => {
        if (!expenseForm.title || !expenseForm.amount || !expenseForm.category) {
            alert("Title, amount, and category are required")
            return false
        }
        try {
            const payload = {
                title: expenseForm.title,
                description: expenseForm.description || undefined,
                amount: parseFloat(expenseForm.amount),
                category: expenseForm.category,
                paymentMethod: expenseForm.paymentMethod || undefined,
                vendor: expenseForm.vendor || undefined,
                date: expenseForm.date ? new Date(expenseForm.date).toISOString() : undefined,
                notes: expenseForm.notes || undefined,
                receiptUrl: expenseForm.receiptUrl || undefined,
            }
            if (editingExpense) {
                await authenticatedFetch(`/admin/expenses/${editingExpense.id}`, {
                    method: "PUT",
                    body: JSON.stringify(payload),
                })
            } else {
                await authenticatedFetch(`/admin/expenses`, {
                    method: "POST",
                    body: JSON.stringify(payload),
                })
            }
            setIsExpenseDialogOpen(false)
            await fetchExpenses({ search: expenseSearch.trim() || undefined })
            await fetchExpensesSummary()
            return true
        } catch (err: any) {
            alert(err?.message || "Failed to save expense")
            return false
        }
    }, [expenseForm, editingExpense, expenseSearch, fetchExpenses, fetchExpensesSummary])

    const handleDeleteExpense = useCallback(async (id: string) => {
        if (!confirm("Delete this expense?")) return false
        try {
            await authenticatedFetch(`/admin/expenses/${id}`, { method: "DELETE" })
            await fetchExpenses({ search: expenseSearch.trim() || undefined })
            await fetchExpensesSummary()
            return true
        } catch (err: any) {
            alert(err?.message || "Failed to delete expense")
            return false
        }
    }, [expenseSearch, fetchExpenses, fetchExpensesSummary])

    const handleBulkDeleteExpenses = useCallback(async () => {
        if (selectedExpenses.length === 0) return false
        if (!confirm(`Delete ${selectedExpenses.length} selected expense(s)?`)) return false
        try {
            for (const id of selectedExpenses) {
                await authenticatedFetch(`/admin/expenses/${id}`, { method: "DELETE" })
            }
            setSelectedExpenses([])
            await fetchExpenses({ search: expenseSearch.trim() || undefined })
            await fetchExpensesSummary()
            return true
        } catch (err: any) {
            alert(err?.message || "Failed to delete selected expenses")
            return false
        }
    }, [selectedExpenses, expenseSearch, fetchExpenses, fetchExpensesSummary])

    return {
        // State
        expenses,
        setExpenses,
        expenseCategories,
        setExpenseCategories,
        totalExpenses,
        setTotalExpenses,
        selectedExpenses,
        setSelectedExpenses,
        editingExpense,
        isExpenseDialogOpen,
        setIsExpenseDialogOpen,
        expenseSearch,
        setExpenseSearch,
        expenseFilters,
        setExpenseFilters,
        expenseForm,
        setExpenseForm,
        // Actions
        fetchExpenses,
        fetchExpensesSummary,
        handleAddExpense,
        handleEditExpense,
        handleSaveExpense,
        handleDeleteExpense,
        handleBulkDeleteExpenses,
    }
}
