import { Component, OnInit, ViewChild } from '@angular/core';
import {NgbDateStruct} from '@ng-bootstrap/ng-bootstrap';
import {NgbDate, NgbCalendar, NgbDateParserFormatter} from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from 'src/app/api.service';
import {Employee, ReportItem} from '../../api.model';
import { ToastrService } from 'ngx-toastr';
import { DatatableComponent } from "@swimlane/ngx-datatable";
import {parseDate} from '../../util'
import { ExportXLSXService } from '../../export-xlsx.service';


@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css']
})
export class ReportComponent implements OnInit {

  parseDate = parseDate

  now = new Date()
  fromTime = {hour: this.now.getHours(), minute: this.now.getMinutes()};
  toTime = {hour: this.now.getHours(), minute: this.now.getMinutes()};
  fromDate: NgbDate | null;
  toDate: NgbDate | null;
  
  hoveredDate: NgbDate | null = null;

  reportType: string = "historical";

  loading: boolean = false;
  report: ReportItem[] = [];
  tempReport: ReportItem[] = [];

  filter: string = "";

  // Table Messages
  messages = {
    emptyMessage: 'No data to display',
    totalMessage: 'total'
  }

  @ViewChild(DatatableComponent) table: DatatableComponent;

  constructor(
    private calendar: NgbCalendar,
    public formatter: NgbDateParserFormatter,
    private api: ApiService,
    private exportService: ExportXLSXService,
    private toastr: ToastrService,
  ) {
    this.fromDate = calendar.getNext(calendar.getToday(), 'd', -1);
    this.toDate = calendar.getToday();
  }

  ngOnInit() { }

  onDateSelection(date: NgbDate) {
    if (!this.fromDate && !this.toDate) {
      this.toDate = date
    } else if (this.fromDate && !this.toDate && date && (date.after(this.fromDate) || date == this.fromDate)) {
      this.toDate = date;
    } else {
      this.toDate = null;
      this.fromDate = date;
    }
  }

  isHovered(date: NgbDate) {
    return this.fromDate && !this.toDate && this.hoveredDate && date.after(this.fromDate) && date.before(this.hoveredDate);
  }

  isInside(date: NgbDate) {
    return this.toDate && date.after(this.fromDate) && date.before(this.toDate);
  }

  isRange(date: NgbDate) {
    return date.equals(this.fromDate) || (this.toDate && date.equals(this.toDate)) || this.isInside(date) || this.isHovered(date);
  }

  validateInput(currentValue: NgbDate | null, input: string): NgbDate | null {
    const parsed = this.formatter.parse(input);
    return parsed && this.calendar.isValid(NgbDate.from(parsed)) ? NgbDate.from(parsed) : currentValue;
  }

  generate() {
    this.loading = true
    this.api
    .report(
      new Date(this.fromDate.year, this.fromDate.month - 1, this.fromDate.day, this.fromTime.hour, this.fromTime.minute),
      new Date(this.toDate.year, this.toDate.month - 1, this.toDate.day, this.toTime.hour, this.toTime.minute),
      this.reportType
    ).subscribe(
      (res) => {
        this.tempReport = res
        this.filterAction(this.filter)
        this.loading = false
      },
      (error) => {
        this.toastr.error(error.error.message || error.message);
        this.loading = false
      }
    );
    this.tempReport = this.report
  }

  updateFilter(event) {
    const val = event.target.value.toLowerCase();
    this.filterAction(val)
    this.table.offset = 0;
  }

  filterAction(val) {
    const temp = this.tempReport.filter(function (d) {
      return d.name.toLowerCase().indexOf(val) !== -1 ||
        d.barcode.toString().indexOf(val) !== -1 ||
        d.title.toLowerCase().indexOf(val) !== -1;
    });

    // update the rows
    this.report = [...temp];
  }

  onSelect(event: any) {
    this.generate()
  }

  exportXLSX(): void {

    const data: Array<any> = [];

    if (this.reportType == 'historical') {
      const header = ['ID', 'Name', 'Title', 'Login', 'Logout', 'Duration' ];
      this.report.forEach(r => {
          data.push([
            r.barcode,
            r.name,
            r.title,
            parseDate(r.createdAt.toLocaleString()),
            parseDate(r.logout.toLocaleString()),
            r.duration,
          ]);
      })
    this.exportService.exportJsonToExcel('Historical Report', header, data, "historical_report");

    } else if (this.reportType == 'aggregated') {
      const header = ['ID', 'Name', 'Title', 'Total Duration', 'Shifts'];
      this.report.forEach(r => {
          data.push([
            r.barcode,
            r.name,
            r.title,
            r.duration,
            r.count,
          ]);
      })
      this.exportService.exportJsonToExcel('Aggregated Report', header, data, "aggregated_report");
    }
  }

}
