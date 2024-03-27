import { Injectable } from "@angular/core";
import { dns } from "../global.config";

declare var require: any;
var SockJs = require("sockjs-client");
//var Stomp = require("stompjs");

@Injectable()
export class WebSocketService {

  // Open connection with the back-end socket
 /* public connect() {
    let socket = new SockJs(dns + `socket`);

    let stompClient = Stomp.over(socket);


    return stompClient;
  }*/
}
