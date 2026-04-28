"use client"

import type React from "react"

import { useState } from "react"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import Link from "next/link"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [loginForm, setLoginForm] = useState({ email: "", password: "" })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const companyName = process.env.NEXT_PUBLIC_COMPANY_NAME || 'Ranketha'

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    if (!loginForm.email || !loginForm.password) {
      setError("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
      const response = await fetch(`${apiBaseUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginForm),
      });

      const data = await response.json();

      if (response.ok) {
        // Store the token (e.g., in localStorage for now)
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user)); // Store user data as well
        setSuccess("Login successful");
        setTimeout(() => {
          window.location.href = "/"; // Redirect to home page
        }, 1500);
      } else {
        if (response.status === 403 && (data.message || '').toLowerCase().includes('not verified')) {
          setError('Email not verified.');
          // Offer quick navigation to verify page
          setTimeout(() => {
            window.location.href = `/verify-email?email=${encodeURIComponent(loginForm.email)}`
          }, 800)
        } else {
          setError(data.message || "Invalid credentials");
        }
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Network error or server is unreachable.");
    } finally {
      setIsLoading(false);
    }
  };

  // Registration moved to separate page

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-[#072C2B]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/">
              <div className="flex items-center space-x-3">

              <Image
                src="/companyLogo.svg"
                alt={`${companyName} Logo`}
                width={100}
                height={80}
                className="object-contain w-35 h-24"
              />                
              </div>
            </Link>
            <div className="flex items-center gap-6 text-sm font-medium">
              <Link href="/login" className="text-[#072C2B] font-semibold underline underline-offset-4">Login</Link>
              <Link href="/register" className="text-[#072C2B] hover:text-[#072C2B]/70">Register</Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-md mx-auto px-4 py-12">
        <Card className="bg-white border border-[#072C2B]/10 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-[#072C2B]">Welcome to {companyName}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mt-2">
              <form onSubmit={handleLogin} className="space-y-2">
                <div>
                  <Label htmlFor="login-email" className="text-[#072C2B]">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm((prev) => ({ ...prev, email: e.target.value }))}
                    required
                    disabled={isLoading}
                    className="border-[#072C2B]/20 focus:border-[#FDCB00] focus:ring-[#FDCB00]"
                  />
                </div>
                <div>
                  <Label htmlFor="login-password" className="text-[#072C2B]">Password</Label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      value={loginForm.password}
                      onChange={(e) => setLoginForm((prev) => ({ ...prev, password: e.target.value }))}
                      required
                      disabled={isLoading}
                      className="border-[#072C2B]/20 focus:border-[#FDCB00] focus:ring-[#FDCB00]"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-[#072C2B]"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <div className="flex justify-end mt-1">
                    <Link href="/forgot-password" className="text-xs text-[#072C2B] hover:underline">Forgot password?</Link>
                  </div>
                </div>

                <div className="min-h-[14px] flex items-center justify-center -mt-1">
                  {error && <p className="text-[11px] text-red-600">{error}</p>}
                  {success && <p className="text-[11px] text-green-600">{success}</p>}
                </div>
                <Button
                  type="submit"
                  className="w-full !mt-1 bg-[#FDCB00] hover:bg-[#ffe066] text-[#072C2B] font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    'Login'
                  )}
                </Button>
                <p className="text-xs text-center text-[#072C2B]/70">Don't have an account? <Link href="/register" className="text-[#072C2B] font-semibold hover:underline">Register</Link></p>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
