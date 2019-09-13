import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import carsData from '../cars';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss']
})
export class ProductDetailsComponent {

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
