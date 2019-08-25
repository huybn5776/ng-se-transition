import { Component, ElementRef, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import carsData from '../cars';
import { SeTransDirective } from "../../../../src/lib/se-trans.directive";

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss']
})
export class ProductDetailsComponent {

  @ViewChild('carPhoto', {static: true}) carPhoto: ElementRef;
  @ViewChild(SeTransDirective, {static: true}) seTransDirective: SeTransDirective;

  get car() {
    return carsData
      .find(car => (car as any).id === +this.route.snapshot.params['id']);
  }

  constructor(
    private location: Location,
    private route: ActivatedRoute,
  ) { }

  back() {
    this.location.back();
  }

}
