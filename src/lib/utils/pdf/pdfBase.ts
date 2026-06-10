import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ─── Brand Colors ─────────────────────────────────────────────────────────────
export const PDF_COLORS = {
	primary: [220, 38, 38] as [number, number, number], // red-600
	primaryLight: [254, 226, 226] as [number, number, number], // red-100
	dark: [17, 24, 39] as [number, number, number], // gray-900
	medium: [107, 114, 128] as [number, number, number], // gray-500
	light: [243, 244, 246] as [number, number, number], // gray-100
	white: [255, 255, 255] as [number, number, number],
	success: [22, 163, 74] as [number, number, number], // green-600
	successLight: [220, 252, 231] as [number, number, number], // green-100
	warning: [234, 88, 12] as [number, number, number], // orange-600
	warningLight: [255, 237, 213] as [number, number, number], // orange-100
	info: [37, 99, 235] as [number, number, number], // blue-600
	infoLight: [219, 234, 254] as [number, number, number], // blue-100
	border: [229, 231, 235] as [number, number, number] // gray-200
};

export const PAGE_W = 210; // A4 portrait width mm
export const PAGE_H = 297; // A4 portrait height mm
export const MARGIN = 16; // left / right margin mm

// ─── Create Base Document ─────────────────────────────────────────────────────
export function createPdfDoc(): jsPDF {
	return new jsPDF({
		orientation: 'portrait',
		unit: 'mm',
		format: 'a4'
	});
}

// ─── Header ───────────────────────────────────────────────────────────────────
/**
 * Draws the branded report header and returns the Y position after the header.
 */
export function addPdfHeader(
	doc: jsPDF,
	options: {
		reportTitle: string;
		reportSubtitle?: string;
		desde?: string;
		hasta?: string;
		extraInfo?: string;
	}
): number {
	const { reportTitle, reportSubtitle, desde, hasta, extraInfo } = options;

	// Background strip
	doc.setFillColor(...PDF_COLORS.primary);
	doc.rect(0, 0, PAGE_W, 28, 'F');

	// Company name
	doc.setFont('helvetica', 'bold');
	doc.setFontSize(9);
	doc.setTextColor(...PDF_COLORS.white);
	doc.text('MILÉNUM', MARGIN, 10);

	// Report title
	doc.setFontSize(15);
	doc.text(reportTitle.toUpperCase(), MARGIN, 19);

	// Generation date – right aligned
	const now = new Date();
	const generated = `Generado: ${now.toLocaleDateString('es-BO', { day: '2-digit', month: 'long', year: 'numeric' })} ${now.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })}`;
	doc.setFontSize(7);
	doc.setFont('helvetica', 'normal');
	doc.text(generated, PAGE_W - MARGIN, 10, { align: 'right' });

	let y = 34;

	// Subtitle row
	if (reportSubtitle || desde || hasta || extraInfo) {
		doc.setFillColor(...PDF_COLORS.light);
		doc.rect(0, 28, PAGE_W, 12, 'F');

		doc.setFontSize(8);
		doc.setFont('helvetica', 'normal');
		doc.setTextColor(...PDF_COLORS.medium);

		const parts: string[] = [];
		if (reportSubtitle) parts.push(reportSubtitle);
		if (desde && hasta) parts.push(`Período: ${desde} → ${hasta}`);
		if (extraInfo) parts.push(extraInfo);

		doc.text(parts.join('   •   '), MARGIN, 35);
		y = 46;
	}

	return y;
}

// ─── Footer ───────────────────────────────────────────────────────────────────
/**
 * Adds page number footer to every page of the document.
 * Call this after all content has been added.
 */
export function addPdfFooter(doc: jsPDF): void {
	const totalPages = (
		doc as jsPDF & { internal: { getNumberOfPages: () => number } }
	).internal.getNumberOfPages();

	for (let i = 1; i <= totalPages; i++) {
		doc.setPage(i);
		doc.setFillColor(...PDF_COLORS.border);
		doc.rect(0, PAGE_H - 10, PAGE_W, 10, 'F');

		doc.setFontSize(7);
		doc.setFont('helvetica', 'normal');
		doc.setTextColor(...PDF_COLORS.medium);
		doc.text('© Milénum – Reporte generado automáticamente', MARGIN, PAGE_H - 4);
		doc.text(`Pág. ${i} / ${totalPages}`, PAGE_W - MARGIN, PAGE_H - 4, { align: 'right' });
	}
}

