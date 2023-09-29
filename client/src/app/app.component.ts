import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  // receive channel
  // send channel

  receiveRequest(value: string): void {
    console.log("event: " + value)
  }
}
