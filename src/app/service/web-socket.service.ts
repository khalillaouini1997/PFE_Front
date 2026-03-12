import { Injectable, inject } from '@angular/core';
import SockJS from 'sockjs-client';
import { Client, IMessage } from '@stomp/stompjs';
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
            webSocketFactory: () => new SockJS(this.getSocketUrl()),
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

    private getSocketUrl(): string {
        const baseUrl = environment.apiBaseUrl;
        // SockJS expects the base HTTP/HTTPS URL
        // Append 'socket' as per previous working configuration
        return `${baseUrl}socket`;
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
