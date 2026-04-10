import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Theme Colors (Matching the UI)
const COLORS = {
  indigo: [79, 70, 229],
  slateBlack: [15, 23, 42],
  slateGray: [100, 116, 139],
  emerald: [16, 185, 129],
  background: [248, 250, 252]
};

export const generateDietPDF = (plan) => {
  const doc = jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  // Header Background
  doc.setFillColor(...COLORS.slateBlack);
  doc.rect(0, 0, pageWidth, 40, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('GYMSTAFF PROTOCOL', 15, 22);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bolditalic');
  doc.setTextColor(199, 210, 254); // Light indigo
  doc.text('NUTRITIONAL BLUEPRINT', 15, 32);

  // Logo / Decorative Element
  doc.setDrawColor(79, 70, 229);
  doc.setLineWidth(1.5);
  doc.line(pageWidth - 45, 20, pageWidth - 15, 20);

  // Plan Details
  doc.setTextColor(...COLORS.slateBlack);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(plan.name.toUpperCase(), 15, 55);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.slateGray);
  const splitDescription = doc.splitTextToSize(plan.description || 'No strategic summary provided.', pageWidth - 30);
  doc.text(splitDescription, 15, 65);

  // Table
  const tableData = plan.meals.map(meal => [
    meal.day || 'Daily',
    meal.time || '--:--',
    meal.food || 'Not specified',
    meal.calories || 0,
    meal.protein || 0,
    meal.carbs || 0,
    meal.fat || 0
  ]);

  autoTable(doc, {
    startY: 85,
    head: [['PHASE', 'TIMESTAMP', 'NUTRITIONAL LOAD', 'CALS', 'PRO', 'CARB', 'FAT']],
    body: tableData,
    headStyles: {
      fillColor: COLORS.indigo,
      textColor: 255,
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 9,
      textColor: COLORS.slateBlack,
      cellPadding: 5
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251]
    },
    columnStyles: {
      0: { fontStyle: 'bold' },
      2: { cellWidth: 'auto' },
      3: { halign: 'center' },
      4: { halign: 'center' },
      5: { halign: 'center' },
      6: { halign: 'center' }
    },
    margin: { left: 15, right: 15 }
  });

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.slateGray);
    doc.text(`Generated on ${new Date().toLocaleDateString()} | Page ${i} of ${pageCount}`, 15, doc.internal.pageSize.height - 10);
    doc.text('ESTABLISHING PEAK PERFORMANCE | GYMSTAFF SYSTEMS', pageWidth - 15, doc.internal.pageSize.height - 10, { align: 'right' });
  }

  doc.save(`${plan.name.replace(/\s+/g, '_')}_Protocol.pdf`);
};

export const generateSchedulePDF = (bookings, trainerName) => {
  const doc = jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  // Header Background
  doc.setFillColor(...COLORS.indigo);
  doc.rect(0, 0, pageWidth, 40, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('OPERATIONAL GRID', 15, 22);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`TRAINER: ${trainerName.toUpperCase()}`, 15, 32);

  // Summary Stats
  const confirmed = bookings.filter(b => b.status === 'confirmed').length;
  const completed = bookings.filter(b => b.status === 'completed').length;
  const total = bookings.length;

  doc.setTextColor(...COLORS.slateBlack);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('MISSION PARAMETERS', 15, 55);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.slateGray);
  doc.text(`Total Sessions: ${total}`, 15, 65);
  doc.text(`Confirmed: ${confirmed}`, 60, 65);
  doc.text(`Completed: ${completed}`, 100, 65);

  // Table
  const tableData = bookings.map(b => [
    new Date(b.date).toLocaleDateString(),
    b.timeSlot || '--:--',
    b.user?.name || 'Unknown Client',
    b.user?.email || 'N/A',
    b.status.toUpperCase()
  ]);

  autoTable(doc, {
    startY: 75,
    head: [['SESSION DATE', 'TIME WINDOW', 'CLIENT IDENTITY', 'COMMS CHANNEL', 'STATUS']],
    body: tableData,
    headStyles: {
      fillColor: COLORS.slateBlack,
      textColor: 255,
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 9,
      textColor: COLORS.slateBlack,
      cellPadding: 5
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251]
    },
    columnStyles: {
      0: { fontStyle: 'bold' },
      4: { halign: 'center', fontStyle: 'bold' }
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 4) {
        const val = data.cell.text[0];
        if (val === 'COMPLETED') data.cell.styles.textColor = COLORS.emerald;
        if (val === 'CANCELLED') data.cell.styles.textColor = [220, 38, 38];
        if (val === 'CONFIRMED') data.cell.styles.textColor = COLORS.indigo;
      }
    },
    margin: { left: 15, right: 15 }
  });

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.slateGray);
    doc.text(`Operational Report | Generated on ${new Date().toLocaleString()}`, 15, doc.internal.pageSize.height - 10);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - 15, doc.internal.pageSize.height - 10, { align: 'right' });
  }

  doc.save(`Operational_Grid_${new Date().toISOString().split('T')[0]}.pdf`);
};

