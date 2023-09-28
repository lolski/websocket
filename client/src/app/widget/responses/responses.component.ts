import { Component } from '@angular/core';

@Component({
  selector: 'app-responses',
  templateUrl: './responses.component.html',
  styleUrls: ['./responses.component.scss']
})
export class ResponsesComponent {
    responses = [
        { request: "hi1", response: "ho2" },
        { request: "hi2", response: "ho2" }
    ]
}