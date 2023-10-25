import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ChatroomComponent } from "./page/chatroom/chatroom.component";
import { LoginComponent } from "./page/login/login.component";

const routes: Routes = [
  { path: '', component: ChatroomComponent },
  { path: 'login', component: LoginComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
