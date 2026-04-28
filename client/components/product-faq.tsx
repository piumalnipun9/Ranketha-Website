import React from 'react'
import Script from 'next/script'

interface ProductFAQProps {
  productName: string
  category?: string
  brand?: string
  shipping?: boolean
}

export function ProductFAQ({ productName, category, brand, shipping = true }: ProductFAQProps) {
  // Create a list of relevant FAQs based on the product information
  const faqs = [
    {
      question: `How long does shipping take for ${productName}?`,
      answer: `Shipping for ${productName} typically takes 1-5 business days within Sri Lanka. Orders above LKR 10,000 qualify for free shipping.`
    },
    {
      question: `Does ${productName} come with a warranty?`,
      answer: `Yes, ${productName} comes with a standard warranty. Please see our warranty policy page for specific details or contact our customer service.`
    },
    {
      question: `Is ${productName} available for store pickup?`,
      answer: `Yes, you can pick up ${productName} from our physical store location in Katubadda, Moratuwa. Please call ahead to confirm availability.`
    }
  ]

  // Add category-specific FAQ if available
  if (category) {
    faqs.push({
      question: `What can I build with ${productName} in ${category} projects?`,
      answer: `${productName} is ideal for ${category} projects. It can be used for prototyping, education, hobby projects, and professional applications. Check our projects page for inspiration.`
    })
  }

  // Add brand-specific FAQ if available
  if (brand) {
    faqs.push({
      question: `Is this an authentic ${brand} ${productName}?`,
      answer: `Yes, RoboClub only sells authentic ${brand} products. We source our inventory directly from authorized distributors and manufacturers to ensure quality and reliability.`
    })
  }

  // Create the JSON-LD schema for FAQs
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  }

  return (
    <>
      <Script
        id={`product-faq-jsonld-${productName.replace(/\s+/g, '-')}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mt-8 border-t border-gray-200 pt-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h3>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900">{faq.question}</h4>
              <p className="mt-2 text-gray-600">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
