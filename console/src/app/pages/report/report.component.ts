import { Component, OnInit } from '@angular/core';
import {NgbDateStruct} from '@ng-bootstrap/ng-bootstrap';
import {NgbDate, NgbCalendar, NgbDateParserFormatter} from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from 'src/app/api.service';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css']
})
export class ReportComponent implements OnInit {

  ngOnInit() {}

  now = new Date()
  fromTime = {hour: this.now.getHours(), minute: this.now.getMinutes()};
  toTime = {hour: this.now.getHours(), minute: this.now.getMinutes()};
  fromDate: NgbDate | null;
  toDate: NgbDate | null;
  
  hoveredDate: NgbDate | null = null;

  reportType: string = "historical";

  constructor(
    private calendar: NgbCalendar,
    public formatter: NgbDateParserFormatter,
    private api: ApiService,
  ) {
    this.fromDate = calendar.getNext(calendar.getToday(), 'd', -1);
    this.toDate = calendar.getToday();
  }

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
    this.api
    .report$(
      new Date(this.fromDate.year, this.fromDate.month - 1, this.fromDate.day, this.fromTime.hour, this.fromTime.minute),
      new Date(this.toDate.year, this.toDate.month - 1, this.toDate.day, this.toTime.hour, this.toTime.minute),
      this.reportType
    )
    .subscribe(
      (res) => {
        console.log(res)
      },
      error => {
        console.log(error)
      }
    );

  }
}
