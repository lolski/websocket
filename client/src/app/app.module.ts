import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { WidgetModule } from "./widget/widget.module";

@NgModule({
  declarations: [
      AppComponent,
  ],
  imports: [
      AppRoutingModule,
      BrowserModule,
      WidgetModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
