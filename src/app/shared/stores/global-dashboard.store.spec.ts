import {TestBed} from '@angular/core/testing';
import {GlobalDashboardStore} from './global-dashboard.store';
import {WebAccountService} from '../../service/web-account.service';
import {WebSocketService} from '../../service/web-socket.service';
import {of, Subject, throwError} from 'rxjs';
import {STATUS_TYPES} from '../constants/app.constants';

describe('GlobalDashboardStore', () => {
  let store: GlobalDashboardStore;
  let webAccountService: {
    getAllWebAccountNames: ReturnType<typeof vi.fn>;
    getTotalDeviceCount: ReturnType<typeof vi.fn>;
    getAllLastTramSummary: ReturnType<typeof vi.fn>;
    getAllLastTramMapData: ReturnType<typeof vi.fn>
  };
  let webSocketService: {
    isConnected: ReturnType<typeof vi.fn>;
    connect: ReturnType<typeof vi.fn>;
    getVehiclePositions: ReturnType<typeof vi.fn>;
    getConnectionStatus: ReturnType<typeof vi.fn>
  };
  let vehiclePositions$: Subject<any>;
  let connectionStatus$: Subject<boolean>;

  beforeEach(() => {
    vehiclePositions$ = new Subject();
    connectionStatus$ = new Subject();

    webAccountService = {
      getAllWebAccountNames: vi.fn().mockReturnValue(of({data: []})),
      getTotalDeviceCount: vi.fn().mockReturnValue(of(0)),
      getAllLastTramSummary: vi.fn().mockReturnValue(of({data: []})),
      getAllLastTramMapData: vi.fn().mockReturnValue(of({data: []})),
    };
    webSocketService = {
      isConnected: vi.fn().mockReturnValue(false),
      connect: vi.fn(),
      getVehiclePositions: vi.fn().mockReturnValue(vehiclePositions$.asObservable()),
      getConnectionStatus: vi.fn().mockReturnValue(connectionStatus$.asObservable()),
    };

    TestBed.configureTestingModule({
      providers: [
        GlobalDashboardStore,
        {provide: WebAccountService, useValue: webAccountService},
        {provide: WebSocketService, useValue: webSocketService}
      ]
    });

    store = TestBed.inject(GlobalDashboardStore);
  });

  afterEach(() => {
    store.ngOnDestroy();
    vehiclePositions$.complete();
    connectionStatus$.complete();
    vi.clearAllMocks();
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  it('should have default state', () => {
    expect(store.comptesWeb()).toEqual([]);
    expect(store.summaries()).toEqual([]);
    expect(store.mapRealtimes()).toEqual([]);
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
    expect(store.activityFeed()).toEqual([]);
  });

  it('should initialize and load data', () => {
    store.init();
    expect(webAccountService.getAllWebAccountNames).toHaveBeenCalled();
    expect(webAccountService.getTotalDeviceCount).toHaveBeenCalled();
    expect(webAccountService.getAllLastTramSummary).toHaveBeenCalled();
    expect(webAccountService.getAllLastTramMapData).toHaveBeenCalled();
    expect(webSocketService.connect).toHaveBeenCalled();
  });

  it('should load account count', () => {
    webAccountService.getAllWebAccountNames.mockReturnValue(of({data: [{login: 'test'}]}));
    store.init();
    expect(store.comptesWeb().length).toBe(1);
  });

  it('should handle account count error', () => {
    webAccountService.getAllWebAccountNames.mockReturnValue(throwError(() => new Error('fail')));
    store.init();
    expect(store.error()).toBe('Failed to load account list');
  });

  it('should load summaries', () => {
    const summaries = [
      {deviceid: 1, speed: 50, status: STATUS_TYPES.VALID, ignition: true, record_time: new Date()},
      {deviceid: 2, speed: 0, status: STATUS_TYPES.TECHNICAL_ISSUE, ignition: false, record_time: new Date()}
    ];
    webAccountService.getAllLastTramSummary.mockReturnValue(of({data: summaries}));
    store.init();
    expect(store.summaries().length).toBe(2);
    expect(store.loading()).toBe(false);
  });

  it('should handle summaries error', () => {
    webAccountService.getAllLastTramSummary.mockReturnValue(throwError(() => new Error('fail')));
    store.init();
    expect(store.error()).toBe('Failed to load fleet data');
    expect(store.loading()).toBe(false);
  });

  it('should load map realtimes', () => {
    const mapData = [{deviceid: 1, latitude: 33.8, longitude: 9.5}];
    webAccountService.getAllLastTramMapData.mockReturnValue(of({data: mapData}));
    store.init();
    expect(store.mapRealtimes().length).toBe(1);
  });

  it('should handle map data error gracefully', () => {
    webAccountService.getAllLastTramMapData.mockReturnValue(of(null));
    store.init();
    expect(store.mapRealtimes()).toEqual([]);
  });

  it('should calculate stats from summaries', () => {
    const summaries = [
      {deviceid: 1, speed: 50, status: STATUS_TYPES.VALID, ignition: true, record_time: new Date()},
      {deviceid: 2, speed: 0, status: STATUS_TYPES.TECHNICAL_ISSUE, ignition: false, record_time: new Date()},
      {deviceid: 3, speed: 0, status: STATUS_TYPES.NON_VALID, ignition: false, record_time: new Date()},
      {deviceid: 4, speed: 30, status: STATUS_TYPES.VALID, ignition: true, record_time: new Date()}
    ];
    webAccountService.getAllLastTramSummary.mockReturnValue(of({data: summaries}));
    webAccountService.getTotalDeviceCount.mockReturnValue(of(10));
    store.init();

    const stats = store.stats();
    expect(stats.totalVehicles).toBe(10);
    expect(stats.moving).toBe(2);
    expect(stats.stopped).toBe(2);
    expect(stats.valid).toBe(2);
    expect(stats.technicalIssue).toBe(1);
    expect(stats.nonValid).toBe(1);
    expect(stats.ignitionOn).toBe(2);
    expect(stats.inactive).toBe(6);
  });

  it('should handle summaries as direct array', () => {
    const summaries = [
      {deviceid: 1, speed: 10, status: STATUS_TYPES.VALID, ignition: true, record_time: new Date()}
    ];
    webAccountService.getAllLastTramSummary.mockReturnValue(of(summaries));
    store.init();
    expect(store.summaries().length).toBe(1);
  });

  it('should set account page', () => {
    const mapData = Array.from({length: 20}, (_, i) => ({
      deviceid: i + 1, login: `user${i}`, speed: 0, status: STATUS_TYPES.VALID, latitude: 33.8, longitude: 9.5
    }));
    webAccountService.getAllLastTramMapData.mockReturnValue(of({data: mapData}));
    store.init();

    expect(store.totalAccountPages()).toBeGreaterThan(1);
    store.setAccountPage(1);
    expect(store.accountPage()).toBe(1);
  });

  it('should clamp account page to valid range', () => {
    store.setAccountPage(-1);
    expect(store.accountPage()).toBe(0);
    store.setAccountPage(999);
    expect(store.accountPage()).toBe(0);
  });

  it('should compute accountsBreakdown', () => {
    const mapData = [
      {deviceid: 1, login: 'user1', speed: 50, status: STATUS_TYPES.VALID},
      {deviceid: 2, login: 'user1', speed: 0, status: STATUS_TYPES.VALID},
      {deviceid: 3, login: 'user2', speed: 30, status: STATUS_TYPES.TECHNICAL_ISSUE}
    ];
    webAccountService.getAllLastTramMapData.mockReturnValue(of({data: mapData}));
    store.init();

    const breakdown = store.accountsBreakdown();
    expect(breakdown.length).toBe(2);
    expect(breakdown[0].login).toBe('user1');
    expect(breakdown[0].total).toBe(2);
    expect(breakdown[0].moving).toBe(1);
    expect(breakdown[0].stopped).toBe(1);
  });

  it('should compute totalAccountPages', () => {
    const mapData = Array.from({length: 20}, (_, i) => ({
      deviceid: i + 1, login: `user${i}`, speed: 0, status: STATUS_TYPES.VALID
    }));
    webAccountService.getAllLastTramMapData.mockReturnValue(of({data: mapData}));
    store.init();

    expect(store.totalAccountPages()).toBe(Math.ceil(20 / GlobalDashboardStore.ACCOUNTS_PER_PAGE));
  });

  it('should refresh data', () => {
    store.refresh();
    expect(webAccountService.getAllWebAccountNames).toHaveBeenCalled();
  });

  it('should generate activity events from websocket positions', () => {
    const summaries = [
      {deviceid: 1, speed: 0, status: STATUS_TYPES.VALID, ignition: false, record_time: new Date()}
    ];
    webAccountService.getAllLastTramSummary.mockReturnValue(of({data: summaries}));
    store.init();

    vehiclePositions$.next([{deviceid: 1, speed: 50, status: STATUS_TYPES.VALID, login: 'user1'}]);
    expect(store.activityFeed().length).toBeGreaterThan(0);
    expect(store.activityFeed()[0].type).toBe('move');
  });

  it('should generate stop event from websocket', () => {
    const summaries = [
      {deviceid: 1, speed: 50, status: STATUS_TYPES.VALID, ignition: true, record_time: new Date()}
    ];
    webAccountService.getAllLastTramSummary.mockReturnValue(of({data: summaries}));
    store.init();

    vehiclePositions$.next([{deviceid: 1, speed: 0, status: STATUS_TYPES.VALID, login: 'user1'}]);
    expect(store.activityFeed().some(e => e.type === 'stop')).toBe(true);
  });

  it('should generate signal lost event', () => {
    const summaries = [
      {deviceid: 1, speed: 50, status: STATUS_TYPES.VALID, ignition: true, record_time: new Date()}
    ];
    webAccountService.getAllLastTramSummary.mockReturnValue(of({data: summaries}));
    store.init();

    vehiclePositions$.next([{deviceid: 1, speed: 50, status: STATUS_TYPES.TECHNICAL_ISSUE, login: 'user1'}]);
    expect(store.activityFeed().some(e => e.type === 'signal')).toBe(true);
  });

  it('should generate reconnect event', () => {
    const summaries = [
      {deviceid: 1, speed: 50, status: STATUS_TYPES.TECHNICAL_ISSUE, ignition: true, record_time: new Date()}
    ];
    webAccountService.getAllLastTramSummary.mockReturnValue(of({data: summaries}));
    store.init();

    vehiclePositions$.next([{deviceid: 1, speed: 50, status: STATUS_TYPES.VALID, login: 'user1'}]);
    expect(store.activityFeed().some(e => e.type === 'reconnect')).toBe(true);
  });

  it('should handle empty websocket positions', () => {
    store.init();
    vehiclePositions$.next([]);
    expect(store.mapRealtimes()).toEqual([]);
  });

  it('should pre-seed initial activity events from summaries', () => {
    const summaries = [
      {deviceid: 1, speed: 50, status: STATUS_TYPES.VALID, ignition: true, record_time: new Date()},
      {deviceid: 2, speed: 0, status: STATUS_TYPES.TECHNICAL_ISSUE, ignition: false, record_time: new Date()},
      {deviceid: 3, speed: 0, status: STATUS_TYPES.VALID, ignition: false, record_time: new Date()}
    ];
    webAccountService.getAllLastTramSummary.mockReturnValue(of({data: summaries}));
    store.init();

    const feed = store.activityFeed();
    expect(feed.length).toBeGreaterThan(0);
    expect(feed.length).toBeLessThanOrEqual(5);
  });

  it('should unsubscribe on destroy', () => {
    store.init();
    expect(() => store.ngOnDestroy()).not.toThrow();
  });
});
