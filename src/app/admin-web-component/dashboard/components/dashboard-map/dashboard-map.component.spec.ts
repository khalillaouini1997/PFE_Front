import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi, describe, it, expect, beforeEach, afterEach, beforeAll } from 'vitest';
import { DashboardMapComponent } from './dashboard-map.component';
import { RealTime } from '../../../../data/data';

const mockMap = {
  setView: vi.fn().mockReturnThis(),
  addLayer: vi.fn(),
  remove: vi.fn(),
  invalidateSize: vi.fn(),
  zoomIn: vi.fn(),
  zoomOut: vi.fn(),
  fitBounds: vi.fn()
};

const mockTileLayer = {
  on: vi.fn(),
  addTo: vi.fn()
};

const mockMarkerClusterGroup = {
  addLayer: vi.fn(),
  removeLayer: vi.fn(),
  clearLayers: vi.fn()
};

describe('DashboardMapComponent', () => {
  let component: DashboardMapComponent;
  let fixture: ComponentFixture<DashboardMapComponent>;

  beforeAll(() => {
    (window as any).L = {
      map: vi.fn(() => mockMap),
      tileLayer: vi.fn(() => mockTileLayer),
      marker: vi.fn(() => ({
        bindPopup: vi.fn().mockReturnThis(),
        on: vi.fn().mockReturnThis(),
      })),
      icon: vi.fn(() => ({})),
      latLngBounds: vi.fn(() => ({})),
      markerClusterGroup: vi.fn(() => mockMarkerClusterGroup),
    };
  });

  beforeEach(async () => {
    vi.clearAllMocks();
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [DashboardMapComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardMapComponent);
    component = fixture.componentInstance;
    (component as any).map = { setView: vi.fn(), addLayer: vi.fn() };
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should have default realtimes input as empty array', () => {
    fixture.detectChanges();
    expect(component.realtimes()).toEqual([]);
  });

  it('should initialize map error state as null', () => {
    fixture.detectChanges();
    expect(component.mapError()).toBeNull();
    expect(component.hasMapError()).toBe(false);
  });

  it('should initialize isMapLoading as true', () => {
    fixture.detectChanges();
    expect(component.isMapLoading()).toBe(true);
  });

  it('should accept realtimes input', () => {
    const realtimes: RealTime[] = [
      { deviceid: 1, matricule: 'T-001', status: 'VALID', latitude: 33.88, longitude: 9.53, validity: true, speed: 60, ignition: true, record_time: new Date(), numPuce: '8921601001', imei: '123', version: 'v1' }
    ];
    fixture.componentRef.setInput('realtimes', realtimes);
    fixture.detectChanges();

    expect(component.realtimes().length).toBe(1);
  });

  it('should call map.zoomIn', () => {
    fixture.detectChanges();
    component.zoomIn();
    expect(mockMap.zoomIn).toHaveBeenCalled();
  });

  it('should call map.zoomOut', () => {
    fixture.detectChanges();
    component.zoomOut();
    expect(mockMap.zoomOut).toHaveBeenCalled();
  });

  it('should emit locateDevice output', () => {
    const spy = vi.fn();
    component.locateDevice.subscribe(spy);
    fixture.detectChanges();

    const tram: RealTime = { deviceid: 1, matricule: 'T-001', status: 'VALID', latitude: 33.88, longitude: 9.53, validity: true, speed: 60, ignition: true, record_time: new Date(), numPuce: '8921601001', imei: '123', version: 'v1' };
    component.locateDevice.emit(tram);
    expect(spy).toHaveBeenCalledWith(tram);
  });

  it('should cleanup on destroy', () => {
    fixture.detectChanges();
    component.ngOnDestroy();
    expect(mockMap.remove).toHaveBeenCalled();
    expect(mockMarkerClusterGroup.clearLayers).toHaveBeenCalled();
  });

  it('should set mapError on retryMapLoad', () => {
    fixture.detectChanges();
    component.retryMapLoad();
    expect(component.mapError()).toBeNull();
    expect(component.isMapLoading()).toBe(true);
  });

  it('should have valid markerMap and previousPositions maps', () => {
    fixture.detectChanges();
    expect((component as any).markerMap.size).toBe(0);
    expect((component as any).previousPositions.size).toBe(0);
  });
});
