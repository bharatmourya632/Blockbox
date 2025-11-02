"use client";

import { useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function SalesPage() {
  const { invoices, products } = useData();

  const salesData = useMemo(() => {
    const monthlyData: { [key: string]: { revenue: number; count: number } } = {};

    invoices.forEach((invoice) => {
      const date = new Date(invoice.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { revenue: 0, count: 0 };
      }

      if (invoice.status === 'paid') {
        monthlyData[monthKey].revenue += invoice.total;
        monthlyData[monthKey].count += 1;
      }
    });

    return Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        revenue: data.revenue,
        invoices: data.count,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [invoices]);

  const statusData = useMemo(() => {
    const paid = invoices.filter((inv) => inv.status === 'paid').length;
    const pending = invoices.filter((inv) => inv.status === 'pending').length;
    const cancelled = invoices.filter((inv) => inv.status === 'cancelled').length;

    return [
      { name: 'Paid', value: paid, color: '#10b981' },
      { name: 'Pending', value: pending, color: '#f59e0b' },
      { name: 'Cancelled', value: cancelled, color: '#ef4444' },
    ];
  }, [invoices]);

  const topProducts = useMemo(() => {
    const productSales: { [key: string]: { name: string; quantity: number; revenue: number } } =
      {};

    invoices.forEach((invoice) => {
      if (invoice.status === 'paid') {
        invoice.items.forEach((item) => {
          if (!productSales[item.productId]) {
            productSales[item.productId] = {
              name: item.productName,
              quantity: 0,
              revenue: 0,
            };
          }
          productSales[item.productId].quantity += item.quantity;
          productSales[item.productId].revenue += item.total;
        });
      }
    });

    return Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [invoices]);

  const totalRevenue = invoices
    .filter((inv) => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.total, 0);

  const averageInvoiceValue =
    invoices.filter((inv) => inv.status === 'paid').length > 0
      ? totalRevenue / invoices.filter((inv) => inv.status === 'paid').length
      : 0;

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Sales Analysis</h1>
          <p className="text-gray-600 mt-2">Comprehensive insights into your business performance</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-gray-600 text-sm font-medium">Total Revenue</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              ₹{totalRevenue.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-gray-600 text-sm font-medium">Total Invoices</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{invoices.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-gray-600 text-sm font-medium">Average Invoice Value</p>
            <p className="text-3xl font-bold text-purple-600 mt-2">
              ₹{Math.round(averageInvoiceValue).toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Revenue Trend</h2>
            {salesData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Revenue (₹)"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-12">No sales data available</p>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Invoice Status Distribution</h2>
            {statusData.some((d) => d.value > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-12">No invoice data available</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Top Selling Products</h2>
          {topProducts.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProducts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#10b981" name="Revenue (₹)" />
                <Bar dataKey="quantity" fill="#3b82f6" name="Quantity Sold" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-12">No product sales data available</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
