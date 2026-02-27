import { Injectable } from "@angular/core";
import { environment } from '../../environments/environment';

declare var require: any;
var SockJs = require("sockjs-client");
var Stomp = require("stompjs");

@Injectable()
export class WebSocketService {

  // Open connection with the back-end socket
 public connect() {
    let socket = new SockJs(environment.apiBaseUrl + `socket`);

    let stompClient = Stomp.over(socket);


    return stompClient;
  }
}
