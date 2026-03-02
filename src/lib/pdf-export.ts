import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { KPIEntry } from './storage';
import { format, parseISO } from 'date-fns';

export const generatePDFReport = (entries: KPIEntry[], startDate: string, endDate: string, userName?: string) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'letter'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFontSize(22);
  doc.setTextColor(16, 185, 129); // emerald-600
  doc.text('Performance Report', pageWidth / 2, 20, { align: 'center' });
  
  if (userName) {
    doc.setFontSize(12);
    doc.setTextColor(71, 85, 105); // slate-600
    doc.text(`User: ${userName}`, pageWidth / 2, 28, { align: 'center' });
  }

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Period: ${startDate} to ${endDate}`, pageWidth / 2, 35, { align: 'center' });
  
  doc.setDrawColor(200);
  doc.line(20, 38, pageWidth - 20, 38);

  // Totals Calculation
  const totals: Record<string, number> = {};
  entries.forEach(e => {
    totals[e.kpi] = (totals[e.kpi] || 0) + e.achieved;
  });

  // Main Table
  const tableData = entries.map(e => [
    format(parseISO(e.date), 'yyyy-MM-dd'),
    e.kpi,
    e.achieved.toLocaleString()
  ]);

  autoTable(doc, {
    startY: 45,
    head: [['Date', 'Product / KPI', 'Achieved Value']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [16, 185, 129] as [number, number, number], textColor: 255 },
    styles: { fontSize: 9 },
    columnStyles: {
      2: { halign: 'right' }
    }
  });

  // Grand Totals Table
  const lastY = (doc as any).lastAutoTable.finalY + 10;
  
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text('Summary Totals', 20, lastY);

  const totalData = Object.entries(totals).map(([kpi, val]) => [kpi, val.toLocaleString()]);
  
  autoTable(doc, {
    startY: lastY + 5,
    head: [['KPI Name', 'Total Value']],
    body: totalData,
    theme: 'grid',
    headStyles: { fillColor: [51, 65, 85] as [number, number, number] },
    columnStyles: {
      1: { halign: 'right' }
    },
    tableWidth: 100
  });

  // Footer
  const pageCount = (doc.internal as any).pages?.length - 1 || 1;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Generated on ${format(new Date(), 'yyyy-MM-dd HH:mm')} | Page ${i} of ${pageCount}`, pageWidth - 20, doc.internal.pageSize.getHeight() - 10, { align: 'right' });
  }

  doc.save(`Performance_Report_${format(new Date(), 'yyyyMMdd_HHmm')}.pdf`);
};