// OrderContext.tsx
"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

export type OrderItem = {
  name: string;
  price: number;
  quantity: number;
  image: string;
};

export type Order = {
  id: string;
  customer: string;
  date: string;
  status: string;
  total: number;
  items: OrderItem[];
  trackingNumber: string;
};

const initialOrders: Order[] = [
  {
    id: "ORD-001",
    customer: "john.doe@example.com",
    date: "2024-01-15",
    status: "Delivered",
    total: 77.98,
    items: [
      {
        name: "Arduino Uno R3",
        price: 22.99,
        quantity: 2,
        image: "/placeholder.svg?height=100&width=100",
      },
      {
        name: "Raspberry Pi 4",
        price: 55.0,
        quantity: 1,
        image: "/placeholder.svg?height=100&width=100",
      },
    ],
    trackingNumber: "TRACK123456",
  },
  {
    id: "ORD-002",
    customer: "jane.smith@example.com",
    date: "2024-01-14",
    status: "Shipped",
    total: 32.48,
    items: [
      {
        name: "Arduino Uno R3",
        price: 22.99,
        quantity: 1,
        image: "/placeholder.svg?height=100&width=100",
      },
      {
        name: "DFRobot Sensor Pack",
        price: 9.49,
        quantity: 1,
        image: "/placeholder.svg?height=100&width=100",
      },
    ],
    trackingNumber: "TRACK654321",
  },
];

const OrderContext = createContext<{
  orders: Order[];
  updateOrder: (order: Order) => void;
} | undefined>(undefined);

export const useOrderContext = () => {
  const context = useContext(OrderContext);
  if (!context) throw new Error("useOrderContext must be used within OrderProvider");
  return context;
};

export const OrderProvider = ({ children }: { children: ReactNode }) => {
  const [orders, setOrders] = useState<Order[]>(initialOrders);

  const updateOrder = (updatedOrder: Order) => {
    setOrders((prev) =>
      prev.map((order) => (order.id === updatedOrder.id ? updatedOrder : order))
    );
  };

  return (
    <OrderContext.Provider value={{ orders, updateOrder }}>
      {children}
    </OrderContext.Provider>
  );
};
