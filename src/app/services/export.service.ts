import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
@Injectable({
  providedIn: 'root',
})
export class ExportService {
   private readonly DEFAULT_DATE_FORMAT = 'yyyy-MM-dd';
  private readonly EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
  private readonly CSV_TYPE = 'text/csv;charset=utf-8;';

  exportToExcel(data: any[], fileName: string, sheetName = 'Data'): void {
    try {
      const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
      const workbook: XLSX.WorkBook = {
        Sheets: { [sheetName]: worksheet },
        SheetNames: [sheetName],
      };
      
      const excelBuffer: any = XLSX.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
      });
      
      this.saveFile(excelBuffer, fileName, this.EXCEL_TYPE, 'xlsx');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      throw new Error('Failed to export data to Excel');
    }
  }

  exportToCsv(data: any[], fileName: string): void {
    try {
      const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
      const csvOutput: string = XLSX.utils.sheet_to_csv(worksheet);
      this.saveFile(csvOutput, fileName, this.CSV_TYPE, 'csv');
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      throw new Error('Failed to export data to CSV');
    }
  }

  private saveFile(content: any, fileName: string, contentType: string, extension: string): void {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const blob = new Blob([content], { type: contentType });
    saveAs(blob, `${fileName}_export_${timestamp}.${extension}`);
  }
}
