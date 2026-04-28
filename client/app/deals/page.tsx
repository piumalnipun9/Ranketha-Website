// Deals page
import React from "react";

const Deals = () => {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-500 opacity-90"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Exclusive
            <span className="block bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              Deals & Offers
            </span>
          </h1>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Save big on top electronics, robotics kits, and accessories. Check out our latest discounts and special offers!
          </p>
          <div className="max-w-2xl mx-auto mb-8 bg-white/90 rounded-xl p-8 shadow-lg backdrop-blur-sm">
            <ul className="space-y-4 text-left text-blue-900 text-lg">
              <li><strong>Arduino Starter Kit</strong> - 20% off</li>
              <li><strong>Raspberry Pi 4 Model B</strong> - Save LKR 10</li>
              <li><strong>ESP32 WiFi Board</strong> - Buy 2 Get 1 Free</li>
              <li><strong>DFRobot Sensor Pack</strong> - 15% off</li>
              <li><strong>Adafruit Accessories</strong> - Free shipping</li>
            </ul>
          </div>
          <div className="mt-8">
            <button className="bg-yellow-400 hover:bg-orange-400 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg transition-colors">
              Shop All Deals
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Deals;
