"use client"

import { useEffect, useState, useRef } from "react"
import { authenticatedFetch } from "@/lib/api"
import { getCache, setCache } from '../hooks/useAdminCache'
import { ExpensesTab } from '../components'
import type { UIExpense } from '../types'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function ExpensesPage() {
    const [expenses, setExpenses] = useState<UIExpense[]>([])
    const [expenseCategories, setExpenseCategories] = useState<string[]>([])
    const [selectedExpenses, setSelectedExpenses] = useState<string[]>([])

    const [expenseSearch, setExpenseSearch] = useState("")
    const [expenseFilters, setExpenseFilters] = useState({
        category: "",
        startDate: "",
        endDate: "",
        minAmount: "",
        maxAmount: "",
    })

    const [totalExpenses, setTotalExpenses] = useState(0)

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const initialLoadDone = useRef(false)

    // Expense form/dialog
    const [editingExpense, setEditingExpense] = useState<UIExpense | null>(null)
    const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false)
    const [expenseForm, setExpenseForm] = useState({
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

    // Helper: fetch expenses
    const fetchExpenses = async (opts?: { search?: string }) => {
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
            amount: Number(e.amount) || 0,
            category: e.category || "",
            paymentMethod: e.paymentMethod || "",
            vendor: e.vendor || "",
            date: e.date ? new Date(e.date).toISOString().slice(0, 10) : "",
            notes: e.notes || "",
            receiptUrl: e.receiptUrl || "",
        }))
        setExpenses(arr)
        const cats: string[] = res?.categories || []
        if (Array.isArray(cats)) setExpenseCategories(cats)
    }

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

    // Debounce expense search
    useEffect(() => {
        if (!initialLoadDone.current) return
        const t = setTimeout(() => {
            const q = expenseSearch.trim()
            fetchExpenses({ search: q || undefined })
        }, 300)
        return () => clearTimeout(t)
    }, [expenseSearch, expenseFilters])

    // Initial load
    useEffect(() => {
        const loadAll = async () => {
            try {
                setError(null)
                const cached = getCache()
                if (cached && cached.expenses) {
                    setExpenses(cached.expenses)
                    if (cached.expenseCategories) setExpenseCategories(cached.expenseCategories)
                    if (cached.totalExpenses !== undefined) setTotalExpenses(cached.totalExpenses)
                    setLoading(false)
                    initialLoadDone.current = true
                } else {
                    setLoading(true)
                }

                await Promise.all([
                    fetchExpenses(),
                    fetchExpensesSummary()
                ])

            } catch (e: any) {
                console.error(e)
                setError(e?.message || "Failed to load expenses")
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
            expenses,
            expenseCategories,
            totalExpenses
        })
    }, [expenses, expenseCategories, totalExpenses])


    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Expenses</h1>
                    <p className="text-slate-600">Track and manage business expenses</p>
                </div>
                <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200">
                    <span className="text-sm font-medium text-slate-500 mr-2">Total Expenses:</span>
                    <span className="text-lg font-bold text-rose-600">LKR {totalExpenses.toFixed(2)}</span>
                </div>
            </div>

            <ExpensesTab
                expenses={expenses}
                expenseCategories={expenseCategories}
                selectedExpenses={selectedExpenses}
                setSelectedExpenses={setSelectedExpenses}
                expenseSearch={expenseSearch}
                setExpenseSearch={setExpenseSearch}
                expenseFilters={expenseFilters}
                setExpenseFilters={setExpenseFilters}
                setEditingExpense={setEditingExpense}
                setExpenseForm={setExpenseForm}
                setIsExpenseDialogOpen={setIsExpenseDialogOpen}
                fetchExpenses={fetchExpenses}
                fetchExpensesSummary={fetchExpensesSummary}
                onDeleteExpense={async (id) => {
                    if (!confirm('Delete this expense?')) return
                    await authenticatedFetch(`/admin/expenses/${id}`, { method: 'DELETE' })
                    await fetchExpenses({ search: expenseSearch.trim() || undefined })
                    await fetchExpensesSummary()
                }}
                onBulkDeleteExpenses={async () => {
                    if (!confirm(`Delete ${selectedExpenses.length} selected expense(s)?`)) return
                    for (const id of selectedExpenses) {
                        await authenticatedFetch(`/admin/expenses/${id}`, { method: 'DELETE' })
                    }
                    setSelectedExpenses([])
                    await fetchExpenses({ search: expenseSearch.trim() || undefined })
                    await fetchExpensesSummary()
                }}
            />

            {/* Expense Dialog */}
            <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
                <DialogContent className="max-w-md sm:max-w-lg max-h-[85vh] overflow-y-auto z-[60]">
                    <DialogHeader>
                        <DialogTitle>{editingExpense ? "Edit Expense" : "Add Expense"}</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="exTitle">Title</Label>
                            <Input id="exTitle" value={expenseForm.title} onChange={(e) => setExpenseForm(p => ({ ...p, title: e.target.value }))} required />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label htmlFor="exAmount">Amount</Label>
                                <Input id="exAmount" type="number" step="0.01" value={expenseForm.amount} onChange={(e) => setExpenseForm(p => ({ ...p, amount: e.target.value }))} required />
                            </div>
                            <div>
                                <Label htmlFor="exDate">Date</Label>
                                <Input id="exDate" type="date" value={expenseForm.date} onChange={(e) => setExpenseForm(p => ({ ...p, date: e.target.value }))} />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="exCategory">Category</Label>
                            <Input id="exCategory" list="expense-categories" value={expenseForm.category} onChange={(e) => setExpenseForm(p => ({ ...p, category: e.target.value }))} placeholder="e.g., Rent, Utilities, Marketing" required />
                            <datalist id="expense-categories">
                                {expenseCategories.map(c => (<option key={c} value={c} />))}
                            </datalist>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label htmlFor="exVendor">Vendor</Label>
                                <Input id="exVendor" value={expenseForm.vendor} onChange={(e) => setExpenseForm(p => ({ ...p, vendor: e.target.value }))} />
                            </div>
                            <div>
                                <Label htmlFor="exMethod">Payment Method</Label>
                                <Input id="exMethod" value={expenseForm.paymentMethod} onChange={(e) => setExpenseForm(p => ({ ...p, paymentMethod: e.target.value }))} placeholder="Cash, Card, Bank" />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="exReceipt">Receipt URL</Label>
                            <Input id="exReceipt" value={expenseForm.receiptUrl} onChange={(e) => setExpenseForm(p => ({ ...p, receiptUrl: e.target.value }))} placeholder="https://..." />
                        </div>
                        <div>
                            <Label htmlFor="exDesc">Description</Label>
                            <Textarea id="exDesc" rows={3} value={expenseForm.description} onChange={(e) => setExpenseForm(p => ({ ...p, description: e.target.value }))} />
                        </div>
                        <div>
                            <Label htmlFor="exNotes">Notes</Label>
                            <Textarea id="exNotes" rows={2} value={expenseForm.notes} onChange={(e) => setExpenseForm(p => ({ ...p, notes: e.target.value }))} />
                        </div>

                        <div className="flex gap-2 pt-2">
                            <Button type="button" className="flex-1" onClick={async () => {
                                if (!expenseForm.title || !expenseForm.category || !expenseForm.amount) { alert('Please fill required fields'); return; }
                                const payload: any = {
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
                                    await authenticatedFetch(`/admin/expenses/${editingExpense.id}`, { method: 'PUT', body: JSON.stringify(payload) })
                                } else {
                                    await authenticatedFetch(`/admin/expenses`, { method: 'POST', body: JSON.stringify(payload) })
                                }
                                setIsExpenseDialogOpen(false)
                                await fetchExpenses({ search: expenseSearch.trim() || undefined })
                                await fetchExpensesSummary()
                            }}>{editingExpense ? 'Update Expense' : 'Add Expense'}</Button>
                            <Button type="button" variant="outline" onClick={() => setIsExpenseDialogOpen(false)}>Cancel</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
