import { Injectable, inject, signal, computed, OnDestroy } from '@angular/core';
import { CompteClientWebInfoDTO, DeviceInstallationEvolution, RealTime } from '../../data/data';
import { WebAccountService } from '../../service/web-account.service';
import { WebSocketService } from '../../service/web-socket.service';
import { REALTIME_CONSTANTS } from '../constants/app.constants';
import { debounceTime, distinctUntilChanged, Subscription } from 'rxjs';

export interface DashboardStats {
  total: number;
  valid: number;
  technicalIssue: number;
  moving: number;
}

export interface DashboardState {
  comptesWeb: CompteClientWebInfoDTO[];
  realtimes: RealTime[];
  selectedCompteWeb: CompteClientWebInfoDTO | null;
  stats: DashboardStats;
  installationEvolution: DeviceInstallationEvolution[];
  granularity: string;
  loading: boolean;
  error: string | null;
  useWebSocket: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardStore implements OnDestroy {
  private readonly webAccountService = inject(WebAccountService);
  private readonly webSocketService = inject(WebSocketService);
  private vehiclePositionSubscription?: Subscription;
  private connectionStatusSubscription?: Subscription;

  // State signals
  private readonly state = signal<DashboardState>({
    comptesWeb: [],
    realtimes: [],
    selectedCompteWeb: null,
    stats: { total: 0, valid: 0, technicalIssue: 0, moving: 0 },
    installationEvolution: [],
    granularity: 'month',
    loading: false,
    error: null,
    useWebSocket: false
  });

  // Computed selectors
  readonly comptesWeb = computed(() => Array.isArray(this.state().comptesWeb) ? this.state().comptesWeb : []);
  readonly realtimes = computed(() => Array.isArray(this.state().realtimes) ? this.state().realtimes : []);
  readonly selectedCompteWeb = computed(() => this.state().selectedCompteWeb);
  readonly stats = computed(() => this.state().stats);
  readonly installationEvolution = computed(() => Array.isArray(this.state().installationEvolution) ? this.state().installationEvolution : []);
  readonly granularity = computed(() => this.state().granularity);
  readonly loading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);

  // Actions
  loadComptesWeb() {
    this.updateState({ loading: true, error: null });
    this.webAccountService.getAllWebAccountNames().subscribe({
      next: (res: any) => {
        const comptes = res?.data || res;
        this.updateState({ comptesWeb: Array.isArray(comptes) ? comptes : [], loading: false });
      },
      error: (err) => {
        this.updateState({ loading: false, error: 'Failed to load web accounts' });
      }
    });
  }

  selectCompteWeb(compte: CompteClientWebInfoDTO | null) {
    this.updateState({ selectedCompteWeb: compte });
    if (compte) {
      this.loadRealtimes(compte.idCompteClientWeb);
      this.loadInstallationEvolution(compte.idCompteClientWeb);
    }
  }

  private loadRealtimes(idCompteWeb: number) {
    this.updateState({ loading: true, error: null });

    // Try WebSocket first if connected
    if (this.webSocketService.isConnected()) {
      this.setupWebSocketUpdates();
      // Load initial data via HTTP as fallback
      this.webAccountService.getAllLastTram(idCompteWeb).subscribe({
        next: (res: any) => {
          const realtimes = res?.data || res;
          this.updateState({ realtimes: Array.isArray(realtimes) ? realtimes : [], loading: false, useWebSocket: true });
          this.calculateStats();
        },
        error: (err) => {
          this.updateState({ loading: false, error: 'Failed to load real-time data' });
        }
      });
    } else {
      // Use HTTP polling
      this.webSocketService.connect();
      this.webAccountService.getAllLastTram(idCompteWeb).subscribe({
        next: (res: any) => {
          const realtimes = res?.data || res;
          this.updateState({ realtimes: Array.isArray(realtimes) ? realtimes : [], loading: false, useWebSocket: false });
          this.calculateStats();
        },
        error: (err) => {
          this.updateState({ loading: false, error: 'Failed to load real-time data' });
        }
      });
    }
  }

  private setupWebSocketUpdates() {
    // Subscribe to vehicle position updates with debouncing
    this.vehiclePositionSubscription = this.webSocketService.getVehiclePositions()
      .pipe(
        debounceTime(REALTIME_CONSTANTS.UPDATE_DEBOUNCE_MS),
        distinctUntilChanged((prev, curr) => 
          JSON.stringify(prev) === JSON.stringify(curr)
        )
      )
      .subscribe({
        next: (realtimes) => {
          this.updateState({ realtimes, loading: false });
          this.calculateStats();
        },
        error: (err) => {
          // Fall back to HTTP polling on error
          this.updateState({ useWebSocket: false });
          const compte = this.state().selectedCompteWeb;
          if (compte) {
            this.loadRealtimes(compte.idCompteClientWeb);
          }
        }
      });

    // Monitor connection status
    this.connectionStatusSubscription = this.webSocketService.getConnectionStatus()
      .subscribe(isConnected => {
        if (!isConnected && this.state().useWebSocket) {
          this.updateState({ useWebSocket: false });
        }
      });
  }

  private loadInstallationEvolution(idCompteWeb: number) {
    const currentGranularity = this.state().granularity;
    this.webAccountService.getDeviceInstallationEvolution(idCompteWeb, currentGranularity).subscribe({
      next: (res: any) => {
        const evolutionData = res?.data || res;
        this.updateState({ installationEvolution: Array.isArray(evolutionData) ? evolutionData : [] });
      },
      error: (err) => {
      }
    });
  }

  setGranularity(granularity: string) {
    this.updateState({ granularity });
    const compte = this.state().selectedCompteWeb;
    if (compte) {
      this.loadInstallationEvolution(compte.idCompteClientWeb);
    }
  }

  private calculateStats() {
    const data = this.state().realtimes;
    const stats: DashboardStats = {
      total: data.length,
      valid: data.filter(t => t.status === 'VALID').length,
      technicalIssue: data.filter(t => t.status === 'TECHNICAL_ISSUE').length,
      moving: data.filter(t => t.speed > 0).length
    };
    this.updateState({ stats });
  }

  clearError() {
    this.updateState({ error: null });
  }

  private updateState(partial: Partial<DashboardState>) {
    this.state.update(current => ({ ...current, ...partial }));
  }

  ngOnDestroy() {
    this.vehiclePositionSubscription?.unsubscribe();
    this.connectionStatusSubscription?.unsubscribe();
  }
}
