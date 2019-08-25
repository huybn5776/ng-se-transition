import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { ProductListComponent } from './product-list/product-list.component';
import { ProductDetailsComponent } from './product-details/product-details.component';
import { RoutingModule } from './routing/routing.module';
import { SeTransDirective } from "../../../src/lib/se-trans.directive";
import { SeTransConfig, SeTransService } from "../../../src/lib/se-trans.service";

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
    ProductListComponent,
    ProductDetailsComponent,
    SeTransDirective,
  ],
  bootstrap: [AppComponent],
  providers: [
    SeTransService,
    {
      provide: SeTransConfig,
      useValue: {
        // transTime: 1000,
        transTime: 500,
        // transTime: 5000,
      }
    }
  ]
})
export class AppModule {}
