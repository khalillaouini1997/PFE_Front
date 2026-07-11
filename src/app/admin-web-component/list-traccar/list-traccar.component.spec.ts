import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { ListTraccarComponent } from './list-traccar.component';
import { TraccarService } from 'src/app/service/traccar.service';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationService } from 'primeng/api';

describe('ListTraccarComponent', () => {
  let component: ListTraccarComponent;
  let fixture: ComponentFixture<ListTraccarComponent>;
  let traccarService: any;
  let toastr: any;
  let translate: any;

  beforeEach(async () => {
    traccarService = {
      getLisTraccar: vi.fn().mockReturnValue(of({ data: [] })),
      createDevice: vi.fn().mockReturnValue(of({ data: { id: 1 } })),
      updateDevice: vi.fn().mockReturnValue(of({ data: { id: 1 } })),
      deleteDevice: vi.fn().mockReturnValue(of({ data: null })),
    };
    toastr = { warning: vi.fn(), error: vi.fn(), success: vi.fn() };
    translate = { instant: vi.fn((key: string) => key) };

    await TestBed.configureTestingModule({
      imports: [ListTraccarComponent, TranslateModule.forRoot()],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: TraccarService, useValue: traccarService },
        { provide: ToastrService, useValue: toastr },
        { provide: TranslateService, useValue: translate },
        ConfirmationService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ListTraccarComponent);
    component = fixture.componentInstance;
    component.ngOnInit();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should call getLisTraccar on init', () => {
    const spy = vi.spyOn(component, 'getLisTraccar');
    component.ngOnInit();
    expect(spy).toHaveBeenCalled();
  });

  it('should load traccar data on getLisTraccar', () => {
    const mockData = [{ id: 1, name: 'device1' }, { id: 2, name: 'device2' }];
    traccarService.getLisTraccar.mockReturnValue(of({ data: mockData }));
    component.getLisTraccar();
    expect(component.traccarDtos).toEqual(mockData);
    expect(component.totalRecords).toBe(2);
    expect(component.loading).toBe(false);
  });

  it('should handle empty data', () => {
    traccarService.getLisTraccar.mockReturnValue(of({ data: [] }));
    component.getLisTraccar();
    expect(component.traccarDtos).toEqual([]);
    expect(component.totalRecords).toBe(0);
    expect(toastr.warning).toHaveBeenCalled();
  });

  it('should handle data with content wrapper', () => {
    const mockData = [{ id: 1 }];
    traccarService.getLisTraccar.mockReturnValue(of({ data: { content: mockData } }));
    component.getLisTraccar();
    expect(component.traccarDtos).toEqual(mockData);
    expect(component.totalRecords).toBe(1);
  });

  it('should handle direct array response', () => {
    const mockData = [{ id: 1 }];
    traccarService.getLisTraccar.mockReturnValue(of(mockData));
    component.getLisTraccar();
    expect(component.traccarDtos).toEqual(mockData);
    expect(component.totalRecords).toBe(1);
  });

  it('should handle error', () => {
    traccarService.getLisTraccar.mockReturnValue(throwError(() => new Error('fail')));
    component.getLisTraccar();
    expect(component.loading).toBe(false);
    expect(toastr.error).toHaveBeenCalled();
  });

  it('should search with keyword', () => {
    const spy = vi.spyOn(component, 'getLisTraccar');
    component.searchWebAccount('test');
    expect(spy).toHaveBeenCalledWith('test');
  });

  it('should search with empty keyword by default', () => {
    const spy = vi.spyOn(component, 'getLisTraccar');
    component.searchWebAccount();
    expect(spy).toHaveBeenCalledWith('');
  });

  it('should clear data on destroy', () => {
    component.traccarDtos = [{ id: 1 }] as any;
    component.totalRecords = 1;
    component.ngOnDestroy();
    expect(component.traccarDtos).toEqual([]);
    expect(component.totalRecords).toBe(0);
  });

  it('should have form with required name and imei', () => {
    expect(component.deviceForm).toBeTruthy();
    expect(component.deviceForm.get('name')?.hasError('required')).toBe(true);
    expect(component.deviceForm.get('imei')?.hasError('required')).toBe(true);
  });

  it('openAddDialog should set editMode false and showDialog true', () => {
    component.openAddDialog();
    expect(component.editMode).toBe(false);
    expect(component.selectedDevice).toBeNull();
    expect(component.showDialog).toBe(true);
    expect(component.deviceForm.get('name')?.value).toBe('');
    expect(component.deviceForm.get('imei')?.value).toBe('');
  });

  it('openEditDialog should set editMode true and patch form', () => {
    const device = { id: 1, name: 'Test', imei: 'IMEI123', category: 'Car', phone: null, model: null, contact: null } as any;
    component.openEditDialog(device);
    expect(component.editMode).toBe(true);
    expect(component.selectedDevice).toBe(device);
    expect(component.showDialog).toBe(true);
    expect(component.deviceForm.get('name')?.value).toBe('Test');
    expect(component.deviceForm.get('imei')?.value).toBe('IMEI123');
    expect(component.deviceForm.get('category')?.value).toBe('Car');
    expect(component.deviceForm.get('phone')?.value).toBe('');
  });

  it('saveDevice with invalid form should mark all as touched', () => {
    component.openAddDialog();
    component.saveDevice();
    expect(component.saving).toBe(false);
    expect(component.deviceForm.get('name')?.touched).toBe(true);
  });

  it('saveDevice in add mode should call createDevice', () => {
    traccarService.createDevice.mockReturnValue(of({ data: { id: 1 } }));
    component.openAddDialog();
    component.deviceForm.patchValue({ name: 'New', imei: 'IMEI1' });
    component.saveDevice();
    expect(traccarService.createDevice).toHaveBeenCalled();
  });

  it('saveDevice in edit mode should call updateDevice', () => {
    traccarService.updateDevice.mockReturnValue(of({ data: { id: 1 } }));
    const device = { id: 5, name: 'Old', imei: 'IMEI5' } as any;
    component.openEditDialog(device);
    component.deviceForm.patchValue({ name: 'Updated', imei: 'IMEI5' });
    component.saveDevice();
    expect(traccarService.updateDevice).toHaveBeenCalledWith(5, expect.any(Object));
  });

  it('saveDevice error should reset saving', () => {
    traccarService.createDevice.mockReturnValue(throwError(() => new Error('fail')));
    component.openAddDialog();
    component.deviceForm.patchValue({ name: 'X', imei: 'Y' });
    component.saveDevice();
    expect(component.saving).toBe(false);
  });

  it('confirmDelete should invoke confirmationService.confirm', () => {
    const svc = (component as any).confirmationService;
    const confirmSpy = vi.spyOn(svc, 'confirm');
    const device = { id: 3 } as any;
    component.confirmDelete(device);
    expect(confirmSpy).toHaveBeenCalled();
  });

  it('confirmDelete accept callback should call deleteDevice', () => {
    traccarService.deleteDevice.mockReturnValue(of({ data: null }));
    const svc = (component as any).confirmationService;
    let capturedConfig: any;
    vi.spyOn(svc, 'confirm').mockImplementation((config: any) => { capturedConfig = config; return svc; });

    const device = { id: 7 } as any;
    component.confirmDelete(device);
    capturedConfig.accept();
    expect(traccarService.deleteDevice).toHaveBeenCalledWith(7);
  });

  it('deleteDevice success should refresh list', () => {
    traccarService.deleteDevice.mockReturnValue(of({ data: null }));
    const spy = vi.spyOn(component, 'getLisTraccar');
    component.deleteDevice(1);
    expect(spy).toHaveBeenCalled();
  });

  it('deleteDevice error should not crash', () => {
    traccarService.deleteDevice.mockReturnValue(throwError(() => new Error('fail')));
    expect(() => component.deleteDevice(1)).not.toThrow();
  });
});
