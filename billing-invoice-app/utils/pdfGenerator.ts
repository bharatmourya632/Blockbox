import jsPDF from 'jspdf';
import { Invoice } from '@/types';

export function generateInvoicePDF(invoice: Invoice) {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', 105, 20, { align: 'center' });

  // Invoice details
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Invoice Number: ${invoice.invoiceNumber}`, 20, 35);
  doc.text(`Date: ${new Date(invoice.date).toLocaleDateString('en-IN')}`, 20, 42);
  doc.text(`Status: ${invoice.status.toUpperCase()}`, 20, 49);

  // Customer details
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Bill To:', 20, 65);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.customerName, 20, 72);
  doc.text(invoice.customerEmail, 20, 79);
  doc.text(invoice.customerPhone, 20, 86);
  doc.text(invoice.customerAddress, 20, 93, { maxWidth: 80 });

  // Table header
  const tableTop = 115;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Item', 20, tableTop);
  doc.text('Qty', 110, tableTop);
  doc.text('Price', 135, tableTop);
  doc.text('Total', 170, tableTop);

  // Draw line under header
  doc.line(20, tableTop + 2, 190, tableTop + 2);

  // Table items
  doc.setFont('helvetica', 'normal');
  let yPosition = tableTop + 10;

  invoice.items.forEach((item) => {
    doc.text(item.productName, 20, yPosition, { maxWidth: 80 });
    doc.text(item.quantity.toString(), 110, yPosition);
    doc.text(`₹${item.price.toLocaleString('en-IN')}`, 135, yPosition);
    doc.text(`₹${item.total.toLocaleString('en-IN')}`, 170, yPosition);
    yPosition += 8;
  });

  // Draw line before totals
  yPosition += 5;
  doc.line(20, yPosition, 190, yPosition);

  // Totals
  yPosition += 10;
  doc.text('Subtotal:', 135, yPosition);
  doc.text(`₹${invoice.subtotal.toLocaleString('en-IN')}`, 170, yPosition);

  yPosition += 7;
  doc.text('Tax (18%):', 135, yPosition);
  doc.text(`₹${invoice.tax.toLocaleString('en-IN')}`, 170, yPosition);

  yPosition += 7;
  doc.setFont('helvetica', 'bold');
  doc.text('Total:', 135, yPosition);
  doc.text(`₹${invoice.total.toLocaleString('en-IN')}`, 170, yPosition);

  // Footer
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text('Thank you for your business!', 105, 280, { align: 'center' });

  // Save the PDF
  doc.save(`${invoice.invoiceNumber}.pdf`);
}
