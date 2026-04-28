'use client'

import { Plus, Edit, Trash2, ReceiptText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { UIExpense, ExpenseFilters, ExpenseForm } from '../types'

interface ExpensesTabProps {
    expenses: UIExpense[]
    expenseCategories: string[]
    selectedExpenses: string[]
    setSelectedExpenses: (value: string[] | ((prev: string[]) => string[])) => void
    expenseSearch: string
    setExpenseSearch: (value: string) => void
    expenseFilters: ExpenseFilters
    setExpenseFilters: (value: ExpenseFilters | ((prev: ExpenseFilters) => ExpenseFilters)) => void
    setEditingExpense: (expense: UIExpense | null) => void
    setExpenseForm: (form: ExpenseForm) => void
    setIsExpenseDialogOpen: (open: boolean) => void
    fetchExpenses: (opts?: { search?: string }) => Promise<UIExpense[] | void>
    fetchExpensesSummary: () => Promise<number | void>
    onDeleteExpense: (id: string) => Promise<void>
    onBulkDeleteExpenses: () => Promise<void>
}

export function ExpensesTab({
    expenses,
    expenseCategories,
    selectedExpenses,
    setSelectedExpenses,
    expenseSearch,
    setExpenseSearch,
    expenseFilters,
    setExpenseFilters,
    setEditingExpense,
    setExpenseForm,
    setIsExpenseDialogOpen,
    fetchExpenses,
    fetchExpensesSummary,
    onDeleteExpense,
    onBulkDeleteExpenses,
}: ExpensesTabProps) {
    return (
        <div className="mt-6">
            <Card className="bg-white/80 backdrop-blur-sm">
                <CardHeader>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <CardTitle className="flex items-center gap-2"><ReceiptText className="h-5 w-5" /> Expenses</CardTitle>
                        <div className="flex flex-wrap items-center gap-2">
                            <Input
                                value={expenseSearch}
                                onChange={(e) => setExpenseSearch(e.target.value)}
                                placeholder="Search expenses..."
                                className="w-48 md:w-72"
                            />
                            {expenseSearch && (
                                <Button variant="outline" size="sm" onClick={() => setExpenseSearch("")}>Clear</Button>
                            )}
                            <Button onClick={() => {
                                setEditingExpense(null)
                                setExpenseForm({ title: "", description: "", amount: "", category: "", paymentMethod: "", vendor: "", date: new Date().toISOString().slice(0, 10), notes: "", receiptUrl: "" })
                                setIsExpenseDialogOpen(true)
                            }}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Expense
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 items-center">
                            <Select value={expenseFilters.category || "__all__"} onValueChange={(v) => setExpenseFilters(s => ({ ...s, category: v == "__all__" ? "" : v }))}>
                                <SelectTrigger className="w-40" aria-label="Expense Category">
                                    <SelectValue placeholder="All categories" />
                                </SelectTrigger>
                                <SelectContent side="bottom" sideOffset={6} position="popper" collisionPadding={12} className="z-[80] max-h-56">
                                    <SelectItem value="__all__">All categories</SelectItem>
                                    {expenseCategories.map((c) => (
                                        <SelectItem key={c} value={c}>{c}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Input type="date" value={expenseFilters.startDate} onChange={(e) => setExpenseFilters(s => ({ ...s, startDate: e.target.value }))} />
                            <Input type="date" value={expenseFilters.endDate} onChange={(e) => setExpenseFilters(s => ({ ...s, endDate: e.target.value }))} />
                            <Input type="number" placeholder="Min" value={expenseFilters.minAmount} onChange={(e) => setExpenseFilters(s => ({ ...s, minAmount: e.target.value }))} className="w-24" />
                            <Input type="number" placeholder="Max" value={expenseFilters.maxAmount} onChange={(e) => setExpenseFilters(s => ({ ...s, maxAmount: e.target.value }))} className="w-24" />
                            <Button variant="outline" size="sm" onClick={() => { setExpenseFilters({ category: "", startDate: "", endDate: "", minAmount: "", maxAmount: "" }) }}>Reset</Button>
                            {selectedExpenses.length > 0 && (
                                <Button variant="destructive" onClick={onBulkDeleteExpenses}>Delete Selected</Button>
                            )}
                            <input
                                type="checkbox"
                                className="w-4 h-4 mt-1"
                                checked={expenses.length > 0 && selectedExpenses.length === expenses.length}
                                onChange={(e) => {
                                    if (e.target.checked) setSelectedExpenses(expenses.map(x => x.id)); else setSelectedExpenses([])
                                }}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {expenses.length === 0 ? (
                            <p className="text-slate-600">No expenses found.</p>
                        ) : expenses.map((ex) => (
                            <div key={ex.id} className="flex items-center gap-4 p-4 border border-slate-200 rounded-lg">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4"
                                    checked={selectedExpenses.includes(ex.id)}
                                    onChange={(e) => {
                                        setSelectedExpenses(prev => {
                                            if (e.target.checked) {
                                                return prev.includes(ex.id) ? prev : [...prev, ex.id]
                                            }
                                            return prev.filter(id => id !== ex.id)
                                        })
                                    }}
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-slate-900 truncate">{ex.title}</p>
                                    <p className="text-xs text-slate-500 truncate">{ex.category} • {ex.vendor || '—'} • {ex.paymentMethod || '—'}</p>
                                    <p className="text-xs text-slate-500">{ex.date}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-slate-900">LKR {ex.amount.toFixed(2)}</p>
                                    {ex.receiptUrl && (
                                        <a href={ex.receiptUrl} target="_blank" className="text-xs text-blue-600">Receipt</a>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={() => {
                                        setEditingExpense(ex)
                                        setExpenseForm({
                                            title: ex.title,
                                            description: ex.description || "",
                                            amount: String(ex.amount),
                                            category: ex.category,
                                            paymentMethod: ex.paymentMethod || "",
                                            vendor: ex.vendor || "",
                                            date: ex.date,
                                            notes: ex.notes || "",
                                            receiptUrl: ex.receiptUrl || "",
                                        })
                                        setIsExpenseDialogOpen(true)
                                    }}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => onDeleteExpense(ex.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
