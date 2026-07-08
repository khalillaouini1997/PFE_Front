import { Injectable, inject, signal, computed, OnDestroy } from '@angular/core';
import { CompteClientWebInfoDTO, RealTime, RealTimeSummary } from '../../data/data';
import { WebAccountService } from '../../service/web-account.service';
import { WebSocketService } from '../../service/web-socket.service';
import { Subscription } from 'rxjs';
import { STATUS_TYPES } from '../constants/app.constants';

export interface GlobalDashboardStats {
  totalVehicles: number;
  valid: number;
  technicalIssue: number;
  nonValid: number;
  moving: number;
  stopped: number;
  ignitionOn: number;
  accountsCount: number;
  inactive: number;
}

export interface GlobalRealTime extends RealTime {}

export interface ActivityEvent {
  time: Date;
  icon: string;
  message: string;
  type: 'move' | 'stop' | 'signal' | 'reconnect';
}

export interface GlobalDashboardState {
  comptesWeb: CompteClientWebInfoDTO[];
  summaries: RealTimeSummary[];     // ALL devices - for accurate KPIs/charts
  mapRealtimes: GlobalRealTime[];   // Limited devices - for map (has coordinates)
  stats: GlobalDashboardStats;
  deviceCount: number;
  loading: boolean;
  error: string | null;
  activityFeed: ActivityEvent[];
  accountPage: number;
}

@Injectable({ providedIn: 'root' })
export class GlobalDashboardStore implements OnDestroy {
  private readonly webAccountService = inject(WebAccountService);
  private readonly webSocketService = inject(WebSocketService);
  private vehiclePositionSubscription?: Subscription;
  private connectionStatusSubscription?: Subscription;
  private readonly previousPositions = new Map<number, { speed: number; status: string }>();

  private readonly state = signal<GlobalDashboardState>({
    comptesWeb: [],
    summaries: [],
    mapRealtimes: [],
    stats: { totalVehicles: 0, valid: 0, technicalIssue: 0, nonValid: 0, moving: 0, stopped: 0, ignitionOn: 0, accountsCount: 0, inactive: 0 },
    deviceCount: 0,
    loading: false,
    error: null,
    activityFeed: [],
    accountPage: 0
  });

