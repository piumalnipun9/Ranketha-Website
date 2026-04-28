// ShippingInfo.tsx
// Page for Shipping Information

import React from "react";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-jsonld";
import { Navigation } from "@/components/home/Navigation";
import { Footer } from "@/components/home/Footer";

const ShippingInfo = () => {
  return (
    <>
      <Navigation />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: "Shipping Information", url: "/shipping-info" },
        ]}
      />
    <section className="relative bg-white">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-blue-900 mb-6 leading-tight">
            Shipping
            <span className="block bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              Information
            </span>
          </h1>
          <p className="text-xl text-blue-900/70 mb-8 max-w-3xl mx-auto">
            Learn about our shipping policies, delivery times, and costs for your orders.
          </p>
          <div className="max-w-2xl mx-auto mb-8 bg-white rounded-xl p-8 shadow-lg">
            <ul className="space-y-4 text-left text-blue-900/90 text-lg">
              <li><strong>Delivery Times:</strong> Most orders ship within 1-2 business days.</li>
              <li><strong>Shipping Costs:</strong> Calculated at checkout based on location and order size.</li>
              <li><strong>Tracking:</strong> You will receive a tracking number once your order ships.</li>
            </ul>
          </div>
        </div>
      </div>
  </section>
  <Footer />
    </>
  );
};

export default ShippingInfo;
