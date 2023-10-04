import {Component, EventEmitter, Output} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {ConnectionService} from "../../service/connection.service";

@Component({
  selector: 'app-request',
  templateUrl: './request.component.html',
  styleUrls: ['./request.component.scss']
})
export class RequestComponent {

  @Output() submitted: EventEmitter<string> = new EventEmitter();

  form: FormGroup;

  constructor(private formBuilder: FormBuilder, private connSvc: ConnectionService) {
    this.form = formBuilder.group({
      text: ['']
    });
  }

  formSubmitted(): void {
    this.submitted.emit(this.form.value.text)
  }
}
