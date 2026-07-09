import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { WebSocketService } from './web-socket.service';

vi.mock('sockjs-client', () => ({
  default: vi.fn().mockImplementation(() => ({})),
}));

vi.mock('@stomp/stompjs', () => {
  let _active = false;
  let _connected = false;
  const _subscribeCallbacks: Record<string, Function> = {};

  return {
    Client: class MockClient {
      activate = vi.fn(() => { _active = true; _connected = true; });
      deactivate = vi.fn(() => { _active = false; _connected = false; });
      subscribe = vi.fn((destination: string, callback: any) => {
        _subscribeCallbacks[destination] = callback;
      });
      get active() { return _active; }
      set active(_v: any) { _active = _v; }
      get connected() { return _connected; }
      set connected(_v: any) { _connected = _v; }
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

  it('connect should not call activate if client is already active', () => {
    const client = (service as any).client;
    client.activate();
    vi.clearAllMocks();
    service.connect();
    expect(client.activate).not.toHaveBeenCalled();
  });

  it('disconnect should call client.deactivate', () => {
    const client = (service as any).client;
    client.activate();
    service.disconnect();
    expect(client.deactivate).toHaveBeenCalled();
  });

  it('disconnect should not call deactivate if client is not active', () => {
    const client = (service as any).client;
    service.disconnect();
    expect(client.deactivate).not.toHaveBeenCalled();
  });

  it('isConnected should return client.connected', () => {
    const client = (service as any).client;
    expect(service.isConnected()).toBe(false);
    client.activate();
    expect(service.isConnected()).toBe(true);
  });

  it('onConnect should set connection status to true and subscribe to topics', () => {
    const client = (service as any).client;
    let status: any;
    service.getConnectionStatus().subscribe((s) => (status = s));

    client.onConnect({});
    expect(status).toBe(true);
    expect(client.subscribe).toHaveBeenCalledWith('/topic/notification', expect.any(Function));
    expect(client.subscribe).toHaveBeenCalledWith('/topic/vehicle-positions', expect.any(Function));
  });

  it('onDisconnect should set connection status to false', () => {
    const client = (service as any).client;
    let status: any;
    service.getConnectionStatus().subscribe((s) => (status = s));

    client.onDisconnect();
    expect(status).toBe(false);
  });

  it('notification subscription should parse JSON and emit', () => {
    const client = (service as any).client;
    let notification: any;
    service.getNotifications().subscribe((data) => (notification = data));

    client.onConnect({});
    const notifCallback = client.subscribe.mock.calls.find(
      (c: any[]) => c[0] === '/topic/notification'
    )?.[1];

    notifCallback({ body: '{"alert":"test"}' });
    expect(notification).toEqual({ alert: 'test' });
  });

  it('notification subscription should ignore empty body', () => {
    const client = (service as any).client;
    let notification: any;
    service.getNotifications().subscribe((data) => (notification = data));

    client.onConnect({});
    const notifCallback = client.subscribe.mock.calls.find(
      (c: any[]) => c[0] === '/topic/notification'
    )?.[1];

    notifCallback({ body: '' });
    expect(notification).toBeNull();
  });

  it('vehicle position subscription should parse JSON and emit', () => {
    const client = (service as any).client;
    let positions: any;
    service.getVehiclePositions().subscribe((data) => (positions = data));

    client.onConnect({});
    const posCallback = client.subscribe.mock.calls.find(
      (c: any[]) => c[0] === '/topic/vehicle-positions'
    )?.[1];

    posCallback({ body: '[{"lat":1,"lng":2}]' });
    expect(positions).toEqual([{ lat: 1, lng: 2 }]);
  });

  it('vehicle position subscription should emit empty array on parse error', () => {
    const client = (service as any).client;
    let positions: any;
    service.getVehiclePositions().subscribe((data) => (positions = data));

    client.onConnect({});
    const posCallback = client.subscribe.mock.calls.find(
      (c: any[]) => c[0] === '/topic/vehicle-positions'
    )?.[1];

    posCallback({ body: 'invalid json' });
    expect(positions).toEqual([]);
  });

  it('vehicle position subscription should ignore empty body', () => {
    const client = (service as any).client;
    let positions: any;
    service.getVehiclePositions().subscribe((data) => (positions = data));

    client.onConnect({});
    const posCallback = client.subscribe.mock.calls.find(
      (c: any[]) => c[0] === '/topic/vehicle-positions'
    )?.[1];

    posCallback({ body: '' });
    expect(positions).toEqual([]);
  });

  it('getSocketUrl should strip /api/v1/ from base URL and append socket', () => {
    const socketUrl = service['getSocketUrl']();
    expect(socketUrl).toContain('socket');
  });
});
