import { ChangeDetectorRef, Component, OnInit, OnDestroy, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from "@angular/router";
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { RealTime } from 'src/app/data/data';
import { AuthService } from 'src/app/service/auth.service';
import { WebAccountService } from "src/app/service/web-account.service";
import { saveAs as importedSaveAs } from 'file-saver';
import { TableModule } from 'primeng/table';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DashboardMapComponent } from './components/dashboard-map/dashboard-map.component';
import { DashboardChartsComponent } from './components/dashboard-charts/dashboard-charts.component';
import { DashboardKpiComponent } from './components/dashboard-kpi/dashboard-kpi.component';

import { STORAGE_KEYS } from 'src/app/shared/constants';
import { DashboardStore } from 'src/app/shared/stores';

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
    BadgeModule,
    ButtonModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    TranslateModule,
    DashboardMapComponent,
    DashboardChartsComponent,
    DashboardKpiComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit, OnDestroy {
  protected readonly Math = Math;

  // ── Store ────────────────────────────────────────────────────────────────
  readonly store = inject(DashboardStore);

  // ── Form & UI state ───────────────────────────────────────────────────────
  dashboardForm!: FormGroup;
  fullscreenMap = signal<boolean>(false);
  mapOverlayOpen = false;


  // ── DI ───────────────────────────────────────────────────────────────────
  private readonly authService      = inject(AuthService);
  private readonly webAccountService = inject(WebAccountService);
  private readonly router           = inject(Router);
  private readonly fb               = inject(FormBuilder);
  private readonly route            = inject(ActivatedRoute);
  private readonly cdr              = inject(ChangeDetectorRef);
  private readonly translate        = inject(TranslateService);

  // ── Computed signals from store ─────────────────────────────────────────────
  readonly comptesWeb = this.store.comptesWeb;
  readonly realtimes = this.store.realtimes;
  readonly stats = this.store.stats;
  readonly loading = this.store.loading;

  // ── Computed signal for data loaded state ─────────────────────────────────────
  readonly hasData = computed(() => this.realtimes().length > 0);

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
    this.dashboardForm = this.fb.group({ compteWeb: [null] });
  }

  // ── Map helpers ───────────────────────────────────────────────────────────
  openExternalMap() {
    const urlTree   = this.router.createUrlTree(['/adminWeb/dashboard'], { queryParams: { fullscreenMap: 'true' } });
    const serialized = this.router.serializeUrl(urlTree);
    globalThis.open(`${globalThis.location.origin}${serialized}`, '_blank');
  }

  toggleMapOverlay() {
    this.mapOverlayOpen = !this.mapOverlayOpen;
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
