import { NgModule } from '@angular/core';
import { RouterModule, Routes, RouteReuseStrategy } from '@angular/router';

import { HomeComponent } from '../home/home.component';
import { ProductListComponent } from '../product-list/product-list.component';
import { ProductDetailsComponent } from '../product-details/product-details.component';
import { CustomRouteReuseStrategy } from './re-use-strategy';
import { PhotoGalleryComponent } from '../photo-gallery/photo-gallery.component';

const appRoutes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'cars',
    component: ProductListComponent,
    data: {reuse: true}
  },
  {
    path: 'cars/detail/:id',
    component: ProductDetailsComponent,
  },
  {
    path: 'gallery',
    component: PhotoGalleryComponent,
  },
];

// noinspection AngularInvalidImportedOrDeclaredSymbol
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

