'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Shield, ShieldAlert, User, Search, Mail, Phone, Calendar, ShoppingBag } from "lucide-react"
import type { UIUser } from '../types'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"


interface UsersTabProps {
    users: UIUser[]
    userTotal: number
    userPage: number
    userHasMore: boolean
    userSearch: string
    setUserSearch: (value: string) => void
    onLoadMore: () => void
    onRoleChange?: (userId: string, newRole: string) => void
    onViewOrders?: (user: UIUser) => void
    onSellerClick?: (userId: string) => void
    tabValue?: string // "users" or "sellers"
    title?: string // Custom title
}

export function UsersTab({
    users,
    userTotal,
    userPage,
    userHasMore,
    userSearch,
    setUserSearch,
    onLoadMore,
    onRoleChange,
    onViewOrders,
    onSellerClick,
    tabValue = "users",
    title = "Users Management"
}: UsersTabProps) {
    return (
        <div className="mt-6">
            <Card className="bg-white/80 backdrop-blur-sm">
                <CardHeader>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5 text-blue-600" />
                            {title}
                            <Badge variant="secondary" className="ml-2">
                                {userTotal} Total
                            </Badge>
                        </CardTitle>
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                            <Input
                                value={userSearch}
                                onChange={(e) => setUserSearch(e.target.value)}
                                placeholder="Search by name, email, or phone..."
                                className="pl-9 w-full sm:w-72"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border border-slate-200">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Orders</TableHead>
                                    <TableHead>Joined</TableHead>
                                    {(onRoleChange || onViewOrders) && <TableHead className="text-right">Actions</TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                                            No users found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    users.map((user) => (
                                        <TableRow
                                            key={user.id}
                                            className={onSellerClick ? "cursor-pointer hover:bg-slate-50" : ""}
                                            onClick={onSellerClick ? () => onSellerClick(user.id) : undefined}
                                        >
                                            <TableCell>
                                                <div className="font-medium text-slate-900">{user.name || "N/A"}</div>
                                                <div className="text-xs text-slate-500">ID: {user.id.slice(0, 8)}...</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center text-sm text-slate-600">
                                                        <Mail className="h-3 w-3 mr-1.5" />
                                                        {user.email}
                                                    </div>
                                                    {user.phone && (
                                                        <div className="flex items-center text-xs text-slate-500">
                                                            <Phone className="h-3 w-3 mr-1.5" />
                                                            {user.phone}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    {user.role === 'ADMIN' ? (
                                                        <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200">
                                                            <ShieldAlert className="h-3 w-3 mr-1" />
                                                            Admin
                                                        </Badge>
                                                    ) : user.role === 'SELLER' ? (
                                                        <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200">
                                                            <ShoppingBag className="h-3 w-3 mr-1" />
                                                            Seller
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="text-slate-600 border-slate-300">
                                                            <User className="h-3 w-3 mr-1" />
                                                            Customer
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center text-sm text-slate-600">
                                                    <ShoppingBag className="h-3 w-3 mr-1.5" />
                                                    {user.orderCount} orders
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center text-sm text-slate-600">
                                                    <Calendar className="h-3 w-3 mr-1.5" />
                                                    {new Date(user.createdAt).toLocaleDateString()}
                                                </div>
                                            </TableCell>
                                            {(onRoleChange || onViewOrders) && (
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2 items-center">
                                                        {onRoleChange && user.role === 'CUSTOMER' && (
                                                            <Button
                                                                size="sm"
                                                                variant="default"
                                                                className="bg-orange-600 hover:bg-orange-700 text-white h-8"
                                                                onClick={() => onRoleChange(user.id, 'SELLER')}
                                                            >
                                                                Promote to Seller
                                                            </Button>
                                                        )}

                                                        {onViewOrders && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => onViewOrders(user)}
                                                            >
                                                                <ShoppingBag className="h-4 w-4 mr-1" />
                                                                View Orders
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {userHasMore && (
                        <div className="mt-4 flex justify-center">
                            <Button variant="outline" onClick={onLoadMore}>
                                Load More Users
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
