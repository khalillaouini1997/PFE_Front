import {TestBed} from '@angular/core/testing';
import {vi} from 'vitest';
import {Client} from '@stomp/stompjs';
import {WebSocketService} from './web-socket.service';

describe('WebSocketService', () => {
  let service: WebSocketService;
  let activateSpy: any;
  let deactivateSpy: any;
  let subscribeSpy: any;

  beforeEach(() => {
    vi.clearAllMocks();

    activateSpy = vi.spyOn(Client.prototype, 'activate').mockImplementation(() => {
    });
    deactivateSpy = vi.spyOn(Client.prototype, 'deactivate').mockImplementation(() => Promise.resolve());
    subscribeSpy = vi.spyOn(Client.prototype, 'subscribe').mockImplementation(() => {
      return {
        unsubscribe: () => {
        }
      } as any;
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

  it('connect should not call activate when already active', () => {
    Object.defineProperty((service as any).client, 'active', {value: true, configurable: true});
    service.connect();
    expect(activateSpy).not.toHaveBeenCalled();
  });

  it('disconnect should call deactivate when active', () => {
    Object.defineProperty((service as any).client, 'active', {value: true, configurable: true});
    service.disconnect();
    expect(deactivateSpy).toHaveBeenCalled();
  });

  it('disconnect should not call deactivate when not active', () => {
    Object.defineProperty((service as any).client, 'active', {value: false, configurable: true});
    service.disconnect();
    expect(deactivateSpy).not.toHaveBeenCalled();
  });

  it('onDisconnect should set connection status to false', () => {
    const client = (service as any).client;
    let status: any;
    service.getConnectionStatus().subscribe((s) => (status = s));
    client.onDisconnect();
    expect(status).toBe(false);
  });

  it('onConnect should set status to true and subscribe to topics', () => {
    const client = (service as any).client;
    let status: any;
    service.getConnectionStatus().subscribe((s) => (status = s));
    client.onConnect({});
    expect(status).toBe(true);
    expect(subscribeSpy).toHaveBeenCalledTimes(2);
  });

  it('onConnect should subscribe to notification and vehicle-positions topics', () => {
    const client = (service as any).client;
    client.onConnect({});
    const topics = subscribeSpy.mock.calls.map((c: any[]) => c[0]);
    expect(topics).toContain('/topic/notification');
    expect(topics).toContain('/topic/vehicle-positions');
  });

  it('notification callback should parse and emit JSON', () => {
    const client = (service as any).client;
    client.onConnect({});

    const notifCallback = subscribeSpy.mock.calls.find((c: any[]) => c[0] === '/topic/notification')?.[1];
    let notification: any;
    service.getNotifications().subscribe((data) => (notification = data));

    notifCallback({body: '{"text":"hello"}'});
    expect(notification).toEqual({text: 'hello'});
  });

  it('notification callback with empty body should not update subject', () => {
    const client = (service as any).client;
    client.onConnect({});

    const notifCallback = subscribeSpy.mock.calls.find((c: any[]) => c[0] === '/topic/notification')?.[1];
    let notification: any;
    service.getNotifications().subscribe((data) => (notification = data));

    notifCallback({body: ''});
    expect(notification).toBeNull();
  });

  it('vehicle positions callback should parse and emit array', () => {
    const client = (service as any).client;
    client.onConnect({});

    const posCallback = subscribeSpy.mock.calls.find((c: any[]) => c[0] === '/topic/vehicle-positions')?.[1];
    let positions: any;
    service.getVehiclePositions().subscribe((data) => (positions = data));

    posCallback({body: '[{"deviceid":1}]'});
    expect(positions).toEqual([{deviceid: 1}]);
  });

  it('vehicle positions callback with invalid JSON should emit empty array', () => {
    const client = (service as any).client;
    client.onConnect({});

    const posCallback = subscribeSpy.mock.calls.find((c: any[]) => c[0] === '/topic/vehicle-positions')?.[1];
    let positions: any;
    service.getVehiclePositions().subscribe((data) => (positions = data));

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {
    });
    posCallback({body: 'invalid-json'});
    expect(positions).toEqual([]);
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('vehicle positions callback with empty body should not update subject', () => {
    const client = (service as any).client;
    client.onConnect({});

    const posCallback = subscribeSpy.mock.calls.find((c: any[]) => c[0] === '/topic/vehicle-positions')?.[1];
    let positions: any;
    service.getVehiclePositions().subscribe((data) => (positions = data));

    posCallback({body: ''});
    expect(positions).toEqual([]);
  });

  it('isConnected should return client.connected', () => {
    Object.defineProperty((service as any).client, 'connected', {value: true, configurable: true});
    expect(service.isConnected()).toBe(true);
  });

  it('getSocketUrl should return socket URL', () => {
    const socketUrl = service['getSocketUrl']();
    expect(socketUrl).toContain('socket');
  });

  it('getSocketUrl should strip /api/v1/ prefix', () => {
    const socketUrl = service['getSocketUrl']();
    expect(socketUrl).not.toContain('/api/v1/');
  });
});
