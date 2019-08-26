import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import carsData from '../cars';
import { SeTransService } from "../../../../src/lib/se-trans.service";

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
})
export class ProductListComponent implements OnInit {
  cars: CarInfo[] = carsData;
  inlineIndex = -1;

  constructor(
    private readonly router: Router,
    private readonly seTransService: SeTransService,
  ) { }

  ngOnInit() {
  }

  inlineDetails(index: number) {
    this.seTransService.beforeChange();
    this.inlineIndex = index;
  }

  closeInline() {
    this.seTransService.beforeChange();
    this.inlineIndex = -1;
  }
}

class CarInfo {
  name: string;
  price: number;
  image: string;
  id: number;
  description: string;
}
