import { jsPDF } from 'jspdf';

/**
 * Exports a mathematical calculation to a styled PDF file.
 * @param {Object} operation - The operation details
 * @param {string} operation.tipo - 'derivada', 'integral', etc.
 * @param {string} operation.funcion - The formula
 * @param {string} operation.resultado - The calculation result
 * @param {Array<string>|string} operation.pasos - Steps array or string
 * @param {string} [operation.fecha] - Optional date of the operation
 */
export const exportToPDF = (operation) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageHeight = 297; // A4 height in mm
  const pageWidth = 210; // A4 width in mm
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin; // 170 mm
  let y = 25; // Current cursor y position

  // Helper to check page boundaries and add page if needed
  const checkPageBreak = (neededHeight) => {
    if (y + neededHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
      drawHeaderFooter();
    }
  };

  // Helper to draw clean header and footer
  const drawHeaderFooter = () => {
    // Header line and title
    doc.setDrawColor(59, 130, 246); // Blue accent (#3b82f6)
    doc.setLineWidth(0.5);
    doc.line(margin, 12, pageWidth - margin, 12);
    
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text('CALCMASTER AI - REPORTE MATEMÁTICO', margin, 9);
    doc.text(new Date().toLocaleDateString(), pageWidth - margin - 20, 9);

    // Footer
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
    doc.text('Página ' + doc.internal.getNumberOfPages(), pageWidth / 2, pageHeight - 8, { align: 'center' });
  };

  // 1. Initial Page Header
  drawHeaderFooter();

  // Title
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(30, 30, 45); // Dark slate
  const titleText = 'Reporte de Solución Matemática';
  doc.text(titleText, margin, y);
  y += 12;

  // Subtitle
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100);
  const dateStr = operation.fecha
    ? new Date(operation.fecha).toLocaleString()
    : new Date().toLocaleString();
  doc.text(`Generado por CalcMaster AI el ${dateStr}`, margin, y);
  y += 10;

  // Horizontal divider
  doc.setDrawColor(220, 220, 230);
  doc.setLineWidth(0.2);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  // 2. Summary of operation details
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(30, 30, 45);
  doc.text('Detalles del Problema', margin, y);
  y += 7;

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(60);

  const tipoLabel = operation.tipo.charAt(0).toUpperCase() + operation.tipo.slice(1);
  doc.text(`Tipo de Operación: `, margin, y);
  doc.setFont('Helvetica', 'bold');
  doc.text(tipoLabel, margin + 35, y);
  y += 6;

  doc.setFont('Helvetica', 'normal');
  doc.text(`Función Ingresada: `, margin, y);
  doc.setFont('Helvetica', 'bold');
  doc.text(`f(x) = ${operation.funcion}`, margin + 35, y);
  y += 10;

  // 3. Highlighted Result Box
  checkPageBreak(30);
  doc.setFillColor(243, 244, 246); // Light gray
  doc.setDrawColor(168, 85, 247); // Purple accent border (#a855f7)
  doc.setLineWidth(0.8);
  doc.roundedRect(margin, y, contentWidth, 20, 2, 2, 'FD');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(168, 85, 247);
  doc.text('RESULTADO FINAL:', margin + 6, y + 7);

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42); // Very dark slate
  doc.text(operation.resultado || 'N/A', margin + 6, y + 14);
  y += 28;

  // 4. Step-by-Step Resolution
  checkPageBreak(20);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(30, 30, 45);
  doc.text('Paso a Paso de la Resolución', margin, y);
  y += 8;

  let stepsArray = [];
  if (Array.isArray(operation.pasos)) {
    stepsArray = operation.pasos;
  } else if (typeof operation.pasos === 'string') {
    try {
      stepsArray = JSON.parse(operation.pasos);
      if (!Array.isArray(stepsArray)) {
        stepsArray = [operation.pasos];
      }
    } catch (e) {
      stepsArray = operation.pasos.split('\n').filter(s => s.trim() !== '');
    }
  }

  if (stepsArray.length === 0) {
    doc.setFont('Helvetica', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('No hay pasos detallados disponibles para esta operación.', margin, y);
    y += 8;
  } else {
    stepsArray.forEach((step, idx) => {
      // Clean markdown tags (like **, `) to make it look nice in plain PDF text
      const cleanStep = step
        .replace(/\*\*(.*?)\*\*/g, '$1') // remove **bold**
        .replace(/`(.*?)`/g, '$1')       // remove `code`
        .replace(/\$\$(.*?)\$\$/g, '$1') // remove $$math$$
        .replace(/\$(.*?)\$/g, '$1')     // remove $math$
        .replace(/\\,/g, ' ')            // remove LaTeX spacing
        .replace(/\\int/g, 'Integral')   // map LaTeX symbols
        .replace(/\\frac\{(.*?)\}\{(.*?)\}/g, '$1/$2')
        .replace(/\\text\{(.*?)\}/g, '$1');

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(50);

      // Split text to fit inside the margins
      const lines = doc.splitTextToSize(cleanStep, contentWidth);
      const stepHeight = lines.length * 5 + 4; // Approx height needed

      checkPageBreak(stepHeight);

      // Render step index/bullet point
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(59, 130, 246);
      doc.text(`[Paso ${idx + 1}]`, margin, y);
      y += 5;

      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(60);
      lines.forEach((line) => {
        checkPageBreak(5);
        doc.text(line, margin + 4, y);
        y += 5;
      });
      y += 3; // spacing between steps
    });
  }

  // Save the PDF
  const cleanName = operation.tipo.replace(/\s+/g, '_');
  doc.save(`calcmaster_${cleanName}_${Date.now()}.pdf`);
};
