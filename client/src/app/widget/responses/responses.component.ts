import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-responses',
  templateUrl: './responses.component.html',
  styleUrls: ['./responses.component.scss']
})
export class ResponsesComponent {
    @Input() response: { request: string; response: string } | undefined = undefined;
    responses: { request: string; response: string }[] = [];

}
