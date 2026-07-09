import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { ListTraccarComponent } from './list-traccar.component';
import { TraccarService } from 'src/app/service/traccar.service';
import { ToastrService } from 'ngx-toastr';

describe('ListTraccarComponent', () => {
  let component: ListTraccarComponent;
  let fixture: ComponentFixture<ListTraccarComponent>;
  let traccarService: { getLisTraccar: ReturnType<typeof vi.fn> };
  let toastr: { warning: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    traccarService = { getLisTraccar: vi.fn().mockReturnValue(of({ data: [] })) };
    toastr = { warning: vi.fn(), error: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ListTraccarComponent, TranslateModule.forRoot()],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: TraccarService, useValue: traccarService },
        { provide: ToastrService, useValue: toastr },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ListTraccarComponent);
    component = fixture.componentInstance;
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

  it('should set loading to true while fetching', () => {
    traccarService.getLisTraccar.mockReturnValue(of({ data: [{ id: 1 }] }));
    component.getLisTraccar();
    // After subscribe completes, loading should be false
    expect(component.loading).toBe(false);
  });
});
