import type React from "react"
import { Outfit } from "next/font/google"
import "./globals.css"
import { CartDrawer } from "@/components/cart-drawer"
import { Toaster } from "@/components/toaster"
import { OrderProvider } from "@/context/OrderContext";
import { OrganizationJsonLd } from "@/components/organization-jsonld"
import { WebSiteJsonLd } from "@/components/website-jsonld"
import { LocalBusinessJsonLd } from "@/components/localbusiness-jsonld"
import { SiteNavigationJsonLd } from "@/components/site-navigation-jsonld"
import GoogleServices from "@/components/google-services"


const outfit = Outfit({
  subsets: ["latin"],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-outfit',
})


export { metadata } from "./metadata"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/ranketha-logo.png" sizes="any" />
        <link rel="apple-touch-icon" href="/ranketha-logo.png" />
        <GoogleServices />
      </head>
      <body className={`${outfit.className} ${outfit.variable}`}>
        <OrganizationJsonLd />
        <WebSiteJsonLd />
        <LocalBusinessJsonLd />
        <SiteNavigationJsonLd />
        <OrderProvider>
          {children}
          <CartDrawer />
          <Toaster />
        </OrderProvider>
      </body>
    </html>
  )
}
