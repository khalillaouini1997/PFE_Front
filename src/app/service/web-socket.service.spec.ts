import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { WebSocketService } from './web-socket.service';

vi.mock('sockjs-client', () => ({
  default: vi.fn().mockImplementation(() => ({})),
}));

vi.mock('@stomp/stompjs', () => {
  const mockInstance = {
    activate: vi.fn(),
    deactivate: vi.fn(),
    subscribe: vi.fn(),
    _connected: false,
    _active: false,
    onConnect: null as any,
    onStompError: null as any,
    onDisconnect: null as any,
  };
  return {
    Client: class MockClient {
      constructor(_options?: any) {
        Object.assign(this, mockInstance);
      }
      activate = mockInstance.activate;
      deactivate = mockInstance.deactivate;
      subscribe = mockInstance.subscribe;
      _connected = mockInstance._connected;
      _active = mockInstance._active;
      onConnect = mockInstance.onConnect;
      onStompError = mockInstance.onStompError;
      onDisconnect = mockInstance.onDisconnect;
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
    service.connect();
    const client = (service as any).client;
    expect(client.activate).toHaveBeenCalled();
  });
});
