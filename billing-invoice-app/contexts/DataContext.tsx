"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Invoice } from '@/types';

interface DataContextType {
  products: Product[];
  invoices: Invoice[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addInvoice: (invoice: Omit<Invoice, 'id' | 'invoiceNumber' | 'date'>) => void;
  updateInvoice: (id: string, invoice: Partial<Invoice>) => void;
  getProduct: (id: string) => Product | undefined;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    // Load data from localStorage
    const storedProducts = localStorage.getItem('products');
    const storedInvoices = localStorage.getItem('invoices');

    if (storedProducts) {
      setProducts(JSON.parse(storedProducts));
    } else {
      // Initialize with sample products
      const sampleProducts: Product[] = [
        {
          id: '1',
          name: 'Laptop',
          description: 'High-performance laptop',
          price: 50000,
          stock: 10,
          category: 'Electronics',
          sku: 'LAP001',
        },
        {
          id: '2',
          name: 'Mouse',
          description: 'Wireless mouse',
          price: 500,
          stock: 50,
          category: 'Accessories',
          sku: 'MOU001',
        },
        {
          id: '3',
          name: 'Keyboard',
          description: 'Mechanical keyboard',
          price: 2000,
          stock: 30,
          category: 'Accessories',
          sku: 'KEY001',
        },
      ];
      setProducts(sampleProducts);
      localStorage.setItem('products', JSON.stringify(sampleProducts));
    }

    if (storedInvoices) {
      setInvoices(JSON.parse(storedInvoices));
    }
  }, []);

  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
    };
    const updatedProducts = [...products, newProduct];
    setProducts(updatedProducts);
    localStorage.setItem('products', JSON.stringify(updatedProducts));
  };

  const updateProduct = (id: string, productUpdate: Partial<Product>) => {
    const updatedProducts = products.map((p) =>
      p.id === id ? { ...p, ...productUpdate } : p
    );
    setProducts(updatedProducts);
    localStorage.setItem('products', JSON.stringify(updatedProducts));
  };

  const deleteProduct = (id: string) => {
    const updatedProducts = products.filter((p) => p.id !== id);
    setProducts(updatedProducts);
    localStorage.setItem('products', JSON.stringify(updatedProducts));
  };

  const addInvoice = (invoice: Omit<Invoice, 'id' | 'invoiceNumber' | 'date'>) => {
    const invoiceNumber = `INV-${Date.now()}`;
    const newInvoice: Invoice = {
      ...invoice,
      id: Date.now().toString(),
      invoiceNumber,
      date: new Date().toISOString(),
    };
    const updatedInvoices = [...invoices, newInvoice];
    setInvoices(updatedInvoices);
    localStorage.setItem('invoices', JSON.stringify(updatedInvoices));

    // Update product stock
    invoice.items.forEach((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (product) {
        updateProduct(product.id, { stock: product.stock - item.quantity });
      }
    });
  };

  const updateInvoice = (id: string, invoiceUpdate: Partial<Invoice>) => {
    const updatedInvoices = invoices.map((inv) =>
      inv.id === id ? { ...inv, ...invoiceUpdate } : inv
    );
    setInvoices(updatedInvoices);
    localStorage.setItem('invoices', JSON.stringify(updatedInvoices));
  };

  const getProduct = (id: string) => {
    return products.find((p) => p.id === id);
  };

  return (
    <DataContext.Provider
      value={{
        products,
        invoices,
        addProduct,
        updateProduct,
        deleteProduct,
        addInvoice,
        updateInvoice,
        getProduct,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