// ─── Section Title ────────────────────────────────────────────────────────────
/**
 * Draws a visual section heading. Returns next Y position.
 */
export function addSectionTitle(doc: jsPDF, y: number, title: string): number {
	// Left accent bar
	doc.setFillColor(...PDF_COLORS.primary);
	doc.rect(MARGIN, y, 3, 5.5, 'F');

	doc.setFont('helvetica', 'bold');
	doc.setFontSize(9);
	doc.setTextColor(...PDF_COLORS.dark);
	doc.text(title.toUpperCase(), MARGIN + 5, y + 4);

	// Separator line
	doc.setDrawColor(...PDF_COLORS.border);
	doc.setLineWidth(0.3);
	doc.line(MARGIN, y + 6.5, PAGE_W - MARGIN, y + 6.5);

	return y + 11;
}

// ─── KPI Summary Box ──────────────────────────────────────────────────────────
export interface KpiCell {
	label: string;
	value: string;
	color?: [number, number, number]; // bg color
	textColor?: [number, number, number];
}

/**
 * Renders a row of KPI boxes. Returns next Y position.
 * @param cells Array of cells – max 4 per row recommended for A4 portrait.
 */
export function addKpiRow(doc: jsPDF, y: number, cells: KpiCell[]): number {
	const available = PAGE_W - MARGIN * 2;
	const gap = 3;
	const cellW = (available - gap * (cells.length - 1)) / cells.length;
	const cellH = 18;

	cells.forEach((cell, i) => {
		const x = MARGIN + i * (cellW + gap);
		const bg = cell.color ?? PDF_COLORS.light;
		const fg = cell.textColor ?? PDF_COLORS.dark;

		doc.setFillColor(...bg);
		doc.roundedRect(x, y, cellW, cellH, 2, 2, 'F');

		doc.setFont('helvetica', 'bold');
		doc.setFontSize(13);
		doc.setTextColor(...fg);
		doc.text(cell.value, x + cellW / 2, y + 11, { align: 'center' });

		doc.setFont('helvetica', 'normal');
		doc.setFontSize(6.5);
		doc.setTextColor(...PDF_COLORS.medium);
		doc.text(cell.label.toUpperCase(), x + cellW / 2, y + 15.5, { align: 'center' });
	});

	return y + cellH + 6;
}

// ─── Table Helper ─────────────────────────────────────────────────────────────
export interface PdfTableOptions {
	head: string[][];
	body: (string | number)[][];
	startY: number;
	headColor?: [number, number, number];
}

/**
 * Renders a styled autoTable and returns the final Y position.
 */
export function addPdfTable(doc: jsPDF, opts: PdfTableOptions): number {
	const { head, body, startY, headColor = PDF_COLORS.primary } = opts;

	autoTable(doc, {
		head,
		body,
		startY,
		margin: { left: MARGIN, right: MARGIN },
		styles: {
			font: 'helvetica',
			fontSize: 8,
			cellPadding: { top: 3, bottom: 3, left: 4, right: 4 },
			lineColor: PDF_COLORS.border,
			lineWidth: 0.2,
			textColor: PDF_COLORS.dark
		},
		headStyles: {
			fillColor: headColor,
			textColor: PDF_COLORS.white,
			fontStyle: 'bold',
			fontSize: 7.5
		},
		alternateRowStyles: {
			fillColor: PDF_COLORS.light
		},
		tableLineColor: PDF_COLORS.border,
		tableLineWidth: 0.2
	});

	return (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
}

// ─── Page-break guard ─────────────────────────────────────────────────────────
/**
 * Returns a new Y if content would overflow the page, adding a new page.
 */
export function ensurePageSpace(doc: jsPDF, y: number, needed = 40): number {
	if (y + needed > PAGE_H - 16) {
		doc.addPage();
		return 14;
	}
	return y;
}
