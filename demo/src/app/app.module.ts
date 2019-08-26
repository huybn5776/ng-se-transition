import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { RoutingModule } from './routing/routing.module';
import { HomeComponent } from './home/home.component';
import { ProductListComponent } from './product-list/product-list.component';
import { ProductDetailsComponent } from './product-details/product-details.component';
import { SeTransDirective } from "../../../src/lib/se-trans.directive";
import { SeTransConfig, SeTransService } from "../../../src/lib/se-trans.service";
import { PhotoGalleryComponent } from "./photo-gallery/photo-gallery.component";
import { LifecycleHookDirective } from "./directives/lifecycle-hook.directive";

// noinspection AngularInvalidImportedOrDeclaredSymbol
@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    BrowserAnimationsModule,
    RoutingModule
  ],
  declarations: [
    AppComponent,
    HomeComponent,
    ProductListComponent,
    ProductDetailsComponent,
    PhotoGalleryComponent,
    LifecycleHookDirective,
    SeTransDirective,
  ],
  bootstrap: [AppComponent],
  providers: [
    SeTransService,
    {
      provide: SeTransConfig,
      useValue: {
        transTime: 500,
      }
    }
  ]
})
export class AppModule {}
