// WarrantyPolicy.tsx
// Page for Warranty Policy

import React from "react";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-jsonld";
import { Navigation } from "@/components/home/Navigation";
import { Footer } from "@/components/home/Footer";

const WarrantyPolicy = () => {
  return (
    <>
      <Navigation />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: "Warranty Policy", url: "/warranty-policy" },
        ]}
      />
    <section className="relative bg-white">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-blue-900 mb-6 leading-tight">
            Warranty
            <span className="block bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              Policy
            </span>
          </h1>
          <p className="text-xl text-blue-900/70 mb-8 max-w-3xl mx-auto">
            Learn about our limited warranty for hobbyist and educational electronics.
          </p>
          <div className="max-w-3xl mx-auto mb-8 bg-white rounded-xl p-8 shadow-lg text-left text-blue-900/90">
            <h2 className="text-2xl font-semibold mb-4">Warranty Policy</h2>
            <p className="mb-6">
              At RoboClub, we want our customers to have confidence in the products they purchase from us. Since our products are intended for hobbyist and educational use, we provide a limited warranty as follows:
            </p>

            <h3 className="text-xl font-semibold mb-2">Warranty Period</h3>
            <ul className="list-disc pl-6 mb-6 space-y-1">
              <li>All modules and components are covered by a 14-day limited warranty from the date of purchase.</li>
              <li>This warranty covers manufacturing defects and dead-on-arrival (DOA) products only.</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2">What is Covered</h3>
            <ul className="list-disc pl-6 mb-6 space-y-1">
              <li>Products that are defective due to manufacturing faults.</li>
              <li>Items that do not function as advertised under normal usage.</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2">What is Not Covered</h3>
            <ul className="list-disc pl-6 mb-6 space-y-1">
              <li>Damage caused by incorrect wiring, over-voltage, short circuits, soldering mistakes, or misuse.</li>
              <li>Damage due to modifications, improper handling, or accidents.</li>
              <li>Normal wear and tear.</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2">How to Claim</h3>
            <ul className="list-disc pl-6 mb-6 space-y-1">
              <li>Contact us within 14 days of delivery with your order details and a description of the issue.</li>
              <li>If approved, we will provide a replacement or store credit. Refunds may be issued at our discretion.</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2">Exclusions</h3>
            <ul className="list-disc pl-6 mb-2 space-y-1">
              <li>Products purchased on clearance or marked as “No Warranty” are not eligible.</li>
              <li>Warranty does not cover costs of shipping for returns or replacements.</li>
            </ul>
          </div>
        </div>
      </div>
  </section>
  <Footer />
  </>
  );
};

export default WarrantyPolicy;
