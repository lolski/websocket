import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {SessionManagerService, SessionStateService} from "./session/session.service";

@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  providers: [SessionManagerService, SessionStateService]
})
export class ServiceModule { }
