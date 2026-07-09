import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DashboardChartsComponent } from './dashboard-charts.component';
import { TranslateService } from '@ngx-translate/core';
import { DashboardStore } from '../../../../shared/stores';

describe('DashboardChartsComponent', () => {
  let component: DashboardChartsComponent;
  let fixture: ComponentFixture<DashboardChartsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardChartsComponent],
      providers: [
        { provide: TranslateService, useValue: { instant: (key: string) => key } },
        { provide: DashboardStore, useValue: { setGranularity: vi.fn() } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardChartsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default input values', () => {
    expect(component.realtimes()).toEqual([]);
    expect(component.stats()).toEqual({ total: 0, valid: 0, technicalIssue: 0, moving: 0 });
    expect(component.installationEvolution()).toEqual([]);
    expect(component.granularity()).toBe('month');
  });
});
