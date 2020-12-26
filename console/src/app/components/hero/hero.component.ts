import { Component, OnInit, Inject } from '@angular/core';

import { AuthService } from '@auth0/auth0-angular';
import { DOCUMENT } from '@angular/common';
import { FormGroup, FormControl } from '@angular/forms';

import { ApiService } from 'src/app/api.service';

@Component({
  selector: 'app-hero',
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.css']
})
export class HeroComponent implements OnInit {

  idForm = new FormGroup({
    id: new FormControl(''),
  });

  constructor(
    public auth: AuthService,
    private api: ApiService,
    @Inject(DOCUMENT) private doc: Document
  ) {}

  ngOnInit() {
  }

  onSubmit() {
    console.warn(this.idForm.value);

    this.api
    .getEmployee$(this.idForm.value.id)
    .subscribe(
      (res) => (console.log(res))
    );

    this.idForm.reset()
  }

}
