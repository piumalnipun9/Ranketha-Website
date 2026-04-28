'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, Filter, X, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Label } from '@/components/ui/label';

interface SearchFiltersBarProps {
  filters: any;
  availableFilters: {
    categories: string[];
  };
  suggestions: Array<{ type: string; text: string }>;
  onFilterChange: (key: string, value: any) => void;
  onResetFilters: () => void;
  totalResults: number;
}

export default function SearchFiltersBar({
  filters,
  availableFilters,
  suggestions,
  onFilterChange,
  onResetFilters,
  totalResults
}: SearchFiltersBarProps) {
  const [query, setQuery] = useState(filters.query || '');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showPriceFilter, setShowPriceFilter] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (searchQuery = query) => {
    onFilterChange('query', searchQuery);
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    handleSearch(suggestion);
  };

  const clearSearch = () => {
    setQuery('');
    onFilterChange('query', '');
  };

  const hasActiveFilters = 
    filters.query || 
    filters.category !== 'all' || 
    filters.brand !== 'all' || 
    filters.minPrice > 0 || 
    filters.maxPrice < Infinity;

  return (
    <div className="space-y-4">
      {/* Main Filter Bar */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
        {/* Left side - Category, Brand, Price, Sort filters */}
        <div className="flex flex-wrap gap-3 items-center flex-1">
          {/* Category Filter */}
          <div className="min-w-[150px]">
            <Select
              value={filters.category}
              onValueChange={(value) => onFilterChange('category', value)}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {availableFilters.categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Price Filter */}
          <Popover open={showPriceFilter} onOpenChange={setShowPriceFilter}>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                className="h-10 px-3"
                aria-expanded={showPriceFilter}
              >
                <Filter className="h-4 w-4 mr-2" />
                Price
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="start">
              <div className="space-y-4">
                <h4 className="font-medium">Price Range</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="minPrice" className="text-sm">Min Price</Label>
                    <Input
                      id="minPrice"
                      type="number"
                      placeholder="0"
                      value={filters.minPrice === 0 ? '' : filters.minPrice}
                      onChange={(e) => onFilterChange('minPrice', Number(e.target.value) || 0)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxPrice" className="text-sm">Max Price</Label>
                    <Input
                      id="maxPrice"
                      type="number"
                      placeholder="No limit"
                      value={filters.maxPrice === Infinity ? '' : filters.maxPrice}
                      onChange={(e) => onFilterChange('maxPrice', Number(e.target.value) || Infinity)}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onFilterChange('minPrice', 0);
                      onFilterChange('maxPrice', Infinity);
                    }}
                  >
                    Clear
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setShowPriceFilter(false)}
                  >
                    Apply
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Sort Filter */}
          <div className="min-w-[150px]">
            <Select
              value={filters.sortBy}
              onValueChange={(value) => onFilterChange('sortBy', value)}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="name">Name A-Z</SelectItem>
                <SelectItem value="price_asc">Price: Low to High</SelectItem>
                <SelectItem value="price_desc">Price: High to Low</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reset Filters Button */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onResetFilters}
              className="text-gray-600 hover:text-gray-900"
            >
              <X className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>

        {/* Right side - Search */}
        <div className="w-full lg:w-auto lg:min-w-[300px]">
          <div className="relative" ref={searchRef}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search products..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowSuggestions(e.target.value.length >= 2);
                }}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                onFocus={() => setShowSuggestions(query.length >= 2)}
                className="pl-10 pr-12 h-10"
              />
              {query && (
                <Button
                  onClick={clearSearch}
                  variant="ghost"
                  size="sm"
                  className="absolute right-8 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
              <Button
                onClick={() => handleSearch()}
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>

            {/* Search Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 mt-1 max-h-60 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center gap-2 border-b border-gray-100 last:border-b-0"
                    onClick={() => handleSuggestionClick(suggestion.text)}
                  >
                    <Badge variant="secondary" className="text-xs">
                      {suggestion.type}
                    </Badge>
                    <span className="truncate">{suggestion.text}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.query && (
            <Badge variant="default" className="flex items-center gap-1">
              Search: {filters.query}
              <Button
                onClick={() => onFilterChange('query', '')}
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1 hover:bg-white/20"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {filters.category !== 'all' && (
            <Badge variant="outline" className="flex items-center gap-1">
              Category: {filters.category}
              <Button
                onClick={() => onFilterChange('category', 'all')}
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {filters.brand !== 'all' && (
            <Badge variant="outline" className="flex items-center gap-1">
              Brand: {filters.brand}
              <Button
                onClick={() => onFilterChange('brand', 'all')}
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {(filters.minPrice > 0 || filters.maxPrice < Infinity) && (
            <Badge variant="outline" className="flex items-center gap-1">
              Price: ${filters.minPrice} - {filters.maxPrice === Infinity ? '∞' : `$${filters.maxPrice}`}
              <Button
                onClick={() => {
                  onFilterChange('minPrice', 0);
                  onFilterChange('maxPrice', Infinity);
                }}
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}

      {/* Results Summary */}
      <div className="text-sm text-gray-600">
        {filters.query ? (
          <p>Showing {totalResults} results for "{filters.query}"</p>
        ) : (
          <p>Showing {totalResults} products</p>
        )}
      </div>
    </div>
  );
}
