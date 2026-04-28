"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import Link from "next/link"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://roboclub-server-70e29f041ab3.herokuapp.com'

export default function VerifyEmailPage() {
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const e = urlParams.get('email') || ''
    if (e) setEmail(e)
  }, [])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    if (!email || !code) {
      setError("Enter your email and the 6-digit code")
      return
    }
    try {
      setLoading(true)
      const res = await fetch(`${API_BASE_URL}/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.message || 'Verification failed')
        return
      }
      setSuccess('Email verified! Redirecting to login...')
      setTimeout(() => { window.location.href = '/login' }, 1500)
    } catch (_) {
      setError('Network error, please try again')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setError("")
    setSuccess("")
    if (!email) { setError('Enter your email first'); return }
    try {
      setLoading(true)
      const res = await fetch(`${API_BASE_URL}/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.message || 'Failed to resend code')
        return
      }
      setSuccess('OTP sent. Check your inbox.')
    } catch (_) {
      setError('Network error while resending')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Image src="/roboclub-logo.png" alt="RoboClub Logo" width={32} height={32} className="object-contain w-8 h-8" />
              <span className="text-xl font-bold text-black">RoboClub</span>
            </div>
            <div className="flex items-center gap-6 text-sm font-medium">
              <Link href="/login" className="hover:text-blue-600 text-slate-700">Login</Link>
              <Link href="/register" className="hover:text-blue-600 text-slate-700">Register</Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-md mx-auto px-4 py-12">
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-slate-900">Verify your Email</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerify} className="space-y-3">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="code">6-digit Code</Label>
                <Input id="code" inputMode="numeric" pattern="[0-9]*" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0,6))} required />
                <p className="mt-1 text-xs text-slate-500">We emailed you a code. It expires in 15 minutes.</p>
              </div>

              <div className="min-h-[14px] flex items-center justify-center -mt-1">
                {error && <p className="text-[11px] text-red-600">{error}</p>}
                {success && <p className="text-[11px] text-green-600">{success}</p>}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Verifying...' : 'Verify Email'}</Button>
              <Button type="button" variant="ghost" className="w-full" onClick={handleResend} disabled={loading}>Resend Code</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