export const generateMembersPDF = (users, filter = 'all') => {
  const doc = jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  // Header
  doc.setFillColor(...COLORS.slateBlack);
  doc.rect(0, 0, pageWidth, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('GYMADMIN MEMBER DIRECTORY', 15, 22);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`FILTER: ${filter.toUpperCase()} | TOTAL ENTITIES: ${users.length}`, 15, 32);

  // Table
  const tableData = users.map(u => [
    u.name.toUpperCase(),
    u.email,
    u.contactNumber,
    u.address?.substring(0, 30) + (u.address?.length > 30 ? '...' : ''),
    u.status.toUpperCase()
  ]);

  autoTable(doc, {
    startY: 55,
    head: [['MEMBER NAME', 'EMAIL ADDRESS', 'CONTACT', 'PRIMARY ADDRESS', 'STATUS']],
    body: tableData,
    headStyles: { fillColor: COLORS.indigo, textColor: 255, fontSize: 8, fontStyle: 'bold' },
    bodyStyles: { fontSize: 9, cellPadding: 5 },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 4) {
        const val = data.cell.text[0];
        if (val === 'APPROVED') data.cell.styles.textColor = COLORS.emerald;
        if (val === 'REJECTED') data.cell.styles.textColor = [220, 38, 38];
        if (val === 'PENDING') data.cell.styles.textColor = COLORS.indigo;
      }
    }
  });

  doc.save(`Member_Directory_${new Date().toISOString().split('T')[0]}.pdf`);
};

export const generateStaffPDF = (trainers) => {
  const doc = jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  // Header
  doc.setFillColor(...COLORS.slateBlack);
  doc.rect(0, 0, pageWidth, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('GYMADMIN STAFF ROSTER', 15, 22);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`PROFESSIONAL PERSONNEL | TOTAL: ${trainers.length}`, 15, 32);

  // Table
  const tableData = trainers.map(t => [
    t.name.toUpperCase(),
    t.email,
    t.contactNumber,
    t.specialization || 'General Training',
    `Rs.${t.hourlyRate || 0}`
  ]);

  autoTable(doc, {
    startY: 55,
    head: [['STAFF IDENTITY', 'COMMS CHANNEL', 'CONTACT', 'SPECIALIZATION', 'HOURLY RATE']],
    body: tableData,
    headStyles: { fillColor: COLORS.indigo, textColor: 255, fontSize: 8, fontStyle: 'bold' },
    bodyStyles: { fontSize: 9, cellPadding: 5 },
    alternateRowStyles: { fillColor: [249, 250, 251] }
  });

  doc.save(`Staff_Roster_${new Date().toISOString().split('T')[0]}.pdf`);
};

export const generatePlansPDF = (plans) => {
  const doc = jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  // Header
  doc.setFillColor(...COLORS.slateBlack);
  doc.rect(0, 0, pageWidth, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('GYMADMIN MEMBERSHIP PLANS', 15, 22);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`OFFICIAL SERVICE CATALOG`, 15, 32);

  // Table
  const tableData = plans.map(p => [
    p.name.toUpperCase(),
    `Rs.${p.price}`,
    `${p.durationMonths} MONTHS`,
    p.isActive ? 'ACTIVE' : 'INACTIVE',
    p.features.join(', ').substring(0, 50) + (p.features.join(', ').length > 50 ? '...' : '')
  ]);

  autoTable(doc, {
    startY: 55,
    head: [['PLAN IDENTITY', 'PRICING', 'DURATION', 'STATUS', 'KEY FEATURES']],
    body: tableData,
    headStyles: { fillColor: COLORS.indigo, textColor: 255, fontSize: 8, fontStyle: 'bold' },
    bodyStyles: { fontSize: 9, cellPadding: 6 },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 3) {
        if (data.cell.text[0] === 'ACTIVE') data.cell.styles.textColor = COLORS.emerald;
        else data.cell.styles.textColor = [220, 38, 38];
      }
    }
  });

  doc.save(`Membership_Plans_${new Date().toISOString().split('T')[0]}.pdf`);
};

export const generateFinancePDF = (payments, revenueStats) => {
  const doc = jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  // Header
  doc.setFillColor(...COLORS.slateBlack);
  doc.rect(0, 0, pageWidth, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('GYMADMIN FINANCIAL RECORD', 15, 22);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`TOTAL REVENUE: Rs.${revenueStats.total.toLocaleString()} | TRANSACTIONS: ${payments.length}`, 15, 32);

  // Stats Breakdown
  doc.setTextColor(...COLORS.slateBlack);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('REVENUE SCALING OVERVIEW', 15, 55);

  const monthlyData = revenueStats.monthly.map(m => `${m.month}: Rs.${m.amount.toLocaleString()}`).join(' | ');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.slateGray);
  const splitStats = doc.splitTextToSize(monthlyData, pageWidth - 30);
  doc.text(splitStats, 15, 65);

  // Table
  const tableData = payments.map(p => [
    p.user?.name.toUpperCase() || 'UNKNOWN',
    p.plan?.name || 'N/A',
    `Rs.${p.amount.toLocaleString()}`,
    p.method.toUpperCase(),
    p.status.toUpperCase()
  ]);

  autoTable(doc, {
    startY: 85,
    head: [['MEMBER identity', 'PLAN SELECTION', 'AMOUNT', 'METHOD', 'STATUS']],
    body: tableData,
    headStyles: { fillColor: COLORS.indigo, textColor: 255, fontSize: 8, fontStyle: 'bold' },
    bodyStyles: { fontSize: 9, cellPadding: 5 },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 4) {
        const val = data.cell.text[0];
        if (val === 'CONFIRMED') data.cell.styles.textColor = COLORS.emerald;
        if (val === 'REJECTED') data.cell.styles.textColor = [220, 38, 38];
      }
    }
  });

  doc.save(`Financial_Record_${new Date().toISOString().split('T')[0]}.pdf`);
};
