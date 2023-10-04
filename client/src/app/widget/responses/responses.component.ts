import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {ConnectionService} from "../../service/connection.service";

@Component({
  selector: 'app-responses',
  templateUrl: './responses.component.html',
  styleUrls: ['./responses.component.scss']
})
export class ResponsesComponent implements OnChanges {
    @Input() response: { request: string; response: string } | undefined;

    responses: { request: string; response: string }[] = [];

    constructor(private connSvc: ConnectionService) {

    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['response']) {
            let newResponse: { request: string; response: string } | undefined = changes['response']['currentValue']
            if (newResponse) {
                this.responseReceived(newResponse)
            }
        }
    }

    responseReceived(response: { request: string; response: string }): void {
        this.responses.push(response)
    }
}
