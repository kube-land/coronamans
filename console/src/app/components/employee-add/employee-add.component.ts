import { Component, OnInit } from '@angular/core';

import {NgbModal, NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';

import { FormGroup, FormControl, Validators } from '@angular/forms';


import { ApiService } from 'src/app/api.service';

import { ToastrService } from 'ngx-toastr';

import {Employee} from '../../api.model';

import * as config from '../../../../auth_config.json';


@Component({
  selector: 'app-employee-add',
  templateUrl: './employee-add.component.html',
  styleUrls: ['./employee-add.component.css']
})
export class EmployeeAddComponent implements OnInit {

  loading = false;

  employeeAddForm = new FormGroup({
    name: new FormControl('', [
      Validators.required,
    ]),
    title: new FormControl('', [
      Validators.required,
    ]),
  });

  createdEmployee: Employee;
  createdEmployeeError: any;

  barcodeImage: string;


  constructor(
    public activeModal: NgbActiveModal,
    private api: ApiService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
  }
  
  addEmployee(employee: Employee) {
    this.api
    .createEmployee$(employee)
    .subscribe(
      (res) => {
        this.createdEmployee = res
        this.barcodeImage = `${config.apiUri}/barcode/${res.id}.png`
        this.loading = false
      },
      error => {
        this.createdEmployeeError = error.error.message || error.message
        this.loading = false
      }
    );
  }

  onSubmit() {
    this.createdEmployeeError = null
    this.loading = true
    var employee: Employee = this.employeeAddForm.value
    this.addEmployee(employee)
  }

  totalText(id: string, name: string) {
    let total = `${id} ${name}`
    if (total.length > 41) {
      total = total.slice(0, 38) + "..."
    }
    return total
  }
}
