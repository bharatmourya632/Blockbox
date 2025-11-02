"use client";

import { useData } from '@/contexts/DataContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Link from 'next/link';

export default function DashboardPage() {
  const { invoices, products } = useData();

  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const totalInvoices = invoices.length;
  const paidInvoices = invoices.filter((inv) => inv.status === 'paid').length;
  const pendingInvoices = invoices.filter((inv) => inv.status === 'pending').length;
  const lowStockProducts = products.filter((p) => p.stock < 10).length;

  const recentInvoices = invoices.slice(-5).reverse();

  const stats = [
    {
      title: 'Total Revenue',
      value: `₹${totalRevenue.toLocaleString('en-IN')}`,
      icon: '💰',
      color: 'bg-green-500',
    },
    {
      title: 'Total Invoices',
      value: totalInvoices,
      icon: '📄',
      color: 'bg-blue-500',
    },
    {
      title: 'Paid Invoices',
      value: paidInvoices,
      icon: '✅',
      color: 'bg-purple-500',
    },
    {
      title: 'Pending Invoices',
      value: pendingInvoices,
      icon: '⏳',
      color: 'bg-orange-500',
    },
    {
      title: 'Total Products',
      value: products.length,
      icon: '📦',
      color: 'bg-indigo-500',
    },
    {
      title: 'Low Stock Alert',
      value: lowStockProducts,
      icon: '⚠️',
      color: 'bg-red-500',
    },
  ];

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's your business overview.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} w-14 h-14 rounded-full flex items-center justify-center text-2xl`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Recent Invoices</h2>
              <Link
                href="/history"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View All
              </Link>
            </div>
            {recentInvoices.length > 0 ? (
              <div className="space-y-4">
                {recentInvoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">{invoice.customerName}</p>
                      <p className="text-sm text-gray-600">{invoice.invoiceNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">₹{invoice.total.toLocaleString('en-IN')}</p>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          invoice.status === 'paid'
                            ? 'bg-green-100 text-green-700'
                            : invoice.status === 'pending'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {invoice.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No invoices yet</p>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
            </div>
            <div className="space-y-3">
              <Link
                href="/billing"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-lg font-semibold transition text-center"
              >
                📝 Create New Invoice
              </Link>
              <Link
                href="/inventory"
                className="block w-full bg-green-600 hover:bg-green-700 text-white py-4 px-6 rounded-lg font-semibold transition text-center"
              >
                ➕ Add Product
              </Link>
              <Link
                href="/sales"
                className="block w-full bg-purple-600 hover:bg-purple-700 text-white py-4 px-6 rounded-lg font-semibold transition text-center"
              >
                📊 View Analytics
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
