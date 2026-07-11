import { Injectable } from '@angular/core';
import SockJS from 'sockjs-client';
import { Client, IMessage } from '@stomp/stompjs';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { REALTIME_CONSTANTS } from '../shared/constants/app.constants';
import { RealTime } from '../data/data';

@Injectable({
    providedIn: 'root'
})
export class WebSocketService {
    private readonly client: Client;
    private readonly notificationSubject = new BehaviorSubject<any>(null);
    private readonly vehiclePositionSubject = new BehaviorSubject<RealTime[]>([]);
    private readonly connectionStatusSubject = new BehaviorSubject<boolean>(false);

    constructor() {
        this.client = new Client({
            webSocketFactory: () => new SockJS(this.getSocketUrl()),
            connectHeaders: {},
            debug: (_str) => {
            },
            reconnectDelay: REALTIME_CONSTANTS.WEBSOCKET_RECONNECT_DELAY,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        this.client.onConnect = (_frame) => {
            this.connectionStatusSubject.next(true);
            this.subscribeToNotifications();
            this.subscribeToVehiclePositions();
        };

        this.client.onStompError = (_frame) => {
        };

        this.client.onDisconnect = () => {
            this.connectionStatusSubject.next(false);
        };
    }

    connect() {
        if (!this.client.active) {
            this.client.activate();
        }
    }

    disconnect() {
        if (this.client.active) {
            this.client.deactivate();
        }
    }

    private getSocketUrl(): string {
        // WebSocket endpoint is not under /api/v1 prefix
        // Use the base URL without /api/v1 for WebSocket connections
        const baseUrl = environment.apiBaseUrl.replace('/api/v1/', '');
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

    private subscribeToVehiclePositions() {
        this.client.subscribe('/topic/vehicle-positions', (message: IMessage) => {
            if (message.body) {
                try {
                    const positions = JSON.parse(message.body) as RealTime[];
                    this.vehiclePositionSubject.next(positions);
                } catch (error) {
                    console.warn('Failed to parse vehicle positions:', error);
                    this.vehiclePositionSubject.next([]);
                }
            }
        });
    }

    getNotifications(): Observable<any> {
        return this.notificationSubject.asObservable();
    }

    getVehiclePositions(): Observable<RealTime[]> {
        return this.vehiclePositionSubject.asObservable();
    }

    getConnectionStatus(): Observable<boolean> {
        return this.connectionStatusSubject.asObservable();
    }

    isConnected(): boolean {
        return this.client.connected;
    }
}
