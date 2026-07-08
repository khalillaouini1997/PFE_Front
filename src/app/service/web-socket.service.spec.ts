import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { WebSocketService } from './web-socket.service';

vi.mock('sockjs-client', () => {
  return {
    default: vi.fn().mockImplementation(() => ({})),
  };
});

vi.mock('@stomp/stompjs', () => ({
  Client: class MockClient {
    activate = vi.fn();
    deactivate = vi.fn();
    subscribe = vi.fn();
    _connected = false;
    _active = false;
    get connected() { return this._connected; }
    set connected(v) { this._connected = v; }
    get active() { return this._active; }
    set active(v) { this._active = v; }
    onConnect: any = null;
    onStompError: any = null;
    onDisconnect: any = null;
    constructor(_options?: any) {}
  },
}));

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

  describe('connect', () => {
    it('should activate client if not active', () => {
      const client = (service as any).client;
      client.active = false;

      service.connect();

      expect(client.activate).toHaveBeenCalled();
    });

    it('should not activate client if already active', () => {
      const client = (service as any).client;
      client.active = true;

      service.connect();

      expect(client.activate).not.toHaveBeenCalled();
    });
  });

  describe('disconnect', () => {
    it('should deactivate client if active', () => {
      const client = (service as any).client;
      client.active = true;

      service.disconnect();

      expect(client.deactivate).toHaveBeenCalled();
    });

    it('should not deactivate client if not active', () => {
      const client = (service as any).client;
      client.active = false;

      service.disconnect();

      expect(client.deactivate).not.toHaveBeenCalled();
    });
  });

  describe('isConnected', () => {
    it('should return client.connected', () => {
      const client = (service as any).client;
      client.connected = true;

      expect(service.isConnected()).toBe(true);
    });

    it('should return false when not connected', () => {
      const client = (service as any).client;
      client.connected = false;

      expect(service.isConnected()).toBe(false);
    });
  });

  describe('observables', () => {
    it('should emit initial values', () => {
      let notification: any;
      let vehiclePositions: any;
      let connectionStatus: any;

      service.getNotifications().subscribe((data) => (notification = data));
      service.getVehiclePositions().subscribe((data) => (vehiclePositions = data));
      service.getConnectionStatus().subscribe((data) => (connectionStatus = data));

      expect(notification).toBeNull();
      expect(vehiclePositions).toEqual([]);
      expect(connectionStatus).toBe(false);
    });

    it('should emit connection status on connect', () => {
      let connectionStatus: boolean | undefined;
      service.getConnectionStatus().subscribe((data) => (connectionStatus = data));

      const client = (service as any).client;
      client.onConnect({});

      expect(connectionStatus).toBe(true);
    });

    it('should emit connection status on disconnect', () => {
      let connectionStatus: boolean | undefined;
      service.getConnectionStatus().subscribe((data) => (connectionStatus = data));

      const client = (service as any).client;
      client.onConnect({});
      expect(connectionStatus).toBe(true);

      client.onDisconnect();
      expect(connectionStatus).toBe(false);
    });
  });
});
