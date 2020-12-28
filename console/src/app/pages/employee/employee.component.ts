import { Component, OnInit, Inject } from '@angular/core';
import { ApiService } from 'src/app/api.service';

import { AuthService } from '@auth0/auth0-angular';
import { DOCUMENT } from '@angular/common';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { EmployeeAddComponent } from '../../components/employee-add/employee-add.component';

import {Employee} from '../../api.model';


@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.css'],
})
export class EmployeeComponent {

  employees: Employee[]

  constructor(
    public auth: AuthService,
    private api: ApiService,
    private modalService: NgbModal,
    @Inject(DOCUMENT) private doc: Document
  ) {

    this.api
    .getEmployees$()
    .subscribe(
      (res) => {
        console.log(res)
        this.employees = res
      },
      error => {
        console.log(error)
      }
    );

  }

  addEmployee() {
    const modal = this.modalService.open(EmployeeAddComponent, { size: 'md', windowClass: 'modal-adaptive' });
  }

  updateFilter() {}
}
