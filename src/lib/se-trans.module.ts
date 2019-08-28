import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { RoutingModule } from "../../demo/src/app/routing/routing.module";
import { SeTransDirective } from "./se-trans.directive";

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    RoutingModule
  ],
  declarations: [
    SeTransDirective
  ],
  exports: [
    SeTransDirective,
  ]
})
export class SeTransModule {
}
