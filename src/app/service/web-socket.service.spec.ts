import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { Client } from '@stomp/stompjs';
import { WebSocketService } from './web-socket.service';

describe('WebSocketService', () => {
  let service: WebSocketService;
  let activateSpy: any;
  let deactivateSpy: any;
  let subscribeSpy: any;

  beforeEach(() => {
    vi.clearAllMocks();

    activateSpy = vi.spyOn(Client.prototype, 'activate').mockImplementation(() => {});
    deactivateSpy = vi.spyOn(Client.prototype, 'deactivate').mockImplementation(() => Promise.resolve());
    subscribeSpy = vi.spyOn(Client.prototype, 'subscribe').mockImplementation(() => {
      return { unsubscribe: () => {} } as any;
    });

    TestBed.configureTestingModule({
      providers: [WebSocketService],
    });
    service = TestBed.inject(WebSocketService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should emit initial notification as null', () => {
    let notification: any;
    service.getNotifications().subscribe((data) => (notification = data));
    expect(notification).toBeNull();
  });

  it('should emit initial vehicle positions as empty array', () => {
    let vehiclePositions: any;
    service.getVehiclePositions().subscribe((data) => (vehiclePositions = data));
    expect(vehiclePositions).toEqual([]);
  });

  it('should emit initial connection status as false', () => {
    let connectionStatus: any;
    service.getConnectionStatus().subscribe((data) => (connectionStatus = data));
    expect(connectionStatus).toBe(false);
  });

  it('connect should call client.activate', () => {
    service.connect();
    expect(activateSpy).toHaveBeenCalled();
  });

  it('onDisconnect should set connection status to false', () => {
    const client = (service as any).client;
    let status: any;
    service.getConnectionStatus().subscribe((s) => (status = s));
    client.onDisconnect();
    expect(status).toBe(false);
  });

  it('getSocketUrl should return socket URL', () => {
    const socketUrl = service['getSocketUrl']();
    expect(socketUrl).toContain('socket');
  });
});
