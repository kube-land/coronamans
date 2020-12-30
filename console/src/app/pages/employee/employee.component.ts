import { Component, OnInit, Inject } from '@angular/core';
import { ApiService } from 'src/app/api.service';

import { AuthService } from '@auth0/auth0-angular';
import { DOCUMENT } from '@angular/common';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { EmployeeAddComponent } from '../../components/employee-add/employee-add.component';

import {Employee} from '../../api.model';

import {parseDate} from '../../util'


@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.css'],
})
export class EmployeeComponent {

  parseDate = parseDate

  employees: Employee[]
  employeesTemp: Employee[]

  loading: boolean = true

  loggedInEmployees: number = 0;
  totalEmployees: number = 0;

  constructor(
    public auth: AuthService,
    private api: ApiService,
    private modalService: NgbModal,
    @Inject(DOCUMENT) private doc: Document
  ) {

    this.getEmployee()

  }

  getEmployee() {
    this.api
    .getEmployees$()
    .subscribe(
      (res) => {
        this.employees = res
        this.totalEmployees = res.length;
        this.employeesTemp = [...res];

        let logged = 0 
        for (let employee of res) {
          if (employee.loggedIn == true) {
            logged++
          }
        }
        this.loggedInEmployees = logged
        this.loading = false
      },
      error => {
        console.log(error)
      }
    );
  }

  addEmployee() {
    const modal = this.modalService.open(EmployeeAddComponent, { size: 'md', windowClass: 'modal-adaptive' });
    modal.result.then(() => (this.getEmployee()))
  }

  detailsEmployee(employee: Employee) {
    const modal = this.modalService.open(EmployeeAddComponent, { size: 'md', windowClass: 'modal-adaptive' });
    modal.componentInstance.createdEmployee = employee
  }

  updateFilter(event) {
    const val = event.target.value.toLowerCase();
    const temp = this.employeesTemp.filter(function (d) {
      return d.name.toLowerCase().indexOf(val) !== -1 ||
        d.id.toString().indexOf(val) !== -1 ||
        d.title.toLowerCase().indexOf(val) !== -1;
    });

    // update the rows
    this.employees = temp;
  }
}
