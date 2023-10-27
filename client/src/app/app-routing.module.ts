import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ChatroomComponent } from "./page/chatroom/chatroom.component";
import { LoginComponent } from "./page/login/login.component";
import { SettingComponent } from "./page/setting/setting.component";

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', component: ChatroomComponent },
  { path: 'setting', component: SettingComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
