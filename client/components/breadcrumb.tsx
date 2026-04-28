import React from 'react';
import Link from 'next/link';
import { Home, ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  name: string;
  href: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  // If there are many items, show only Home and the last two on mobile
  const mobileItems = items.length > 3 ?
    [items[0], ...items.slice(-2)] :
    items;

  return (
    <nav className="flex text-sm text-[#072C2B]/70" aria-label="Breadcrumb">
      {/* Desktop breadcrumb */}
      <ol className="hidden md:flex items-center flex-wrap w-full">
        {items.map((item, index) => (
          <React.Fragment key={item.href}>
            <li className="flex items-center">
              {index === 0 && (
                <Home className="w-4 h-4 mr-1 text-[#072C2B]/50" />
              )}
              {index === items.length - 1 ? (
                <span className="font-medium text-[#072C2B]">{item.name}</span>
              ) : (
                <Link
                  href={item.href}
                  className="hover:text-[#072C2B] transition-colors font-medium"
                >
                  {item.name}
                </Link>
              )}
            </li>
            {index < items.length - 1 && (
              <li className="mx-2 text-[#072C2B]/40">
                <ChevronRight className="w-3 h-3" />
              </li>
            )}
          </React.Fragment>
        ))}
      </ol>

      {/* Mobile breadcrumb - simplified */}
      <ol className="flex md:hidden items-center flex-wrap w-full">
        {mobileItems.map((item, index) => (
          <React.Fragment key={item.href}>
            <li className="flex items-center">
              {index === 0 && (
                <Home className="w-4 h-4 mr-1 text-[#072C2B]/50" />
              )}
              {/* If this is the second item in a simplified breadcrumb, show ellipsis */}
              {index === 1 && items.length > 3 && (
                <>
                  <span className="mx-2 text-[#072C2B]/40">
                    <ChevronRight className="w-3 h-3" />
                  </span>
                  <span className="text-[#072C2B]/40 mx-1">...</span>
                  <span className="mx-2 text-[#072C2B]/40">
                    <ChevronRight className="w-3 h-3" />
                  </span>
                </>
              )}
              {index === mobileItems.length - 1 ? (
                <span className="font-medium text-[#072C2B] truncate max-w-[150px]">{item.name}</span>
              ) : (
                <>
                  <Link
                    href={item.href}
                    className="hover:text-[#072C2B] transition-colors font-medium truncate max-w-[80px]"
                  >
                    {item.name}
                  </Link>
                  {!(index === 0 && items.length > 3 && mobileItems.length > 1) && (
                    <span className="mx-2 text-[#072C2B]/40">
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  )}
                </>
              )}
            </li>
          </React.Fragment>
        ))}
      </ol>
    </nav>
  );
}
