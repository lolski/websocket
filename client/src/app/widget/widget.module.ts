import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RequestComponent } from './request/request.component';
import { ResponsesComponent } from './responses/responses.component';

@NgModule({
  declarations: [
    RequestComponent,
    ResponsesComponent
  ],
  exports: [
    RequestComponent
  ],
  imports: [
    CommonModule
  ]
})
export class WidgetModule { }
