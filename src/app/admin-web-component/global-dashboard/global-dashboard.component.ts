import {ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router, RouterModule} from "@angular/router";
import {AuthService} from 'src/app/service/auth.service';
import {WebAccountService} from "src/app/service/web-account.service";
import {saveAs as importedSaveAs} from 'file-saver';
import {TranslateModule} from '@ngx-translate/core';
import {GlobalDashboardStore} from 'src/app/shared/stores';
import {GlobalChartsComponent} from './components/global-charts/global-charts.component';
import {GlobalKpiComponent} from './components/global-kpi/global-kpi.component';
import {DashboardMapComponent} from '../dashboard/components/dashboard-map/dashboard-map.component';

@Component({
  selector: 'app-global-dashboard',
  standalone: true,
  templateUrl: './global-dashboard.component.html',
  styleUrls: ['./global-dashboard.component.css'],
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    GlobalChartsComponent,
    GlobalKpiComponent,
    DashboardMapComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GlobalDashboardComponent implements OnInit, OnDestroy {
  readonly store = inject(GlobalDashboardStore);
  readonly realtimes = this.store.summaries;
  readonly stats = this.store.stats;
  readonly loading = this.store.loading;
  protected readonly Math = Math;
  private readonly authService = inject(AuthService);
  private readonly webAccountService = inject(WebAccountService);
  private readonly router = inject(Router);

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.store.init();
    } else {
      this.router.navigate(['/error']);
    }
  }

  ngOnDestroy() {
    this.store.ngOnDestroy();
  }

  onExport() {
    if (!this.realtimes().length) return;
    this.webAccountService.exportLastTram(this.realtimes() as unknown as any[])
      .subscribe(blob => importedSaveAs(blob, "Rapport global de la flotte.xlsx"));
  }

  onRefresh() {
    this.store.refresh();
  }
}
