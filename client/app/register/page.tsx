"use client"

import { useState } from "react"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import Link from "next/link"

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "" })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  const companyName = process.env.NEXT_PUBLIC_COMPANY_NAME || 'Ranketha'

  const passwordStrength = (pw: string) => {
    if (pw.length < 8) return 'Too short'
    const hasLetter = /[A-Za-z]/.test(pw)
    const hasNumber = /\d/.test(pw)
    const hasSymbol = /[^A-Za-z0-9]/.test(pw)
    const score = [hasLetter, hasNumber, hasSymbol].filter(Boolean).length
    if (score === 1) return 'Weak'
    if (score === 2) return 'Medium'
    return 'Strong'
  }

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!form.name || !form.email || !form.phone || !form.password || !form.confirmPassword) {
      setError("Please fill in all required fields (phone required)")
      return
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match")
      return
    }
    if (form.password.length < 8 || !(/[A-Za-z]/.test(form.password) && /\d/.test(form.password))) {
      setError('Password must be at least 8 chars and include a letter and a number')
      return
    }

    try {
      setLoading(true)
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
      const response = await fetch(`${apiBaseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone || undefined,
          password: form.password,
        })
      })
      const data = await response.json()
      if (!response.ok) {
        setError(data.message || 'Registration failed')
        return
      }
      setSuccess('Registered! Check your email for the OTP to verify your account.')
      setTimeout(() => { window.location.href = `/verify-email?email=${encodeURIComponent(form.email)}` }, 1200)
    } catch (err) {
      setError('Network error, please try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <nav className="bg-white/90 backdrop-blur-md border-b border-[#072C2B]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/">
              <div className="flex items-center space-x-3">
                <Image src="/companyLogo.svg" alt={`${companyName} Logo`} width={32} height={32} className="object-contain w-8 h-8" />
                <span className="text-xl font-bold text-[#072C2B]">{companyName}</span>
              </div>
            </Link>
            <div className="flex items-center gap-6 text-sm font-medium">
              <Link href="/login" className="text-[#072C2B] hover:text-[#072C2B]/70">Login</Link>
              <Link href="/register" className="text-[#072C2B] font-semibold underline underline-offset-4">Register</Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-md mx-auto px-4 py-12">
        <Card className="bg-white border border-[#072C2B]/10 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-[#072C2B]">Create an Account</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-2">
              <div>
                <Label htmlFor="name" className="text-[#072C2B]">Full Name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={e => handleChange('name', e.target.value)}
                  required
                  className="border-[#072C2B]/20 focus:border-[#FDCB00] focus:ring-[#FDCB00]"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-[#072C2B]">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={e => handleChange('email', e.target.value)}
                  required
                  className="border-[#072C2B]/20 focus:border-[#FDCB00] focus:ring-[#FDCB00]"
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-[#072C2B]">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={e => handleChange('phone', e.target.value)}
                  required
                  className="border-[#072C2B]/20 focus:border-[#FDCB00] focus:ring-[#FDCB00]"
                />
              </div>
              <div>
                <Label htmlFor="password" className="text-[#072C2B]">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => handleChange('password', e.target.value)}
                    required
                    className="border-[#072C2B]/20 focus:border-[#FDCB00] focus:ring-[#FDCB00]"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-[#072C2B]"
                    onClick={() => setShowPassword(p => !p)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {form.password && (
                  <p className="mt-1 text-xs text-[#072C2B]/70">Strength: <span className="font-medium">{passwordStrength(form.password)}</span></p>
                )}
                <p className="mt-1 text-xs text-[#072C2B]/50">Use at least 8 characters including a number and a symbol for a strong password.</p>
              </div>
              <div>
                <Label htmlFor="confirmPassword" className="text-[#072C2B]">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    value={form.confirmPassword}
                    onChange={e => handleChange('confirmPassword', e.target.value)}
                    required
                    className="border-[#072C2B]/20 focus:border-[#FDCB00] focus:ring-[#FDCB00]"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-[#072C2B]"
                    onClick={() => setShowConfirm(p => !p)}
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="min-h-[14px] flex items-center justify-center -mt-1">
                {error && <p className="text-[11px] text-red-600">{error}</p>}
                {success && <p className="text-[11px] text-green-600">{success}</p>}
              </div>
              <Button
                type="submit"
                className="w-full !mt-1 bg-[#FDCB00] hover:bg-[#ffe066] text-[#072C2B] font-semibold"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Register'
                )}
              </Button>
              <p className="text-xs text-center text-[#072C2B]/70">Already have an account? <Link href="/login" className="text-[#072C2B] font-semibold hover:underline">Login</Link></p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
