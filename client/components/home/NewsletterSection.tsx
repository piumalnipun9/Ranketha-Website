"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Leaf, Mail } from "lucide-react"

export function NewsletterSection() {
  const [email, setEmail] = useState("")
  const [newsletterStatus, setNewsletterStatus] = useState("")
  const [statusType, setStatusType] = useState<"success" | "error" | "">("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hp, setHp] = useState("") // honeypot

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !/^([^\s@]+)@([^\s@]+)\.([^\s@]+)$/.test(email)) {
      setStatusType("error")
      setNewsletterStatus("Please enter a valid email address.")
      return
    }

    setIsSubmitting(true)
    setStatusType("")
    setNewsletterStatus("")
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "newsletter:home", hp })
      })
      if (res.ok) {
        setStatusType("success")
        setNewsletterStatus("Thank you for subscribing! 🍯")
        setEmail("")
        setTimeout(() => setNewsletterStatus(""), 3500)
      } else {
        const data = await res.json().catch(() => ({} as any))
        setStatusType("error")
        setNewsletterStatus(data?.error || "Subscription failed. Please try again.")
      }
    } catch (err) {
      setStatusType("error")
      setNewsletterStatus("Network error. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="py-20 bg-gradient-to-br from-[#FDCB00] via-[#d4a800] to-[#FDCB00] relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/10 rounded-full translate-x-1/4 translate-y-1/4" />
      <div className="absolute top-1/2 left-10 opacity-20">
        <Leaf className="w-24 h-24 text-[#072C2B]" />
      </div>
      <div className="absolute top-1/3 right-10 opacity-20 rotate-45">
        <Leaf className="w-16 h-16 text-[#072C2B]" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
        <div className="inline-flex items-center gap-2 bg-[#072C2B]/10 rounded-full px-4 py-2 mb-6">
          <Mail className="w-4 h-4 text-[#072C2B]" />
          <span className="text-[#072C2B] text-sm font-medium">Join Our Community</span>
        </div>

        <h2 className="text-3xl md:text-4xl font-bold text-[#072C2B] mb-4">
          Get Fresh Updates & Exclusive Offers
        </h2>
        <p className="text-xl text-[#072C2B]/80 mb-8 max-w-2xl mx-auto">
          Subscribe to receive news about new products, seasonal harvests, traditional recipes,
          and special discounts on our premium collection.
        </p>

        <form onSubmit={handleNewsletter} className="max-w-lg mx-auto">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isSubmitting}
              className="flex-1 bg-white/90 backdrop-blur-sm border-2 border-[#072C2B]/20 rounded-full px-6 py-6 text-[#072C2B] placeholder:text-[#072C2B]/50 focus:border-[#072C2B] focus:ring-[#072C2B]"
            />
            {/* Honeypot field for bots */}
            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={hp}
              onChange={(e) => setHp(e.target.value)}
              className="hidden"
            />
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#072C2B] text-[#EFEFCC] hover:bg-[#0a4a48] rounded-full px-8 py-6 font-semibold shadow-lg transition-all hover:shadow-xl"
            >
              {isSubmitting ? "Subscribing..." : "Subscribe"}
            </Button>
          </div>
        </form>

        {newsletterStatus && (
          <p
            className={
              `mt-6 font-medium text-lg ` +
              (statusType === "success" ? "text-[#072C2B]" : statusType === "error" ? "text-red-700" : "text-[#072C2B]/70")
            }
            aria-live="polite"
          >
            {newsletterStatus}
          </p>
        )}

        <p className="mt-6 text-sm text-[#072C2B]/60">
          By subscribing, you agree to receive marketing emails. Unsubscribe anytime.
        </p>
      </div>
    </section>
  )
}