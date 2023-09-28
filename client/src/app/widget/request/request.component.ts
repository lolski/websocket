import { Component } from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';

@Component({
  selector: 'app-request',
  templateUrl: './request.component.html',
  styleUrls: ['./request.component.scss']
})
export class RequestComponent {

  requestSubmission: FormGroup;

  constructor(private formBuilder: FormBuilder) {
    this.requestSubmission = formBuilder.group({
      request: ['initial value']
    });
  }

  onRequestSubmitted(): void {
    console.log("submitting a new request '" + this.requestSubmission.value.request + "'")
  }
}
