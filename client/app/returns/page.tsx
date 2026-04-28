// Returns.tsx
// Page for Returns information

import React from "react";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-jsonld";
import { Navigation } from "@/components/home/Navigation";
import { Footer } from "@/components/home/Footer";

const Returns = () => {
  return (
    <>
      <Navigation />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: "Returns & Refunds", url: "/returns" },
        ]}
      />
    <section className="relative bg-white">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-blue-900 mb-6 leading-tight">
            Returns
            <span className="block bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              & Refunds
            </span>
          </h1>
          <p className="text-xl text-blue-900/70 mb-8 max-w-3xl mx-auto">
            Read about our return policy, how to initiate a return, and related FAQs.
          </p>
          <div className="max-w-2xl mx-auto mb-8 bg-white rounded-xl p-8 shadow-lg">
            <ul className="space-y-4 text-left text-blue-900/90 text-lg">
              <li><strong>Return Policy:</strong> Returns accepted within 14 days of delivery.</li>
              <li><strong>How to Return:</strong> Contact support to initiate a return and receive instructions.</li>
              <li><strong>Refunds:</strong> Processed within 5 business days after receiving returned items.</li>
            </ul>
          </div>
        </div>
      </div>
  </section>
  <Footer />
    </>
  );
};

export default Returns;