  readonly comptesWeb = computed(() => this.state().comptesWeb);
  /** Summaries for KPIs/charts (covers ALL devices) */
  readonly summaries = computed(() => this.state().summaries);
  /** Full RealTime data with coordinates for map */
  readonly mapRealtimes = computed(() => this.state().mapRealtimes);
  readonly stats = computed(() => this.state().stats);
  readonly loading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);
  readonly activityFeed = computed(() => this.state().activityFeed);
  readonly accountPage = computed(() => this.state().accountPage);

  static readonly ACCOUNTS_PER_PAGE = 8;

  readonly accountsBreakdown = computed(() => {
    const data = this.state().mapRealtimes;
    const accountsMap = new Map<string, {
      login: string;
      total: number;
      moving: number;
      stopped: number;
      valid: number;
      technicalIssue: number;
      nonValid: number;
    }>();

    for (const rt of data) {
      const login = rt.login || 'Unknown';
      let entry = accountsMap.get(login);
      if (!entry) {
        entry = { login, total: 0, moving: 0, stopped: 0, valid: 0, technicalIssue: 0, nonValid: 0 };
        accountsMap.set(login, entry);
      }
      entry.total++;
      if (rt.speed > 0) { entry.moving++; } else { entry.stopped++; }
      if (rt.status === STATUS_TYPES.VALID) { entry.valid++; }
      else if (rt.status === STATUS_TYPES.TECHNICAL_ISSUE) { entry.technicalIssue++; }
      else { entry.nonValid++; }
    }

    return Array.from(accountsMap.values())
      .filter(a => a.total > 0)
      .sort((a, b) => b.total - a.total);
  });

  readonly pagedAccounts = computed(() => {
    const all = this.accountsBreakdown();
    const page = this.state().accountPage;
    const size = GlobalDashboardStore.ACCOUNTS_PER_PAGE;
    return all.slice(page * size, (page + 1) * size);
  });

  readonly totalAccountPages = computed(() => {
    return Math.ceil(this.accountsBreakdown().length / GlobalDashboardStore.ACCOUNTS_PER_PAGE);
  });

  setAccountPage(page: number) {
    this.updateState({ accountPage: Math.max(0, Math.min(page, this.totalAccountPages() - 1)) });
  }

  init() {
    this.updateState({ loading: true, error: null });
    this.loadAccountCount();
    this.loadDeviceCount();
    this.loadSummaries();
    this.loadMapRealtimes();
    this.connectWebSocket();
  }

  private loadAccountCount() {
    this.webAccountService.getAllWebAccountNames().subscribe({
      next: (res: any) => {
        const comptes = res?.data || res;
        const accounts = Array.isArray(comptes) ? comptes : [];
        this.updateState({ comptesWeb: accounts });
        this.recalculateStats();
      },
      error: () => {
        this.updateState({ error: 'Failed to load account list' });
      }
    });
  }

  private loadDeviceCount() {
    this.webAccountService.getTotalDeviceCount().subscribe({
      next: (res: any) => {
        const count = typeof res === 'number' ? res : (res?.data ?? 0);
        this.updateState({ deviceCount: count });
        this.recalculateStats();
      },
      error: () => {
        this.updateState({ deviceCount: 0 });
      }
    });
  }

  /** Load lightweight summaries for ALL accounts (no limit, cached on backend) */
  private loadSummaries() {
    this.webAccountService.getAllLastTramSummary().subscribe({
      next: (res: any) => {
        const data = res?.data || res;
        const list = Array.isArray(data) ? data : [];
        this.updateState({ summaries: list as RealTimeSummary[], loading: false });
        this.recalculateStats();

        this.seedPreviousPositions(list);
        this.populateInitialActivityFeed(list);
      },
      error: () => {
        this.updateState({ loading: false, error: 'Failed to load fleet data' });
      }
    });
  }

  private seedPreviousPositions(list: RealTimeSummary[]) {
    for (const item of list) {
      if (item.deviceid) {
        this.previousPositions.set(item.deviceid, {
          speed: item.speed ?? 0,
          status: item.status || ''
        });
      }
    }
  }

  private populateInitialActivityFeed(list: RealTimeSummary[]) {
    const initialEvents: ActivityEvent[] = [];
    const now = new Date();
    let eventCount = 0;

    eventCount = this.collectMovingAndSignalEvents(list, now, initialEvents, eventCount);
    this.collectStoppedEvents(list, now, initialEvents, eventCount);

    initialEvents.sort((a, b) => b.time.getTime() - a.time.getTime());
    this.updateState({ activityFeed: initialEvents });
  }

  private collectMovingAndSignalEvents(
    list: RealTimeSummary[], now: Date, events: ActivityEvent[], count: number
  ): number {
    for (const item of list) {
      if (count >= 5) break;
      const time = this.parseRecordTime(item.record_time, count, now);

      if (item.speed > 0) {
        events.push({ time, icon: '🟢', message: `Device #${item.deviceid} is moving`, type: 'move' });
        count++;
      } else if (item.status === STATUS_TYPES.TECHNICAL_ISSUE) {
        events.push({ time, icon: '⚠️', message: `Device #${item.deviceid} signal lost`, type: 'signal' });
        count++;
      }
    }
    return count;
  }

  private collectStoppedEvents(
    list: RealTimeSummary[], now: Date, events: ActivityEvent[], count: number
  ): number {
    for (const item of list) {
      if (count >= 5) break;
      if (item.speed === 0 && item.status !== STATUS_TYPES.TECHNICAL_ISSUE) {
        const time = this.parseRecordTime(item.record_time, count, now);
        events.push({ time, icon: '🔴', message: `Device #${item.deviceid} is stopped`, type: 'stop' });
        count++;
      }
    }
    return count;
  }

  private parseRecordTime(recordTime: any, index: number, now: Date): Date {
    return recordTime ? new Date(recordTime) : new Date(now.getTime() - index * 60000);
  }

  /** Load full RealTime objects (with coordinates) for map - from lightweight cached endpoint */
  private loadMapRealtimes() {
    this.webAccountService.getAllLastTramMapData().subscribe({
      next: (res: any) => {
        const data = res?.data || res;
        const list = Array.isArray(data) ? data : [];
        this.updateState({ mapRealtimes: list as GlobalRealTime[] });
      },
      error: () => { /* Map data is supplementary, don't block on failure */ }
    });
  }

  private connectWebSocket() {
    if (!this.webSocketService.isConnected()) {
      this.webSocketService.connect();
    }

    this.vehiclePositionSubscription = this.webSocketService.getVehiclePositions()
      .subscribe({
        next: (positions) => {
          if (!positions?.length) return;
          this.generateActivityEvents(positions);
          this.updateState({ mapRealtimes: positions as unknown as GlobalRealTime[], loading: false });
        }
      });

    this.connectionStatusSubscription = this.webSocketService.getConnectionStatus()
      .subscribe();
  }

  /** Generate activity feed events by comparing current vs previous positions */
  private generateActivityEvents(positions: RealTime[]) {
    const newEvents: ActivityEvent[] = [];
    const now = new Date();

    for (const pos of positions) {
      const prev = this.previousPositions.get(pos.deviceid);
      if (prev) {
        this.checkSpeedTransition(prev, pos, now, newEvents);
        this.checkStatusTransition(prev, pos, now, newEvents);
      }
      this.previousPositions.set(pos.deviceid, { speed: pos.speed, status: pos.status });
    }

    if (newEvents.length > 0) {
      const currentFeed = this.state().activityFeed;
      this.updateState({ activityFeed: [...newEvents, ...currentFeed].slice(0, 50) });
    }
  }

  private checkSpeedTransition(
    prev: { speed: number; status: string }, pos: RealTime, now: Date, events: ActivityEvent[]
  ) {
    const suffix = pos.login ? ` (${pos.login})` : '';
    if (prev.speed === 0 && pos.speed > 0) {
      events.push({ time: now, icon: '🟢', message: `Device #${pos.deviceid} started moving${suffix}`, type: 'move' });
    } else if (prev.speed > 0 && pos.speed === 0) {
      events.push({ time: now, icon: '🔴', message: `Device #${pos.deviceid} stopped${suffix}`, type: 'stop' });
    }
  }

  private checkStatusTransition(
    prev: { speed: number; status: string }, pos: RealTime, now: Date, events: ActivityEvent[]
  ) {
    const suffix = pos.login ? ` (${pos.login})` : '';
    if (prev.status === STATUS_TYPES.VALID && pos.status === STATUS_TYPES.TECHNICAL_ISSUE) {
      events.push({ time: now, icon: '⚠️', message: `Device #${pos.deviceid} signal lost${suffix}`, type: 'signal' });
    } else if (prev.status === STATUS_TYPES.TECHNICAL_ISSUE && pos.status === STATUS_TYPES.VALID) {
      events.push({ time: now, icon: '✅', message: `Device #${pos.deviceid} reconnected${suffix}`, type: 'reconnect' });
    }
  }

  /** Compute KPI stats from summaries (covers ALL devices) */
  private recalculateStats() {
    const data = this.state().summaries;
    const totalVehicles = this.state().deviceCount || data.length;
    const moving = data.filter(t => t.speed > 0).length;
    const stopped = data.filter(t => t.speed === 0).length;
    const inactive = Math.max(0, totalVehicles - moving - stopped);

    this.updateState({
      stats: {
        totalVehicles,
        valid: data.filter(t => t.status === STATUS_TYPES.VALID).length,
        technicalIssue: data.filter(t => t.status === STATUS_TYPES.TECHNICAL_ISSUE).length,
        nonValid: data.filter(t => t.status === STATUS_TYPES.NON_VALID).length,
        moving,
        stopped,
        ignitionOn: data.filter(t => t.ignition).length,
        accountsCount: this.state().comptesWeb.length,
        inactive
      }
    });
  }

  refresh() {
    this.updateState({ loading: true, error: null });
    this.loadAccountCount();
    this.loadDeviceCount();
    this.loadSummaries();
    this.loadMapRealtimes();
  }

  private updateState(partial: Partial<GlobalDashboardState>) {
    this.state.update(current => ({ ...current, ...partial }));
  }

  ngOnDestroy() {
    this.vehiclePositionSubscription?.unsubscribe();
    this.connectionStatusSubscription?.unsubscribe();
  }
}
