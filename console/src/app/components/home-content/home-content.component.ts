import { Component, OnInit, Inject } from '@angular/core';

import { AuthService } from '@auth0/auth0-angular';
import { DOCUMENT } from '@angular/common';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { NgbModal, NgbActiveModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

import { LogComponent } from '../log/log.component';

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
    @Inject(DOCUMENT) private doc: Document
  ) {}

  ngOnInit() {
  }

  onSubmit() {
    const modal = this.modalService.open(LogComponent, { size: 'lg', windowClass: 'modal-adaptive' });
    modal.componentInstance.employeeID = this.idForm.value.id
    this.idForm.reset()
  }
}
