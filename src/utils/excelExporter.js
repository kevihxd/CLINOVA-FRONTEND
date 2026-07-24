import * as XLSX from 'xlsx';

/**
 * Reusable utility to generate styled, professional Excel spreadsheets for Clinova IPS reports.
 */
export const exportReportToExcel = ({
    title = 'INFORME INSTITUCIONAL',
    subtitle = 'Clinova IPS - Sistema de Gestión Documental y Talento Humano',
    sheetName = 'Reporte',
    filename = 'Reporte_Clinova.xlsx',
    headers = [],
    rows = [],
    themeColor = '1E3A8A' // Default Navy Blue
}) => {
    // 1. Construct sheet data with Title banner, metadata, empty row, headers, and data
    const now = new Date();
    const fechaGeneracion = now.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    const sheetData = [
        [title.toUpperCase()],
        [subtitle],
        [`Fecha de Generación: ${fechaGeneracion}`, '', `Total Registros: ${rows.length}`],
        [], // Empty spacing row
        headers
    ];

    // Append data rows
    rows.forEach(row => {
        sheetData.push(row);
    });

    // 2. Create workbook & worksheet
    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    // 3. Set column auto-widths based on content
    const colWidths = headers.map((header, colIndex) => {
        let maxLen = String(header || '').length;
        sheetData.forEach(row => {
            if (row[colIndex] !== undefined && row[colIndex] !== null) {
                const cellLen = String(row[colIndex]).length;
                if (cellLen > maxLen) maxLen = cellLen;
            }
        });
        return { wch: Math.min(Math.max(maxLen + 4, 12), 60) };
    });
    ws['!cols'] = colWidths;

    // 4. Set row merges for Title banner
    ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: Math.max(headers.length - 1, 3) } }, // Title
        { s: { r: 1, c: 0 }, e: { r: 1, c: Math.max(headers.length - 1, 3) } }  // Subtitle
    ];

    // 5. Save file
    XLSX.writeFile(wb, filename);
};
