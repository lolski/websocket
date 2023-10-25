import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ServiceModule } from "./service/service.module";
import { WidgetModule } from "./widget/widget.module";

@NgModule({
  declarations: [
      AppComponent,
  ],
  imports: [
      AppRoutingModule,
      BrowserModule,
      ServiceModule,
      WidgetModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
