import {ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit, signal} from '@angular/core';
import {CommonModule, DatePipe, DecimalPipe} from '@angular/common';
import {ActivatedRoute, Router, RouterModule} from "@angular/router";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {AuthService} from 'src/app/service/auth.service';
import {WebAccountService} from "src/app/service/web-account.service";
import {saveAs as importedSaveAs} from 'file-saver';
import {TableModule} from 'primeng/table';
import {TranslateModule} from '@ngx-translate/core';
import {DashboardMapComponent} from './components/dashboard-map/dashboard-map.component';
import {DashboardChartsComponent} from './components/dashboard-charts/dashboard-charts.component';
import {DashboardKpiComponent} from './components/dashboard-kpi/dashboard-kpi.component';

import {STORAGE_KEYS} from 'src/app/shared/constants';
import {DashboardStore} from 'src/app/shared/stores';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    DecimalPipe,
    DatePipe,
    TableModule,
    TranslateModule,
    DashboardMapComponent,
    DashboardChartsComponent,
    DashboardKpiComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit, OnDestroy {
  // ── Store ────────────────────────────────────────────────────────────────
  readonly store = inject(DashboardStore);
  // ── Form & UI state ───────────────────────────────────────────────────────
  dashboardForm!: FormGroup;
  fullscreenMap = signal<boolean>(false);
  // ── Computed signals from store ─────────────────────────────────────────────
  readonly comptesWeb = this.store.comptesWeb;
  readonly realtimes = this.store.realtimes;
  readonly stats = this.store.stats;
  readonly loading = this.store.loading;
  protected readonly Math = Math;
  // ── DI ───────────────────────────────────────────────────────────────────
  private readonly authService = inject(AuthService);
  private readonly webAccountService = inject(WebAccountService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  ngOnInit() {
    this.initForms();

    this.route.queryParams.subscribe(params => {
      this.fullscreenMap.set(params['fullscreenMap'] === 'true');
    });

    if (localStorage.getItem(STORAGE_KEYS.IS_RELOADING) === 'true') {
      localStorage.removeItem(STORAGE_KEYS.IS_RELOADING);
      globalThis.location.reload();
      return;
    }

    if (this.authService.isAuthenticated()) {
      this.store.loadComptesWeb();
    } else {
      this.router.navigate(['/error']);
    }
  }

  ngOnDestroy() {
    this.store.ngOnDestroy();
  }

  // ── Forms ─────────────────────────────────────────────────────────────────
  initForms() {
    this.dashboardForm = this.fb.group({compteWeb: [null]});
  }

  // ── Utilities ─────────────────────────────────────────────────────────────
  diffHours(date: Date): number {
    return (Date.now() - new Date(date).getTime()) / (60 * 60 * 1000);
  }

  // ── Data loading ──────────────────────────────────────────────────────────
  getAllLastTramByCompteWeb() {
    const selectedCompte = this.dashboardForm.get('compteWeb')?.value;
    if (!selectedCompte?.idCompteClientWeb) return;

    this.store.selectCompteWeb(selectedCompte);
  }

  onExport() {
    if (!this.realtimes().length) return;
    this.webAccountService.exportLastTram(this.realtimes() as unknown as any[])
      .subscribe(blob => importedSaveAs(blob, "Repport d'état des boitiers.xlsx"));
  }
}
