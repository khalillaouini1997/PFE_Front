import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { WebSocketService } from './web-socket.service';

vi.mock('sockjs-client', () => ({
  default: vi.fn().mockImplementation(() => ({})),
}));

vi.mock('@stomp/stompjs', () => {
  return {
    Client: class MockClient {
      activate = vi.fn();
      deactivate = vi.fn();
      subscribe = vi.fn();
      connected = false;
      active = false;
      onConnect: any = null;
      onStompError: any = null;
      onDisconnect: any = null;
      constructor(_options?: any) {}
    },
  };
});

describe('WebSocketService', () => {
  let service: WebSocketService;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [WebSocketService],
    });
    service = TestBed.inject(WebSocketService);
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
    const client = (service as any).client;
    service.connect();
    expect(client.activate).toHaveBeenCalled();
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
