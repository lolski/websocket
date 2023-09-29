import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  response: { request: string; response: string } | undefined

  receiveRequest(value: string): void {
    this.response = { request: value, response: "response to '" + value + "'" }
  }
}
