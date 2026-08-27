import { jsPDF } from 'jspdf';
import { AcademyModule } from '../constants/htbAcademyCurriculum';

/**
 * Generates an institutional, high-resolution study dossier / handbook in PDF format for a specific module.
 */
export function generateModuleHandbookPdf(module: AcademyModule, userName?: string): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  let y = margin;

  // Header Banner
  doc.setFillColor(15, 23, 42); // Slate-900
  doc.rect(0, 0, pageWidth, 32, 'F');

  // Brand Name
  doc.setTextColor(6, 182, 212); // Cyan-500
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('APEX', margin, 14);

  const apexWidth = doc.getTextWidth('APEX');
  doc.setTextColor(255, 255, 255);
  doc.text('QUANT ACADEMY', margin + apexWidth + 2, 14);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184); // Slate-400
  doc.text('OFFICIAL INSTITUTIONAL STUDY HANDBOOK • RISK & QUANT PROTOCOL', margin, 20);
  doc.text(`DOCUMENT ID: APX-EDU-${module.id}-${Date.now().toString(36).toUpperCase()}`, margin, 25);

  // Badge Tier on Top Right
  doc.setFillColor(30, 41, 59);
  doc.roundedRect(pageWidth - margin - 50, 8, 50, 16, 2, 2, 'F');
  doc.setTextColor(16, 185, 129); // Emerald-500
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(module.id, pageWidth - margin - 45, 15);
  doc.setTextColor(203, 213, 225);
  doc.setFontSize(7.5);
  doc.text(`XP: +${module.xp} PTS`, pageWidth - margin - 45, 20);

  y = 42;

  // Module Title & Tier
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text(module.title, margin, y);
  y += 6;

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(6, 182, 212);
  doc.text(`${module.tierName.toUpperCase()} • DIFFICOLTÀ: ${module.difficulty.toUpperCase()} • TEMPO: ${module.duration}`, margin, y);
  y += 8;

  // Separator
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  // Executive Summary Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, pageWidth - (margin * 2), 22, 2, 2, 'FD');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text('EXECUTIVE SUMMARY & OBIETTIVI DIDATTICI:', margin + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  const summaryLines = doc.splitTextToSize(module.summary, pageWidth - (margin * 2) - 8);
  doc.text(summaryLines, margin + 4, y + 12);
  y += 28;

  // Theory Heading
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text(module.theory.heading, margin, y);
  y += 6;

  // Theory Paragraphs
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  module.theory.paragraphs.forEach((p) => {
    const lines = doc.splitTextToSize(p, pageWidth - (margin * 2));
    doc.text(lines, margin, y);
    y += (lines.length * 4.2) + 3;
  });

  y += 3;

  // Formula Box if present
  if (module.theory.formulaBox) {
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(6, 182, 212);
    doc.setLineWidth(0.8);
    doc.roundedRect(margin, y, pageWidth - (margin * 2), 22, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(8, 145, 178); // Cyan-600
    doc.text(`📐 ${module.theory.formulaBox.title.toUpperCase()}`, margin + 4, y + 6);

    doc.setFont('courier', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(module.theory.formulaBox.formula, margin + 4, y + 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(module.theory.formulaBox.explanation, margin + 4, y + 18);
    y += 28;
  }

  // Example Box
  doc.setFillColor(254, 252, 232); // Amber light
  doc.setDrawColor(245, 158, 11);
  doc.setLineWidth(0.8);
  doc.roundedRect(margin, y, pageWidth - (margin * 2), 24, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(180, 83, 9); // Amber-700
  doc.text('💡 CASO STUDIO OPERATIVO & CALCOLO REALE:', margin + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.text(`Scenario: ${module.theory.exampleBox.scenario}`, margin + 4, y + 11);
  doc.text(`Formula applicata: ${module.theory.exampleBox.calculation.replace(/\n/g, ' • ')}`, margin + 4, y + 16);
  
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(22, 101, 52); // Green
  doc.text(`Esito: ${module.theory.exampleBox.result}`, margin + 4, y + 21);
  y += 30;

  // Key Takeaways
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('PUNTI CHIAVE DA MEMORIZZARE PER L’OPERATIVITÀ:', margin, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  module.theory.keyTakeaways.forEach((k) => {
    doc.text(`✓  ${k}`, margin + 2, y);
    y += 4.5;
  });

  // Footer / Institutional Stamp
  doc.setFillColor(15, 23, 42);
  doc.rect(0, pageHeight - 14, pageWidth, 14, 'F');
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(7);
  doc.text('APEX TRADER QUANTITATIVE ACADEMY • CERTIFIED FINANCIAL EDUCATION ENGINE', margin, pageHeight - 6);
  doc.text(`Rilasciato a: ${userName || 'Trader Indipendente'} • ${new Date().toLocaleDateString('it-IT')}`, pageWidth - margin - 65, pageHeight - 6);

  // Save PDF
  doc.save(`Dispensa_ApexAcademy_${module.id}_${module.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
}

/**
 * Generates an official, gold-sealed Certificate of Completion PDF.
 */
export function generateMasterclassCertificatePdf(
  userName: string,
  completedDate: string,
  totalXp: number,
  hash: string
): void {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 12;

  // Outer Border & Background
  doc.setFillColor(10, 15, 30); // Deep Navy Black
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Gold Inner Frame
  doc.setDrawColor(217, 119, 6); // Amber Gold
  doc.setLineWidth(1.5);
  doc.rect(margin, margin, pageWidth - (margin * 2), pageHeight - (margin * 2));

  doc.setDrawColor(180, 83, 9);
  doc.setLineWidth(0.5);
  doc.rect(margin + 2.5, margin + 2.5, pageWidth - (margin * 2) - 5, pageHeight - (margin * 2) - 5);

  let y = 30;

  // Certificate Header
  doc.setTextColor(6, 182, 212); // Cyan-500
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('APEX QUANTITATIVE ACADEMY', pageWidth / 2, y, { align: 'center' });
  y += 7;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('INSTITUTIONAL RISK DESK & QUANTITATIVE RESEARCH DIVISION', pageWidth / 2, y, { align: 'center' });
  y += 14;

  // Certificate Title
  doc.setTextColor(245, 158, 11); // Gold
  doc.setFont('times', 'bolditalic');
  doc.setFontSize(26);
  doc.text('Certificato Ufficiale di Completamento', pageWidth / 2, y, { align: 'center' });
  y += 12;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  doc.setTextColor(226, 232, 240);
  doc.text('Si attesta formalmente che il Trader & Analista Finanziario', pageWidth / 2, y, { align: 'center' });
  y += 12;

  // Student Full Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255);
  doc.text(userName.toUpperCase(), pageWidth / 2, y, { align: 'center' });
  
  const nameWidth = doc.getTextWidth(userName.toUpperCase());
  doc.setDrawColor(245, 158, 11);
  doc.setLineWidth(0.8);
  doc.line((pageWidth / 2) - (nameWidth / 2) - 10, y + 3, (pageWidth / 2) + (nameWidth / 2) + 10, y + 3);
  y += 15;

  // Course Description
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(203, 213, 225);
  doc.text('ha superato con successo tutti i 12 Moduli Didattici e le Sfide Pratiche di Laboratorio,', pageWidth / 2, y, { align: 'center' });
  y += 5.5;
  doc.text('dimostrando padronanza in Microstruttura dei Mercati, Meccanica degli Ordini,', pageWidth / 2, y, { align: 'center' });
  y += 5.5;
  doc.text('Matematica della Leva, Position Sizing Istituzionale e Controllo del Rischio Patrimoniale.', pageWidth / 2, y, { align: 'center' });
  y += 14;

  // Rank Conferred Box
  doc.setFillColor(17, 24, 39);
  doc.setDrawColor(6, 182, 212);
  doc.setLineWidth(0.6);
  doc.roundedRect((pageWidth / 2) - 60, y, 120, 16, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(16, 185, 129); // Emerald
  doc.text(`GRADO CONFERITO: INSTITUTIONAL QUANT MASTER 👑`, pageWidth / 2, y + 7, { align: 'center' });
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(`XP TOTALI ACCREDITATI: ${totalXp} PTS • 100% COMPLETATO`, pageWidth / 2, y + 12, { align: 'center' });

  // Signatures and Cryptographic Seal
  const sigY = pageHeight - 34;

  // Left: Date
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(245, 158, 11);
  doc.text('DATA DI RILASCIO', margin + 20, sigY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text(completedDate, margin + 20, sigY + 5);

  // Right: Signature
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(245, 158, 11);
  doc.text('HEAD OF RISK & QUANT RESEARCH', pageWidth - margin - 75, sigY);
  doc.setFont('times', 'italic');
  doc.setFontSize(11);
  doc.setTextColor(6, 182, 212);
  doc.text('Apex Quantitative Division', pageWidth - margin - 75, sigY + 6);

  // Center: Cryptographic SHA-256 Hash
  doc.setFont('courier', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`CRYPTOGRAPHIC AUDIT VERIFICATION HASH: ${hash}`, pageWidth / 2, pageHeight - margin - 5, { align: 'center' });

  doc.save(`Certificato_ApexAcademy_${userName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
}
