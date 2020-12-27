import { Component, OnInit, Inject } from '@angular/core';

import { AuthService } from '@auth0/auth0-angular';
import { DOCUMENT } from '@angular/common';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { NgbModal, NgbActiveModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

import { LogComponent } from '../log/log.component';

import { ApiService } from 'src/app/api.service';

@Component({
  selector: 'app-home-content',
  templateUrl: './home-content.component.html',
  styleUrls: ['./home-content.component.css']
})
export class HomeContentComponent implements OnInit {

  idForm = new FormGroup({
    id: new FormControl('', [
      Validators.required,
    ]),
  });

  constructor(
    public auth: AuthService,
    private modalService: NgbModal,
    private api: ApiService,
    @Inject(DOCUMENT) private doc: Document
  ) {}

  ngOnInit() {
  }

  onSubmit() {
    this.api
    .getEmployee$(this.idForm.value.id)
    .subscribe(
      (res) => (
        this.openModal(res, null)
      ),
      error => {
        this.openModal(null, error)
      }
    );
    
    this.idForm.reset()
  }

  openModal(employee: any, error: any) {
    const modal = this.modalService.open(LogComponent, { size: 'lg', windowClass: 'modal-adaptive' });
    modal.componentInstance.employee = employee
    modal.componentInstance.error = error
    //modal.result.then(() => {this.getUsers()})
  }
}
