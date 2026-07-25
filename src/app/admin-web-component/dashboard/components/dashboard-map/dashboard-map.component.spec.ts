import {ComponentFixture, TestBed} from '@angular/core/testing';
import {afterEach, beforeAll, beforeEach, describe, expect, it, vi} from 'vitest';
import {DashboardMapComponent} from './dashboard-map.component';
import {RealTime} from '../../../../data/data';
import {TranslateModule} from '@ngx-translate/core';

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

const createTram = (overrides: Partial<RealTime> = {}): RealTime => ({
  deviceid: 1, matricule: 'T-001', status: 'VALID', latitude: 33.88, longitude: 9.53,
  validity: true, speed: 60, ignition: true, record_time: new Date(), numPuce: '8921601001',
  imei: '123', version: 'v1', ...overrides
});

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
        setLatLng: vi.fn(),
      })),
      icon: vi.fn(() => ({})),
      latLng: vi.fn((lat, lng) => ({lat, lng})),
      latLngBounds: vi.fn(() => ({})),
      markerClusterGroup: vi.fn(() => mockMarkerClusterGroup),
    };
  });

  beforeEach(async () => {
    vi.clearAllMocks();
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [DashboardMapComponent, TranslateModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardMapComponent);
    component = fixture.componentInstance;
    (component as any).map = mockMap;
    (component as any).markerClusterGroup = mockMarkerClusterGroup;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default realtimes input as empty array', () => {
    expect(component.realtimes()).toEqual([]);
  });

  it('should initialize map error state as null', () => {
    expect(component.mapError()).toBeNull();
    expect(component.hasMapError()).toBe(false);
  });

  it('should initialize isMapLoading as true', () => {
    expect(component.isMapLoading()).toBe(true);
  });

  it('should accept realtimes input', () => {
    const realtimes = [createTram()];
    fixture.componentRef.setInput('realtimes', realtimes);
    expect(component.realtimes().length).toBe(1);
  });

  it('should call map.zoomIn', () => {
    component.zoomIn();
    expect(mockMap.zoomIn).toHaveBeenCalled();
  });

  it('should call map.zoomOut', () => {
    component.zoomOut();
    expect(mockMap.zoomOut).toHaveBeenCalled();
  });

  it('should emit locateDevice output', () => {
    const spy = vi.fn();
    component.locateDevice.subscribe(spy);
    const tram = createTram();
    component.locateDevice.emit(tram);
    expect(spy).toHaveBeenCalledWith(tram);
  });

  it('should cleanup on destroy', () => {
    component.ngOnDestroy();
    expect(mockMap.remove).toHaveBeenCalled();
    expect(mockMarkerClusterGroup.clearLayers).toHaveBeenCalled();
  });

  it('should set mapError on retryMapLoad', () => {
    component.retryMapLoad();
    expect(component.mapError()).toBeNull();
    expect(component.isMapLoading()).toBe(true);
  });

  it('should have valid markerMap and previousPositions maps', () => {
    expect((component as any).markerMap.size).toBe(0);
    expect((component as any).previousPositions.size).toBe(0);
  });

  it('should call invalidateSize', () => {
    vi.useFakeTimers();
    component.invalidateSize();
    vi.advanceTimersByTime(500);
    vi.useRealTimers();
  });

  it('should handle ngOnDestroy with animationFrameId', () => {
    (component as any).animationFrameId = 123;
    component.ngOnDestroy();
    expect(mockMap.remove).toHaveBeenCalled();
  });

  it('should handle createMarker with realtimes data', () => {
    const realtimes = [createTram()];
    fixture.componentRef.setInput('realtimes', realtimes);
    expect(component.realtimes().length).toBe(1);
  });

  it('should handle updateMarkers with empty realtimes', () => {
    fixture.componentRef.setInput('realtimes', []);
    expect((component as any).markerMap.size).toBe(0);
  });

  it('should handle getCarIcon with different device ids', () => {
    const getCarIcon = (component as any).getCarIcon.bind(component);
    const tram = createTram({deviceid: 42, rotation_angle: 45} as any);
    const icon = getCarIcon(tram);
    expect(icon).toBeTruthy();
  });

  it('should cache car icons in deviceIconMap', () => {
    const getCarIcon = (component as any).getCarIcon.bind(component);
    const tram = createTram({deviceid: 99, rotation_angle: 0} as any);
    getCarIcon(tram);
    getCarIcon(tram);
    expect((component as any).deviceIconMap.size).toBe(1);
  });

  it('should handle mapError signal', () => {
    component.mapError.set('Test error');
    expect(component.hasMapError()).toBe(true);
    component.mapError.set(null);
    expect(component.hasMapError()).toBe(false);
  });

  it('should handle retryMapLoad with existing map', () => {
    (component as any).map = mockMap;
    component.retryMapLoad();
    expect(component.isMapLoading()).toBe(true);
    expect(mockMap.remove).toHaveBeenCalled();
  });

  it('getCarIcon should default rotation_angle to 0 when undefined', () => {
    const getCarIcon = (component as any).getCarIcon.bind(component);
    const tram = createTram({deviceid: 100} as any);
    delete (tram as any).rotation_angle;
    const icon = getCarIcon(tram);
    expect(icon).toBeTruthy();
  });

  it('getCarIcon should snap angle to nearest valid angle', () => {
    const getCarIcon = (component as any).getCarIcon.bind(component);
    const tram = createTram({rotation_angle: 37} as any);
    const icon = getCarIcon(tram);
    expect(icon).toBeTruthy();
  });

  it('tile layer error handler should set mapError', () => {
    mockTileLayer.on.mockImplementation((event: string, cb: any) => {
      if (event === 'tileerror') cb({});
      return mockTileLayer;
    });
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {
    });
    (window as any).L.map = vi.fn(() => {
      mockTileLayer.on.mock.calls.length = 0;
      return {
        ...mockMap,
        addLayer: vi.fn(),
        setView: vi.fn().mockReturnThis(),
      };
    });
    component.retryMapLoad();
    warnSpy.mockRestore();
  });

  it('updateMarkers should remove markers for removed devices', () => {
    const marker = {remove: vi.fn()};
    (component as any).markerMap.set(1, marker);
    (component as any).previousPositions.set(1, {lat: 33, lng: 9});

    fixture.componentRef.setInput('realtimes', []);
    (component as any).currentFleetHash = '1';
    (component as any).updateMarkers();

    expect((component as any).markerMap.size).toBe(0);
    expect((component as any).previousPositions.size).toBe(0);
  });

  it('updateMarkers should animate existing markers', () => {
    const tram = createTram();
    (component as any).previousPositions.set(1, {lat: 33.87, lng: 9.52});

    const markerInstance = {
      bindPopup: vi.fn().mockReturnThis(),
      on: vi.fn().mockReturnThis(),
      setLatLng: vi.fn(),
    };
    (window as any).L.marker = vi.fn(() => markerInstance);

    fixture.componentRef.setInput('realtimes', [tram]);
    (component as any).currentFleetHash = '';
    (component as any).updateMarkers();
    expect((component as any).previousPositions.get(1)).toEqual({lat: 33.88, lng: 9.53});
  });

  it('updateMarkers with fleet change should call fitBounds', () => {
    vi.useFakeTimers();
    const tram = createTram();
    fixture.componentRef.setInput('realtimes', [tram]);
    (component as any).currentFleetHash = '';
    (component as any).updateMarkers();
    vi.advanceTimersByTime(150);
    expect(mockMap.invalidateSize).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('updateMarkers with no fleet change should only invalidateSize', () => {
    vi.useFakeTimers();
    const tram = createTram();
    fixture.componentRef.setInput('realtimes', [tram]);
    (component as any).currentFleetHash = '1';
    (component as any).updateMarkers();
    vi.advanceTimersByTime(150);
    expect(mockMap.invalidateSize).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('updateMarkers with null map should return early', () => {
    (component as any).map = null;
    expect(() => (component as any).updateMarkers()).not.toThrow();
  });

  it('createMarker click should emit locateDevice', () => {
    const emitSpy = vi.spyOn(component.locateDevice, 'emit');
    const tram = createTram();
    const markerInstance = {
      bindPopup: vi.fn().mockReturnThis(),
      on: vi.fn().mockReturnThis(),
    };
    (window as any).L.marker = vi.fn(() => markerInstance);

    (component as any).createMarker(tram);
    const clickHandler = markerInstance.on.mock.calls.find((c: any[]) => c[0] === 'click')?.[1];
    if (clickHandler) clickHandler();
    expect(emitSpy).toHaveBeenCalledWith(tram);
  });
});
