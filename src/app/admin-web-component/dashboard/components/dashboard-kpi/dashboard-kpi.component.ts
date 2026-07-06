import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KpiCardComponent } from '../../../../shared/components/kpi-card/kpi-card.component';
import { CHART_CONSTANTS } from '../../../../shared/constants/app.constants';

@Component({
  selector: 'app-dashboard-kpi',
  standalone: true,
  imports: [CommonModule, KpiCardComponent],
  templateUrl: './dashboard-kpi.component.html',
  styleUrls: ['./dashboard-kpi.component.css']
})
export class DashboardKpiComponent {
  stats = input<{ total: number; valid: number; technicalIssue: number; moving: number }>({
    total: 0,
    valid: 0,
    technicalIssue: 0,
    moving: 0
  });
}
