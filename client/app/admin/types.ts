// Shared types for admin page

export interface UIProduct {
    id: string
    name: string
    price: number
    image: string
    category?: string
    description: string
    stock: number
    itemCode?: string
    isFeatured?: boolean
    isUsed?: boolean
}

export interface UIOrder {
    id: string
    customer: string
    date: string
    status: string
    total: number
    trackingNumber?: string | null
    notes?: string | null
}

export interface UICategory {
    id: string
    name: string
    slug: string
    productCount?: number
}

export interface UIProject {
    id: string
    name: string
    description: string
    imageUrls: string[]
    projectUrl?: string
    technologiesUsed: string[]
    displayOrder: number
    createdAt: string
    updatedAt: string
}

export interface UIExpense {
    id: string
    title: string
    description?: string
    amount: number
    category: string
    paymentMethod?: string
    vendor?: string
    date: string
    notes?: string
    receiptUrl?: string
}

export interface PaginationState {
    total: number
    page: number
    hasMore: boolean
}

export interface AdminCache {
    timestamp: number
    dashboard?: DashboardStats
    inventoryValue?: number
    products?: UIProduct[]
    productPagination?: PaginationState
    orders?: UIOrder[]
    orderPagination?: PaginationState
    categories?: UICategory[]
    projects?: UIProject[]
    expenses?: UIExpense[]
    expenseCategories?: string[]
    totalExpenses?: number
    users?: UIUser[]
    userPagination?: PaginationState
    sellers?: UIUser[]
    sellerPagination?: PaginationState
}

export interface UIUser {
    id: string
    name: string
    email: string
    phone: string
    role: string
    createdAt: string
    orderCount: number
}

export interface DashboardStats {
    totalSales: number
    totalOrders: number
    totalProducts: number
    totalCustomers: number
}

export interface OrderFilters {
    startDate: string
    endDate: string
    productId?: string
}

export interface ExpenseFilters {
    category: string
    startDate: string
    endDate: string
    minAmount: string
    maxAmount: string
}

export interface ProductForm {
    name: string
    price: string
    categoryId: string
    description: string
    stock: string
    image: string
    itemCode: string
    isFeatured: boolean
    isUsed: boolean
}

export interface ProjectForm {
    name: string
    description: string
    imageUrls: string[]
    projectUrl: string
    technologiesUsed: string
    displayOrder: string
}

export interface ExpenseForm {
    title: string
    description: string
    amount: string
    category: string
    paymentMethod: string
    vendor: string
    date: string
    notes: string
    receiptUrl: string
}
