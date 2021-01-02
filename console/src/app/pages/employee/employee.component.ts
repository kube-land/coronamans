import { Component, OnInit, Inject } from '@angular/core';
import { ApiService } from 'src/app/api.service';

import { AuthService } from '@auth0/auth0-angular';
import { DOCUMENT } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { EmployeeAddComponent } from '../../components/employee-add/employee-add.component';

import {Employee} from '../../api.model';

import {parseDate} from '../../util'

import { ConfirmComponent } from '../../components/confirm/confirm.component';

@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.css'],
})
export class EmployeeComponent {

  parseDate = parseDate

  employeesMatched: Employee[]
  employees: Employee[]

  loading: boolean = true

  loggedInEmployees: number = 0;
  totalEmployees: number = 0;

  constructor(
    public auth: AuthService,
    private api: ApiService,
    private modalService: NgbModal,
    private toastr: ToastrService,
    @Inject(DOCUMENT) private doc: Document
  ) {
    this.getEmployee()
  }

  getEmployee() {
    this.api
    .getEmployees$()
    .subscribe(
      (res) => {
        this.employeesMatched = res
        this.totalEmployees = res.length;
        this.employees = [...res];

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
        this.toastr.error(error.error.message || error.message);
        this.loading = false
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
    const temp = this.employees.filter(function (d) {
      return d.name.toLowerCase().indexOf(val) !== -1 ||
        d.id.toString().indexOf(val) !== -1 ||
        d.title.toLowerCase().indexOf(val) !== -1;
    });

    // update the rows
    this.employeesMatched = temp;
  }

  deleteEmployee(id: string, name: string)  {
    const modal = this.modalService.open(ConfirmComponent, { size: 'md', windowClass: 'modal-adaptive' });
    modal.componentInstance.title = "Delete Employee"
    modal.componentInstance.message = `Are you sure that you want to delete employee: '${name}'?`
    modal.result.then((modalRes) => {
      if (modalRes === "yes") {
        this.api.deleteEmployee$(id).subscribe(
          (res) => {
            this.toastr.success(`Employee '${name}' has been deleted!`);
            this.getEmployee()
          },
          error => {
            this.toastr.error(error.error.message || error.message);
        });
      }
    })
  }
}
