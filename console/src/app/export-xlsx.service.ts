import { Injectable } from '@angular/core';
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';

declare const ExcelJS: any;

const EXCEL_EXTENSION = '.xlsx';

@Injectable({
  providedIn: 'root'
})
export class ExportXLSXService {
  constructor() {
  }
  exportJsonToExcel(title: string, header: Array<string>, data: Array<any>, fileName: string) {
    
    //Create workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    let worksheet = workbook.addWorksheet('Report', {views: [ {state: 'frozen', ySplit: 1} ] } );
    worksheet.fitwidth = true
    let headerRow = worksheet.addRow(header);
    
    // Cell Style : Fill and Border
    headerRow.eachCell((cell, number) => {
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
    })
    // worksheet.addRows(data);
    data.forEach(d => (worksheet.addRow(d)));
    worksheet.addRow([]);

    //Generate Excel File with given name
    workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      fs.saveAs(blob, `${fileName}${EXCEL_EXTENSION}`);
    })
  }
}