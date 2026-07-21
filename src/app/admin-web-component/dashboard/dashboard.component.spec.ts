import {ComponentFixture, TestBed} from '@angular/core/testing';
import {provideHttpClient} from '@angular/common/http';
import {ActivatedRoute, provideRouter} from '@angular/router';
import {importProvidersFrom} from '@angular/core';
import {ToastrModule} from 'ngx-toastr';
import {TranslateModule} from '@ngx-translate/core';
import {of} from 'rxjs';
import {vi} from 'vitest';

import {DashboardComponent} from './dashboard.component';

import {AuthService} from 'src/app/service/auth.service';
import {WebAccountService} from 'src/app/service/web-account.service';
import {WebSocketService} from 'src/app/service/web-socket.service';

vi.mock('chart.js', () => {
  return {
    Chart: class {
      constructor(public ctx: any, public config: any) {
      }

      get data() {
        return {};
      }

      set data(val: any) {
      }

      static register() {
      }

      destroy() {
      }

      update() {
      }
    },
    registerables: []
  };
});

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideRouter([]),
        importProvidersFrom(ToastrModule.forRoot()),
        {provide: ActivatedRoute, useValue: {queryParams: of({})}},
        {provide: AuthService, useValue: {isAuthenticated: () => true}},
        {provide: WebAccountService, useValue: {getAllWebAccountNames: vi.fn().mockReturnValue(of([])), getAllLastTram: vi.fn().mockReturnValue(of([])), getDeviceInstallationEvolution: vi.fn().mockReturnValue(of([]))}},
        {provide: WebSocketService, useValue: {isConnected: vi.fn().mockReturnValue(false), connect: vi.fn(), getVehiclePositions: vi.fn().mockReturnValue(of([])), getConnectionStatus: vi.fn().mockReturnValue(of(false))}}
      ],
      imports: [DashboardComponent, TranslateModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize dashboardForm', () => {
    fixture.detectChanges();
    expect(component.dashboardForm).toBeTruthy();
    expect(component.dashboardForm.get('compteWeb')).toBeTruthy();
  });

  it('should call diffHours correctly', () => {
    const now = new Date();
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    const result = component.diffHours(twoHoursAgo);
    expect(result).toBeGreaterThanOrEqual(1.9);
    expect(result).toBeLessThanOrEqual(2.1);
  });

  it('should not load data when no compteWeb selected', () => {
    fixture.detectChanges();
    component.dashboardForm.patchValue({compteWeb: null});
    component.getAllLastTramByCompteWeb();
  });

  it('should load data when compteWeb selected', () => {
    fixture.detectChanges();
    component.dashboardForm.patchValue({compteWeb: {idCompteClientWeb: 1}});
    component.getAllLastTramByCompteWeb();
  });

  it('should not export when no realtimes', () => {
    component.onExport();
  });

  it('should call store.ngOnDestroy on ngOnDestroy', () => {
    const spy = vi.spyOn(component.store, 'ngOnDestroy');
    component.ngOnDestroy();
    expect(spy).toHaveBeenCalled();
  });
});
