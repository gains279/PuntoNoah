import { Injectable, inject } from '@angular/core';
import { FinanceService } from './finance.service';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency } from '@angular/common';

interface jsPDFWithPlugin extends jsPDF {
  lastAutoTable?: {
    finalY: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class PdfService {
  private financeService = inject(FinanceService);

  exportDailyClosing(date: Date = new Date()) {
    const doc = new jsPDF() as jsPDFWithPlugin;
    const dateStr = date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(20, 20, 20);
    doc.text('CIERRE DIARIO', 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Fecha: ${dateStr}`, 14, 30);
    doc.text(`Generado el: ${new Date().toLocaleString()}`, 14, 35);

    // Filter data for the specific day
    const startOfDay = new Date(date.setHours(0, 0, 0, 0)).getTime();
    const endOfDay = new Date(date.setHours(23, 59, 59, 999)).getTime();

    const dailySales = this.financeService.sales().filter(s => s.date >= startOfDay && s.date <= endOfDay);
    const dailyExpenses = this.financeService.expenses().filter(e => e.date >= startOfDay && e.date <= endOfDay);
    const dailyInvestments = this.financeService.investments().filter(i => i.date >= startOfDay && i.date <= endOfDay);

    const totalSales = dailySales.reduce((sum, s) => sum + s.totalAmount, 0);
    const totalCash = dailySales.reduce((sum, s) => sum + s.cashAmount, 0);
    const totalTransfer = dailySales.reduce((sum, s) => sum + s.transferAmount, 0);
    const totalGrossProfit = dailySales.reduce((sum, s) => sum + s.grossProfit, 0);
    const totalExpenses = dailyExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalInvestments = dailyInvestments.reduce((sum, i) => sum + i.capital, 0);

    // Summary Table
    autoTable(doc, {
      startY: 45,
      head: [['Concepto', 'Monto']],
      body: [
        ['Total Ventas', this.format(totalSales)],
        ['Ventas en Efectivo', this.format(totalCash)],
        ['Ventas por Transferencia', this.format(totalTransfer)],
        ['Ganancia Bruta', this.format(totalGrossProfit)],
        ['Ganancia Neta Estimada', this.format(totalGrossProfit - totalExpenses)],
        ['---', '---'],
        ['Inversión en Capital', this.format(totalInvestments)],
        ['Total Gastos', this.format(totalExpenses)],
        ['Inversión Total del Día', this.format(totalInvestments + totalExpenses)]
      ],
      theme: 'grid',
      headStyles: { fillColor: [20, 20, 20], textColor: [255, 255, 255] },
      columnStyles: { 1: { halign: 'right' } }
    });

    const lastY = doc.lastAutoTable?.finalY || 45;

    // Sales Details
    if (dailySales.length > 0) {
      doc.setFontSize(14);
      doc.setTextColor(20, 20, 20);
      doc.text('Detalle de Ventas', 14, lastY + 15);

      autoTable(doc, {
        startY: lastY + 20,
        head: [['ID', 'Hora', 'Método', 'Total']],
        body: dailySales.map(s => [
          s.id.substring(0, 8),
          new Date(s.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
          s.paymentMethod === 'cash' ? 'Efectivo' : s.paymentMethod === 'transfer' ? 'Transferencia' : 'Dividido',
          this.format(s.totalAmount)
        ]),
        theme: 'striped',
        headStyles: { fillColor: [60, 60, 60] },
        columnStyles: { 3: { halign: 'right' } }
      });
    }

    const lastY2 = doc.lastAutoTable?.finalY || lastY;

    // Expenses Details
    if (dailyExpenses.length > 0) {
      doc.setFontSize(14);
      doc.setTextColor(20, 20, 20);
      doc.text('Detalle de Gastos', 14, lastY2 + 15);

      autoTable(doc, {
        startY: lastY2 + 20,
        head: [['Descripción', 'Monto']],
        body: dailyExpenses.map(e => [
          e.description,
          this.format(e.amount)
        ]),
        theme: 'striped',
        headStyles: { fillColor: [60, 60, 60] },
        columnStyles: { 1: { halign: 'right' } }
      });
    }

    const lastY3 = doc.lastAutoTable?.finalY || lastY2;

    // Inventory Alert (Low Stock)
    const lowStock = this.financeService.products().filter(p => p.stock <= p.minStock);
    if (lowStock.length > 0) {
      doc.setFontSize(14);
      doc.setTextColor(20, 20, 20);
      doc.text('Alertas de Inventario (Stock Bajo)', 14, lastY3 + 15);

      autoTable(doc, {
        startY: lastY3 + 20,
        head: [['Producto', 'Stock Actual', 'Mínimo']],
        body: lowStock.map(p => [
          p.name,
          p.stock,
          p.minStock
        ]),
        theme: 'striped',
        headStyles: { fillColor: [180, 83, 9] }, // Amber-700
        columnStyles: { 1: { halign: 'center' }, 2: { halign: 'center' } }
      });
    }

    doc.save(`cierre_${dateStr.replace(/\//g, '-')}.pdf`);
  }

  private format(val: number): string {
    return formatCurrency(val, 'en-US', '$', 'USD', '1.2-2');
  }
}
