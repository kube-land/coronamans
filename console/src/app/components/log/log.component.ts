import { Component, OnInit } from '@angular/core';

import {NgbModal, NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';

import { ApiService } from 'src/app/api.service';

import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-log',
  templateUrl: './log.component.html',
  styleUrls: ['./log.component.css']
})
export class LogComponent implements OnInit {

  employee: any
  error: any

  constructor(
    public activeModal: NgbActiveModal,
    private api: ApiService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
  
  }

  logInOut() {
    this.api
    .logEmployee$(this.employee.id)
    .subscribe(
      (res) => {
        if (res.status == 204) {
          return
        }
        if (res.body?.duration == 0) {
          this.toastr.success(`${res.body.name} is logged in`);
        } else {
          this.toastr.warning(`${res.body.name} is logged out`);
        }
      },
      error => {
        this.toastr.error(error.error.message || error.message);
      }
    );
    this.activeModal.close()
  }
}
