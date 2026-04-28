// This file contains common SEO keywords for various product categories
// Use these to enhance product metadata and content

export const productKeywords = {
  // Electronics components
  'electronics': [
    'buy electronics Sri Lanka',
    'electronic components Sri Lanka',
    'online electronics store',
    'electronic parts',
    'circuits',
    'Sri Lanka electronics shop'
  ],
  
  // Arduino related
  'arduino': [
    'Arduino Sri Lanka',
    'Arduino boards',
    'Arduino Uno',
    'Arduino Nano',
    'Arduino Mega',
    'Arduino shields',
    'Arduino kits',
    'buy Arduino online'
  ],
  
  // Raspberry Pi related
  'raspberry pi': [
    'Raspberry Pi Sri Lanka',
    'Raspberry Pi 4',
    'Raspberry Pi Zero',
    'Raspberry Pi accessories',
    'Raspberry Pi HAT',
    'Raspberry Pi camera',
    'buy Raspberry Pi online'
  ],
  
  // Sensors
  'sensors': [
    'electronic sensors Sri Lanka',
    'temperature sensors',
    'humidity sensors',
    'motion sensors',
    'ultrasonic sensors',
    'pressure sensors',
    'buy sensors online'
  ],
  
  // Development boards
  'development boards': [
    'development boards Sri Lanka',
    'microcontroller boards',
    'ESP8266',
    'ESP32',
    'STM32',
    'NodeMCU',
    'buy development boards online'
  ],
  
  // Tools
  'tools': [
    'electronics tools Sri Lanka',
    'soldering iron',
    'multimeter',
    'oscilloscope',
    'logic analyzer',
    'buy electronics tools online'
  ],
  
  // Robotics
  'robotics': [
    'robotics kits Sri Lanka',
    'robot components',
    'servo motors',
    'DC motors',
    'motor drivers',
    'robot chassis',
    'buy robotics parts online'
  ],
  
  // Power supplies
  'power': [
    'power supplies Sri Lanka',
    'AC adapters',
    'DC converters',
    'voltage regulators',
    'batteries',
    'buy power supplies online'
  ],
  
  // Passive components
  'passive components': [
    'resistors Sri Lanka',
    'capacitors',
    'inductors',
    'diodes',
    'transistors',
    'buy electronic components online'
  ],
  
  // Wires and connectors
  'connectors': [
    'wires Sri Lanka',
    'jumper wires',
    'connectors',
    'headers',
    'terminal blocks',
    'buy wires and connectors online'
  ]
};

// Function to get relevant keywords for a product based on name and category
export function getRelevantKeywords(productName: string, category?: string): string[] {
  const keywords: string[] = [];
  const lowercaseName = productName.toLowerCase();
  const lowercaseCategory = category?.toLowerCase() || '';
  
  // Add general electronics keywords
  keywords.push(...productKeywords['electronics']);
  
  // Add category-specific keywords
  for (const [key, values] of Object.entries(productKeywords)) {
    if (lowercaseCategory.includes(key) || lowercaseName.includes(key)) {
      keywords.push(...values);
    }
  }
  
  // Add product-specific keywords
  keywords.push(
    `${productName} Sri Lanka`,
    `buy ${productName} online`,
  `${productName} price`,
  `${productName} price in Sri Lanka`,
  `${productName} best price in Sri Lanka`,
  `where to buy ${productName} in Sri Lanka`,
  `buy ${productName} Sri Lanka`,
    `${productName} RoboClub`,
    `${productName} electronics`,
    `${productName} ${category || ''}`
  );
  
  // Return unique keywords
  return Array.from(new Set(keywords)).filter(Boolean);
}
