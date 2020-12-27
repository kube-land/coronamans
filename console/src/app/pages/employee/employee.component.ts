import { Component, OnInit, Inject } from '@angular/core';
import { ApiService } from 'src/app/api.service';

import { AuthService } from '@auth0/auth0-angular';
import { DOCUMENT } from '@angular/common';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { NgbModal, NgbActiveModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

import { EmployeeAddComponent } from '../../components/employee-add/employee-add.component';

@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.css'],
})
export class EmployeeComponent {
  responseJson: string;

  constructor(
    public auth: AuthService,
    private api: ApiService,
    private modalService: NgbModal,
    @Inject(DOCUMENT) private doc: Document
  ) {}

  pingApi() {
    this.api
      .ping$()
      .subscribe(
        (res) => (this.responseJson = JSON.stringify(res, null, 2).trim())
      );
  }

  addEmployee() {
    const modal = this.modalService.open(EmployeeAddComponent, { size: 'md', windowClass: 'modal-adaptive' });
  }
}
