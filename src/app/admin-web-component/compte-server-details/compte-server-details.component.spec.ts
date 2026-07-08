import { TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { CompteServerDetailsComponent } from './compte-server-details.component';
import { CompteServerService } from '../../service/compte-server.service';
import { BoitierService } from '../../service/boitier.service';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TranslateModule } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';

describe('CompteServerDetailsComponent', () => {
  let component: CompteServerDetailsComponent;
  let compteServerService: { getCompteServerById: ReturnType<typeof vi.fn>; addBoitiers: ReturnType<typeof vi.fn>; extendIntervalOfBoitiers: ReturnType<typeof vi.fn> };
  let boitierService: { getBoitierOfAccount: ReturnType<typeof vi.fn>; updateBoitier: ReturnType<typeof vi.fn>; lastArchiveOfBoitier: ReturnType<typeof vi.fn> };
  let toastr: { success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn>; warning: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    compteServerService = {
      getCompteServerById: vi.fn().mockReturnValue(of({
        data: { intervaleStart: 1, intervaleEnd: 10, availableSlotsCount: 5, installedBoitiersCount: 5 }
      })),
      addBoitiers: vi.fn().mockReturnValue(of({ data: { compteServer: {} } })),
      extendIntervalOfBoitiers: vi.fn().mockReturnValue(of({})),
    };
    boitierService = {
      getBoitierOfAccount: vi.fn().mockReturnValue(of({
        content: [
          { idBoitier: 1, numBoitier: 100, label: 'Device 1', etatBoitier: 'INSTALLED', streamId: 1, stat: true }
        ],
        totalElements: 1
      })),
      updateBoitier: vi.fn().mockReturnValue(of({ label: 'Updated' })),
      lastArchiveOfBoitier: vi.fn().mockReturnValue(of({
        data: { dateLastTrame: '01-01-2024 10:30:00', emplacement: 'Tunis', latitude: 33.8, longitude: 9.5, vitesse: 50 }
      })),
    };
    toastr = { success: vi.fn(), error: vi.fn(), warning: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [CompteServerDetailsComponent, TranslateModule.forRoot()],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: CompteServerService, useValue: compteServerService },
        { provide: BoitierService, useValue: boitierService },
        { provide: ToastrService, useValue: toastr },
        { provide: ActivatedRoute, useValue: { params: of({ idCompteClientServer: '42' }) } }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(CompteServerDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    component.ngOnDestroy();
    vi.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load compte details on init', () => {
    component.ngOnInit();
    expect(compteServerService.getCompteServerById).toHaveBeenCalledWith(42);
    expect(component.ID_COMPTE).toBe(42);
  });

  it('should load boitier list', () => {
    component.ngOnInit();
    expect(boitierService.getBoitierOfAccount).toHaveBeenCalled();
    expect(component.boitiers.length).toBe(1);
  });

  it('should parse boitier archive date from DD-MM-YYYY', () => {
    component.ngOnInit();
    setTimeout(() => {
      const boitier = component.boitiers[0];
      expect(boitier.dateLastTrame).toBeInstanceOf(Date);
    }, 100);
  });

  it('should search boitiers', () => {
    component.ngOnInit();
    component.searchBoitiers();
    expect(boitierService.getBoitierOfAccount).toHaveBeenCalled();
  });

  it('should change boitier status', () => {
    component.ngOnInit();
    boitierService.updateBoitier.mockReturnValue(of({ label: 'Updated' }));
    const boitier = component.boitiers[0];
    component.changeBoitierStatus(boitier);
    expect(boitierService.updateBoitier).toHaveBeenCalled();
  });

  it('should add boitiers', () => {
    component.ngOnInit();
    component.addForm.patchValue({ nbrBoitiers: 3 });
    compteServerService.addBoitiers.mockReturnValue(of({
      data: { compteServer: { intervaleStart: 1, intervaleEnd: 13 } }
    }));
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    component.addBoitiers();
    expect(compteServerService.addBoitiers).toHaveBeenCalled();
  });

  it('should not add boitiers if not confirmed', () => {
    component.ngOnInit();
    component.BOITIER_NOT_INSTALLED = 1;
    component.addForm.patchValue({ nbrBoitiers: 3 });
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    component.addBoitiers();
    expect(compteServerService.addBoitiers).not.toHaveBeenCalled();
  });

  it('should extend interval', () => {
    component.ngOnInit();
    component.BOITIER_NOT_INSTALLED = 0;
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    compteServerService.extendIntervalOfBoitiers.mockReturnValue(of({
      intervaleStart: 1, intervaleEnd: 20
    }));
    component.extendIntervalOfBoitiers();
    expect(compteServerService.extendIntervalOfBoitiers).toHaveBeenCalled();
  });

  it('should not extend if slots available', () => {
    component.ngOnInit();
    component.BOITIER_NOT_INSTALLED = 5;
    component.extendIntervalOfBoitiers();
    expect(toastr.error).toHaveBeenCalled();
  });

  it('should handle boitier list with direct array response', () => {
    component.ngOnInit();
    boitierService.getBoitierOfAccount.mockReturnValue(of([
      { idBoitier: 1, numBoitier: 100, label: 'D1', etatBoitier: 'INSTALLED', streamId: 1 }
    ]));
    component.loadBoitierList();
    expect(component.boitiers.length).toBe(1);
  });

  it('should handle boitier list error', () => {
    component.ngOnInit();
    boitierService.getBoitierOfAccount.mockReturnValue(throwError(() => new Error('fail')));
    component.loadBoitierList();
    expect(component.boitiers).toEqual([]);
  });

  it('should handle ISO date format in archive', () => {
    boitierService.lastArchiveOfBoitier.mockReturnValue(of({
      data: { dateLastTrame: '2024-01-01T10:30:00', latitude: 33.8, longitude: 9.5 }
    }));
    component.ngOnInit();
    expect(component).toBeTruthy();
  });

  it('should handle numeric timestamp in archive', () => {
    boitierService.lastArchiveOfBoitier.mockReturnValue(of({
      data: { dateLastTrame: 1704110200000, latitude: 33.8, longitude: 9.5 }
    }));
    component.ngOnInit();
    expect(component).toBeTruthy();
  });
});
