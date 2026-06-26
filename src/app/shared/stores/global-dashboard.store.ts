import { Injectable, inject, signal, computed, OnDestroy } from '@angular/core';
import { CompteClientWebInfoDTO, RealTime } from '../../data/data';
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
  accountsCount: number;
}

export interface GlobalRealTime extends RealTime {}

export interface GlobalDashboardState {
  comptesWeb: CompteClientWebInfoDTO[];
  realtimes: GlobalRealTime[];
  stats: GlobalDashboardStats;
  loading: boolean;
  error: string | null;
}

@Injectable({ providedIn: 'root' })
export class GlobalDashboardStore implements OnDestroy {
  private readonly webAccountService = inject(WebAccountService);
  private readonly webSocketService = inject(WebSocketService);
  private vehiclePositionSubscription?: Subscription;
  private connectionStatusSubscription?: Subscription;

  private readonly state = signal<GlobalDashboardState>({
    comptesWeb: [],
    realtimes: [],
    stats: { totalVehicles: 0, valid: 0, technicalIssue: 0, nonValid: 0, moving: 0, stopped: 0, accountsCount: 0 },
    loading: false,
    error: null
  });

  readonly comptesWeb = computed(() => this.state().comptesWeb);
  readonly realtimes = computed(() => this.state().realtimes);
  readonly stats = computed(() => this.state().stats);
  readonly loading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);

  init() {
    this.updateState({ loading: true, error: null });
    this.loadAccountCount();
    this.loadAllRealtimesViaHttp();
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

  private loadAllRealtimesViaHttp() {
    this.webAccountService.getAllLastTramGlobal().subscribe({
      next: (res: any) => {
        const data = res?.data || res;
        const list = Array.isArray(data) ? data : [];
        this.updateState({ realtimes: list as GlobalRealTime[], loading: false });
        this.recalculateStats();
      },
      error: () => {
        this.updateState({ loading: false, error: 'Failed to load fleet data' });
      }
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
          this.updateState({ realtimes: positions as GlobalRealTime[], loading: false });
          this.recalculateStats();
        }
      });

    this.connectionStatusSubscription = this.webSocketService.getConnectionStatus()
      .subscribe();
  }

  private recalculateStats() {
    const data = this.state().realtimes;
    this.updateState({
      stats: {
        totalVehicles: data.length,
        valid: data.filter(t => t.status === STATUS_TYPES.VALID).length,
        technicalIssue: data.filter(t => t.status === STATUS_TYPES.TECHNICAL_ISSUE).length,
        nonValid: data.filter(t => t.status === STATUS_TYPES.NON_VALID).length,
        moving: data.filter(t => t.speed > 0).length,
        stopped: data.filter(t => t.speed === 0).length,
        accountsCount: this.state().comptesWeb.length
      }
    });
  }

  refresh() {
    this.updateState({ loading: true, error: null });
    this.loadAccountCount();
    this.loadAllRealtimesViaHttp();
  }

  private updateState(partial: Partial<GlobalDashboardState>) {
    this.state.update(current => ({ ...current, ...partial }));
  }

  ngOnDestroy() {
    this.vehiclePositionSubscription?.unsubscribe();
    this.connectionStatusSubscription?.unsubscribe();
  }
}
