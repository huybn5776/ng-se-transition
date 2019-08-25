import { NgModule } from '@angular/core';
import { RouterModule, Routes, RouteReuseStrategy } from '@angular/router';
import { ProductListComponent } from '../product-list/product-list.component';
import { ProductDetailsComponent } from '../product-details/product-details.component';
import { CustomRouteReuseStrategy } from './re-use-strategy';

const appRoutes: Routes = [
  {
    path: '',
    component: ProductListComponent,
    data: {
      reuse: true
    }
  },
  {
    path: 'product-detail/:id',
    component: ProductDetailsComponent,
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes, {
      scrollPositionRestoration: 'enabled',
    })
  ],
  exports: [
    RouterModule
  ],
  providers: [
    {
      provide: RouteReuseStrategy,
      useClass: CustomRouteReuseStrategy
    }
  ]
})
export class RoutingModule {}

