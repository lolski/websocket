import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from "@angular/forms";
import { RequestComponent } from './request/request.component';
import { ResponsesComponent } from './responses/responses.component';

@NgModule({
  declarations: [
    RequestComponent,
    ResponsesComponent
  ],
    exports: [
        RequestComponent,
        ResponsesComponent
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule
    ]
})
export class WidgetModule { }
