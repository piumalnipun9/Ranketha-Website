'use client'

import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import type { UICategory } from '../types'

interface CategoriesTabProps {
    categories: UICategory[]
    selectedCategories: string[]
    setSelectedCategories: (value: string[] | ((prev: string[]) => string[])) => void
    newCategoryName: string
    setNewCategoryName: (value: string) => void
    handleAddCategory: () => void
    handleDeleteCategory: (id: string) => void
    handleBulkDeleteCategories: () => void
}

export function CategoriesTab({
    categories,
    selectedCategories,
    setSelectedCategories,
    newCategoryName,
    setNewCategoryName,
    handleAddCategory,
    handleDeleteCategory,
    handleBulkDeleteCategories,
}: CategoriesTabProps) {
    return (
        <div className="mt-6">
            <Card className="bg-white/80 backdrop-blur-sm">
                <CardHeader>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <CardTitle>Categories</CardTitle>
                        <div className="flex items-center gap-2">
                            <Input
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                placeholder="New category name"
                                className="w-48 md:w-72"
                            />
                            <Button onClick={handleAddCategory} disabled={!newCategoryName.trim()}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Category
                            </Button>
                        </div>
                        <div className="flex items-center gap-2">
                            {selectedCategories.length > 0 && (
                                <Button variant="destructive" onClick={handleBulkDeleteCategories}>Delete Selected</Button>
                            )}
                            <input
                                type="checkbox"
                                className="w-4 h-4 mt-1"
                                checked={selectedCategories.length === categories.length && categories.length > 0}
                                onChange={(e) => {
                                    if (e.target.checked) setSelectedCategories(categories.map(c => c.id))
                                    else setSelectedCategories([])
                                }}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {categories.length === 0 ? (
                        <p className="text-slate-600">No categories yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {categories.map((cat) => (
                                <div key={cat.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4"
                                            checked={selectedCategories.includes(cat.id)}
                                            onChange={(e) => {
                                                setSelectedCategories((prev) => {
                                                    if (e.target.checked) {
                                                        return prev.includes(cat.id) ? prev : [...prev, cat.id]
                                                    }
                                                    return prev.filter(id => id !== cat.id)
                                                })
                                            }}
                                        />
                                        <div>
                                            <p className="font-semibold text-slate-900">{cat.name}</p>
                                            <p className="text-xs text-slate-600">/{cat.slug} {typeof cat.productCount === 'number' ? `• ${cat.productCount} products` : ''}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="outline" size="sm" onClick={() => handleDeleteCategory(cat.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
