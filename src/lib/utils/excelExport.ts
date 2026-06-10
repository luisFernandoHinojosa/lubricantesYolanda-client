import * as XLSX from 'xlsx';

/**
 * Exports JSON data to an Excel file.
 * @param data Array of objects to export.
 * @param fileName Name of the file to download (without extension).
 * @param sheetName Name of the sheet in the Excel file.
 */
export function exportToExcel(
	data: unknown[],
	fileName: string = 'export',
	sheetName: string = 'Data'
) {
	const worksheet = XLSX.utils.json_to_sheet(data);
	const workbook = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

	// Generate buffer and download
	XLSX.writeFile(workbook, `${fileName}.xlsx`);
}
