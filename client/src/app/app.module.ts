import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ChatroomComponent } from './page/chatroom/chatroom.component';
import { LoginComponent } from './page/login/login.component';
import { ServiceModule } from "./service/service.module";
import { WidgetModule } from "./widget/widget.module";
import { SettingComponent } from './page/setting/setting.component';

@NgModule({
  declarations: [
      AppComponent,
      ChatroomComponent,
      LoginComponent,
      SettingComponent,
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
