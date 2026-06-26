import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { KpiCardComponent } from '../../../../shared/components/kpi-card/kpi-card.component';
import { GlobalDashboardStats } from '../../../../shared/stores/global-dashboard.store';

@Component({
  selector: 'app-global-kpi',
  standalone: true,
  imports: [CommonModule, TranslateModule, KpiCardComponent],
  templateUrl: './global-kpi.component.html'
})
export class GlobalKpiComponent {
  stats = input<GlobalDashboardStats>({
    totalVehicles: 0,
    valid: 0,
    technicalIssue: 0,
    nonValid: 0,
    moving: 0,
    stopped: 0,
    ignitionOn: 0,
    accountsCount: 0
  });
}
