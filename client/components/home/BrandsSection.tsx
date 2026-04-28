import Link from "next/link"
import Image from "next/image"

interface Brand {
  name: string
  logo: string
}

interface BrandsSectionProps {
  brands: Brand[]
}

export function BrandsSection({ brands }: BrandsSectionProps) {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Trusted Brands</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 items-center justify-items-center">
          {brands.map((brand, index) => (
              <Image
                key={brand.name || `brand-${index}`}
                src={brand.logo || "/placeholder.svg"}
                alt={brand.name}
                width={120}
                height={40}
                className="object-contain opacity-60 hover:opacity-100 transition-opacity "
              />
          ))}
        </div>
      </div>
    </section>
  )
}