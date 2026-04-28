import { useState, useEffect } from 'react';

// Popular search suggestions for different product types
const POPULAR_SEARCHES = {
  arduino: [
    'Arduino Uno',
    'Arduino Nano',
    'Arduino Mega',
    'Arduino sensors',
    'Arduino starter kit',
  ],
  raspberry_pi: [
    'Raspberry Pi 4',
    'Raspberry Pi Zero',
    'Raspberry Pi camera',
    'Raspberry Pi accessories',
  ],
  sensors: [
    'Temperature sensor',
    'Humidity sensor',
    'Motion sensor',
    'Ultrasonic sensor',
    'Pressure sensor',
  ],
  development_boards: [
    'ESP32',
    'ESP8266',
    'NodeMCU',
    'STM32',
  ],
  components: [
    'Resistors',
    'Capacitors',
    'LEDs',
    'Transistors',
    'Jumper wires',
  ],
};

export function usePopularSearches(initialQuery = '') {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    const query = searchQuery.toLowerCase();
    
    // Find relevant suggestions based on query
    if (query) {
      // First, check if query matches any of our categories
      let relevantSuggestions: string[] = [];
      
      if (query.includes('arduino')) {
        relevantSuggestions = [...POPULAR_SEARCHES.arduino];
      } else if (query.includes('raspberry') || query.includes('pi')) {
        relevantSuggestions = [...POPULAR_SEARCHES.raspberry_pi];
      } else if (query.includes('sensor')) {
        relevantSuggestions = [...POPULAR_SEARCHES.sensors];
      } else if (query.includes('esp') || query.includes('board') || query.includes('mcu')) {
        relevantSuggestions = [...POPULAR_SEARCHES.development_boards];
      } else if (query.includes('resist') || query.includes('capaci') || query.includes('led') || query.includes('wire')) {
        relevantSuggestions = [...POPULAR_SEARCHES.components];
      }
      
      // Filter all categories for matches
      if (relevantSuggestions.length === 0) {
        const allSuggestions = [
          ...POPULAR_SEARCHES.arduino,
          ...POPULAR_SEARCHES.raspberry_pi,
          ...POPULAR_SEARCHES.sensors,
          ...POPULAR_SEARCHES.development_boards,
          ...POPULAR_SEARCHES.components
        ];
        
        relevantSuggestions = allSuggestions.filter(s => 
          s.toLowerCase().includes(query)
        );
      }
      
      setSuggestions(relevantSuggestions.slice(0, 5));
    } else {
      // If no query, suggest popular searches from all categories
      const popularSuggestions = [
        POPULAR_SEARCHES.arduino[0],
        POPULAR_SEARCHES.raspberry_pi[0],
        POPULAR_SEARCHES.sensors[0],
        POPULAR_SEARCHES.development_boards[0],
        POPULAR_SEARCHES.components[0]
      ];
      
      setSuggestions(popularSuggestions);
    }
  }, [searchQuery]);

  return {
    searchQuery,
    setSearchQuery,
    suggestions
  };
}
