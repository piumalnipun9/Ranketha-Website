import { Navigation } from "@/components/home/Navigation"
import { Footer } from "@/components/home/Footer"

export default function CategoriesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navigation />
      {children}
      <Footer />
    </div>
  )
}
