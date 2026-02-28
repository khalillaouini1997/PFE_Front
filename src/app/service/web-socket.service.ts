import { Injectable, inject } from '@angular/core';
import { Client, IMessage, StompConfig } from '@stomp/stompjs';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class WebSocketService {
    private client: Client;
    private notificationSubject = new BehaviorSubject<any>(null);

    constructor() {
        this.client = new Client({
            brokerURL: this.getBrokerUrl(),
            connectHeaders: {},
            debug: (str) => {
                console.log(new Date(), str);
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        this.client.onConnect = (frame) => {
            console.log('Connected to WebSocket');
            this.subscribeToNotifications();
        };

        this.client.onStompError = (frame) => {
            console.error('Broker reported error: ' + frame.headers['message']);
            console.error('Additional details: ' + frame.body);
        };

        this.client.activate();
    }

    private getBrokerUrl(): string {
        const baseUrl = environment.apiBaseUrl;
        // Convert http/https to ws/wss
        const wsUrl = baseUrl.replace(/^http/, 'ws');
        // Spring exposes the WebSocket endpoint at /socket/websocket when using SockJS
        return `${wsUrl}socket/websocket`;
    }

    private subscribeToNotifications() {
        this.client.subscribe('/topic/notification', (message: IMessage) => {
            if (message.body) {
                this.notificationSubject.next(JSON.parse(message.body));
            }
        });
    }

    getNotifications(): Observable<any> {
        return this.notificationSubject.asObservable();
    }

    // Helper to send messages if needed in future
    sendMessage(destination: string, body: any) {
        this.client.publish({ destination, body: JSON.stringify(body) });
    }
}
