import { Component, OnInit, Inject } from '@angular/core';

import { AuthService } from '@auth0/auth0-angular';
import { DOCUMENT } from '@angular/common';
import { FormGroup, FormControl } from '@angular/forms';

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
    @Inject(DOCUMENT) private doc: Document
  ) {}

  ngOnInit() {
  }

  onSubmit() {
    console.warn(this.idForm.value);
    this.idForm.reset()
  }

}
