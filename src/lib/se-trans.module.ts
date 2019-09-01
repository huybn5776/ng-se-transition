import { NgModule } from '@angular/core';

import { SeTransDirective } from './se-trans.directive';

@NgModule({
  declarations: [
    SeTransDirective
  ],
  exports: [
    SeTransDirective,
  ]
})
export class SeTransModule {
}
