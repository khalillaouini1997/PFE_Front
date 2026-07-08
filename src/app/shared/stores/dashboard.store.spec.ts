import { TestBed } from '@angular/core/testing';
import { DashboardStore } from './dashboard.store';
import { WebAccountService } from '../../service/web-account.service';
import { WebSocketService } from '../../service/web-socket.service';
import { of, Subject, throwError } from 'rxjs';

describe('DashboardStore', () => {
  let store: DashboardStore;
  let webAccountService: { getAllWebAccountNames: ReturnType<typeof vi.fn>; getAllLastTram: ReturnType<typeof vi.fn>; getDeviceInstallationEvolution: ReturnType<typeof vi.fn> };
  let webSocketService: { isConnected: ReturnType<typeof vi.fn>; connect: ReturnType<typeof vi.fn>; getVehiclePositions: ReturnType<typeof vi.fn>; getConnectionStatus: ReturnType<typeof vi.fn> };
  let vehiclePositions$: Subject<any>;
  let connectionStatus$: Subject<boolean>;

  beforeEach(() => {
    vehiclePositions$ = new Subject();
    connectionStatus$ = new Subject();

    webAccountService = {
      getAllWebAccountNames: vi.fn().mockReturnValue(of({ data: [] })),
      getAllLastTram: vi.fn().mockReturnValue(of({ data: [] })),
      getDeviceInstallationEvolution: vi.fn().mockReturnValue(of({ data: [] })),
    };
    webSocketService = {
      isConnected: vi.fn().mockReturnValue(false),
      connect: vi.fn(),
      getVehiclePositions: vi.fn().mockReturnValue(vehiclePositions$.asObservable()),
      getConnectionStatus: vi.fn().mockReturnValue(connectionStatus$.asObservable()),
    };

    TestBed.configureTestingModule({
      providers: [
        DashboardStore,
        { provide: WebAccountService, useValue: webAccountService },
        { provide: WebSocketService, useValue: webSocketService }
      ]
    });

    store = TestBed.inject(DashboardStore);
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
    expect(store.realtimes()).toEqual([]);
    expect(store.selectedCompteWeb()).toBeNull();
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
  });

  it('should load comptes web', () => {
    const accounts = [{ idCompteClientWeb: 1, login: 'test' }];
    webAccountService.getAllWebAccountNames.mockReturnValue(of({ data: accounts }));
    store.loadComptesWeb();
    expect(store.comptesWeb().length).toBe(1);
    expect(store.loading()).toBe(false);
  });

  it('should handle comptes web error', () => {
    webAccountService.getAllWebAccountNames.mockReturnValue(throwError(() => new Error('fail')));
    store.loadComptesWeb();
    expect(store.error()).toBe('Failed to load web accounts');
  });

  it('should handle comptes web as direct array', () => {
    webAccountService.getAllWebAccountNames.mockReturnValue(of([{ idCompteClientWeb: 1 }]));
    store.loadComptesWeb();
    expect(store.comptesWeb().length).toBe(1);
  });

  it('should select compte web and load realtimes', () => {
    const compte = { idCompteClientWeb: 1, login: 'test' };
    webAccountService.getAllLastTram.mockReturnValue(of({ data: [{ deviceid: 1, speed: 10, status: 'VALID' }] }));
    webAccountService.getDeviceInstallationEvolution.mockReturnValue(of({ data: [] }));

    store.selectCompteWeb(compte as any);
    expect(store.selectedCompteWeb()).toEqual(compte);
    expect(webAccountService.getAllLastTram).toHaveBeenCalledWith(1);
  });

  it('should select null compte web', () => {
    store.selectCompteWeb(null);
    expect(store.selectedCompteWeb()).toBeNull();
  });

  it('should load realtimes via HTTP when websocket not connected', () => {
    webSocketService.isConnected.mockReturnValue(false);
    const compte = { idCompteClientWeb: 1 };
    const realtimes = [
      { deviceid: 1, speed: 50, status: 'VALID' },
      { deviceid: 2, speed: 0, status: 'TECHNICAL_ISSUE' }
    ];
    webAccountService.getAllLastTram.mockReturnValue(of({ data: realtimes }));

    store.selectCompteWeb(compte as any);
    expect(store.realtimes().length).toBe(2);
    expect(store.loading()).toBe(false);
  });

  it('should calculate stats from realtimes', () => {
    webSocketService.isConnected.mockReturnValue(false);
    const compte = { idCompteClientWeb: 1 };
    const realtimes = [
      { deviceid: 1, speed: 50, status: 'VALID' },
      { deviceid: 2, speed: 0, status: 'TECHNICAL_ISSUE' },
      { deviceid: 3, speed: 30, status: 'VALID' }
    ];
    webAccountService.getAllLastTram.mockReturnValue(of({ data: realtimes }));

    store.selectCompteWeb(compte as any);
    const stats = store.stats();
    expect(stats.total).toBe(3);
    expect(stats.valid).toBe(2);
    expect(stats.technicalIssue).toBe(1);
    expect(stats.moving).toBe(2);
  });

  it('should handle realtimes error', () => {
    webSocketService.isConnected.mockReturnValue(false);
    webAccountService.getAllLastTram.mockReturnValue(throwError(() => new Error('fail')));
    store.selectCompteWeb({ idCompteClientWeb: 1 } as any);
    expect(store.error()).toBe('Failed to load real-time data');
  });

  it('should load installation evolution', () => {
    const compte = { idCompteClientWeb: 1 };
    webAccountService.getDeviceInstallationEvolution.mockReturnValue(of({ data: [{ month: '2024-01', count: 5 }] }));
    webAccountService.getAllLastTram.mockReturnValue(of({ data: [] }));

    store.selectCompteWeb(compte as any);
    expect(store.installationEvolution().length).toBe(1);
  });

  it('should set granularity and reload evolution', () => {
    const compte = { idCompteClientWeb: 1 };
    webAccountService.getAllLastTram.mockReturnValue(of({ data: [] }));
    webAccountService.getDeviceInstallationEvolution.mockReturnValue(of({ data: [] }));
    store.selectCompteWeb(compte as any);

    store.setGranularity('year');
    expect(store.granularity()).toBe('year');
    expect(webAccountService.getDeviceInstallationEvolution).toHaveBeenCalledWith(1, 'year');
  });

  it('should set granularity without compte', () => {
    store.setGranularity('year');
    expect(store.granularity()).toBe('year');
  });

  it('should clear error', () => {
    (store as any).updateState({ error: 'test error' });
    store.clearError();
    expect(store.error()).toBeNull();
  });

  it('should handle realtime data as direct array', () => {
    webSocketService.isConnected.mockReturnValue(false);
    webAccountService.getAllLastTram.mockReturnValue(of([{ deviceid: 1, speed: 10, status: 'VALID' }]));
    store.selectCompteWeb({ idCompteClientWeb: 1 } as any);
    expect(store.realtimes().length).toBe(1);
  });

  it('should unsubscribe on destroy', () => {
    store.ngOnDestroy();
    expect(() => store.ngOnDestroy()).not.toThrow();
  });

  it('should handle websocket position updates', () => {
    webSocketService.isConnected.mockReturnValue(true);
    webAccountService.getAllLastTram.mockReturnValue(of({ data: [] }));
    store.selectCompteWeb({ idCompteClientWeb: 1 } as any);

    vehiclePositions$.next([{ deviceid: 1, speed: 20, status: 'VALID' }]);
    expect(store.realtimes().length).toBe(0);
    expect(store.loading()).toBe(false);
  });

  it('should fall back to HTTP on websocket error', () => {
    webSocketService.isConnected.mockReturnValue(true);
    webAccountService.getAllLastTram.mockReturnValue(of({ data: [] }));
    store.selectCompteWeb({ idCompteClientWeb: 1 } as any);

    vehiclePositions$.error(new Error('ws error'));
  });

  it('should handle connection status change', () => {
    webSocketService.isConnected.mockReturnValue(true);
    webAccountService.getAllLastTram.mockReturnValue(of({ data: [] }));
    store.selectCompteWeb({ idCompteClientWeb: 1 } as any);

    connectionStatus$.next(false);
  });
});
