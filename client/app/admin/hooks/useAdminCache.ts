'use client'

import { AdminCache } from '../types'

const CACHE_KEY = 'admin_page_cache'
const CACHE_EXPIRY_MS = 5 * 60 * 1000 // 5 minutes

export function getCache(): AdminCache | null {
    try {
        if (typeof window === 'undefined') return null
        const cached = sessionStorage.getItem(CACHE_KEY)
        if (!cached) return null
        const data: AdminCache = JSON.parse(cached)
        // Check if cache is expired
        if (Date.now() - data.timestamp > CACHE_EXPIRY_MS) {
            sessionStorage.removeItem(CACHE_KEY)
            return null
        }
        return data
    } catch {
        return null
    }
}

export function setCache(data: Omit<AdminCache, 'timestamp'>): void {
    try {
        if (typeof window === 'undefined') return
        const cacheData: AdminCache = { ...data, timestamp: Date.now() }
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(cacheData))
    } catch {
        // Ignore storage errors
    }
}

export function clearCache(): void {
    try {
        if (typeof window === 'undefined') return
        sessionStorage.removeItem(CACHE_KEY)
    } catch {
        // Ignore storage errors
    }
}
