import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { CompteClientWebInfoDTO, RealTime } from '../../data/data';
import { WebAccountService } from '../../service/web-account.service';

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
  loading: boolean;
  error: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardStore {
  private readonly webAccountService = inject(WebAccountService);

  // State signals
  private readonly state = signal<DashboardState>({
    comptesWeb: [],
    realtimes: [],
    selectedCompteWeb: null,
    stats: { total: 0, valid: 0, technicalIssue: 0, moving: 0 },
    loading: false,
    error: null
  });

  // Computed selectors
  readonly comptesWeb = computed(() => this.state().comptesWeb);
  readonly realtimes = computed(() => this.state().realtimes);
  readonly selectedCompteWeb = computed(() => this.state().selectedCompteWeb);
  readonly stats = computed(() => this.state().stats);
  readonly loading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);

  // Actions
  loadComptesWeb() {
    this.updateState({ loading: true, error: null });
    this.webAccountService.getAllWebAccountNames().subscribe({
      next: (comptes) => {
        this.updateState({ comptesWeb: comptes, loading: false });
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
    }
  }

  private loadRealtimes(idCompteWeb: number) {
    this.updateState({ loading: true, error: null });
    this.webAccountService.getAllLastTram(idCompteWeb).subscribe({
      next: (realtimes) => {
        this.updateState({ realtimes, loading: false });
        this.calculateStats();
      },
      error: (err) => {
        this.updateState({ loading: false, error: 'Failed to load real-time data' });
      }
    });
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
}
