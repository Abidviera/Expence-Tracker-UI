import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
@Injectable({
  providedIn: 'root',
})
export class ExportService {
  exportToExcel(data: any[], fileName: string): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);

    const workbook: XLSX.WorkBook = {
      Sheets: { data: worksheet },
      SheetNames: ['data'],
    };

    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    this.saveAsExcelFile(excelBuffer, fileName);
  }

  exportToCsv(data: any[], fileName: string): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);

    const csvOutput: string = XLSX.utils.sheet_to_csv(worksheet);

    this.saveAsFile(csvOutput, fileName, 'text/csv;charset=utf-8;');
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(data, `${fileName}_export_${new Date().getTime()}.xlsx`);
  }

  private saveAsFile(
    content: string,
    fileName: string,
    contentType: string
  ): void {
    const data: Blob = new Blob([content], { type: contentType });
    saveAs(data, `${fileName}_export_${new Date().getTime()}.csv`);
  }
}
