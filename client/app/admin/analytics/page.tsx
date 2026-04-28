
'use client';

import { useEffect, useState } from 'react';

interface FinancialSummary {
  totalRevenue: number;
  totalCostOfGoodsSold: number;
  grossProfit: number;
  profitMargin: number;
  totalOrders: number;
  totalItemsSold: number;
}

export default function AdminAnalyticsPage() {
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSummary() {
      try {
        const response = await fetch('/api/analytics/financial-summary');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        setSummary(data);
      } catch (err) {
        setError(err.message);
      }
    }

    fetchSummary();
  }, []);

  if (error) {
    return <div className="container mx-auto p-4">Error: {error}</div>;
  }

  if (!summary) {
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Financial Analytics</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-4 border rounded shadow">
          <h2 className="text-lg font-semibold">Total Revenue</h2>
          <p className="text-3xl">{formatCurrency(summary.totalRevenue)}</p>
        </div>
        <div className="p-4 border rounded shadow">
          <h2 className="text-lg font-semibold">Total Cost of Goods Sold</h2>
          <p className="text-3xl">{formatCurrency(summary.totalCostOfGoodsSold)}</p>
        </div>
        <div className="p-4 border rounded shadow">
          <h2 className="text-lg font-semibold">Gross Profit</h2>
          <p className="text-3xl">{formatCurrency(summary.grossProfit)}</p>
        </div>
        <div className="p-4 border rounded shadow">
          <h2 className="text-lg font-semibold">Profit Margin</h2>
          <p className="text-3xl">{summary.profitMargin}%</p>
        </div>
        <div className="p-4 border rounded shadow">
          <h2 className="text-lg font-semibold">Total Orders</h2>
          <p className="text-3xl">{summary.totalOrders}</p>
        </div>
        <div className="p-4 border rounded shadow">
          <h2 className="text-lg font-semibold">Total Items Sold</h2>
          <p className="text-3xl">{summary.totalItemsSold}</p>
        </div>
      </div>
    </div>
  );
}
