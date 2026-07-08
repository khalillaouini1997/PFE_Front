import { TestBed } from '@angular/core/testing';
import { ArchiveComponent } from './archive.component';
import { BoitierService } from '../../service/boitier.service';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

describe('ArchiveComponent', () => {
  let component: ArchiveComponent;
  let boitierService: { getArchiveOfBoitier: ReturnType<typeof vi.fn>; getRaws: ReturnType<typeof vi.fn>; getBoitierAnalysis: ReturnType<typeof vi.fn> };
  let location: { back: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    boitierService = {
      getArchiveOfBoitier: vi.fn().mockReturnValue(of([
        { date: '01-01-2024 10:30:00', trame_id: 1, latitude: 33.88, longitude: 9.53, speed: 50, temp: 25, ignition: true, rpm: 2000, fuel_rate: 5, odo: 1000, satInView: 8, signal: 90, heading: 180, charger: 1, x: 0, y: 0, z: 0, idDevice: 1 }
      ])),
      getRaws: vi.fn().mockReturnValue(of({ data: { raws: [{ gprmc: '$GPRMC', idTram: 1 }], count: 1 } })),
      getBoitierAnalysis: vi.fn().mockReturnValue(of({
        healthScore: 85, anomalyRate: 5, uptimePercentage: 99, anomalyCount: 2,
        structuralAnomalies: 1, logicalAnomalies: 1, mlAnomalies: 0,
        prediction: 'Healthy', topAnomalyTypes: { SPEED_ANOMALY: 2, GPS_LOST: 1 }
      })),
    };
    location = { back: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ArchiveComponent, TranslateModule.forRoot()],
      providers: [
        { provide: BoitierService, useValue: boitierService },
        { provide: Location, useValue: location },
        { provide: ActivatedRoute, useValue: { params: of({ numBoitier: '123' }) } }
      ]
    }).compileComponents();

    component = TestBed.inject(ArchiveComponent);
    component.ngOnInit();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set numBoitier from route params', () => {
    expect(component.numBoitier()).toBe(123);
  });

  it('should load archives on init', () => {
    expect(boitierService.getArchiveOfBoitier).toHaveBeenCalledWith(123, 200);
    expect(component.archives().length).toBe(1);
  });

  it('should parse archive dates from DD-MM-YYYY format', () => {
    const archive = component.archives()[0];
    expect(archive.date).toBeInstanceOf(Date);
  });

  it('should load raws', () => {
    component.getAllRaws();
    expect(boitierService.getRaws).toHaveBeenCalledWith(123, 200);
    expect(component.rawData().raws.length).toBe(1);
  });

  it('should load AI analysis', () => {
    component.getAiAnalysis();
    expect(component.isAnalyzing()).toBe(false);
    expect(component.analysisData()).toBeTruthy();
    expect(component.analysisData()!.healthScore).toBe(85);
  });

  it('should handle analysis error', () => {
    boitierService.getBoitierAnalysis.mockReturnValue(of(null));
    component.getAiAnalysis();
    expect(component.isAnalyzing()).toBe(false);
  });

  it('should change days', () => {
    component.changeDays(1000);
    expect(component.selectedLimit).toBe(1000);
  });

  it('should get anomaly types', () => {
    component.getAiAnalysis();
    const types = component.getAnomalyTypes();
    expect(types.length).toBe(2);
    expect(types[0].name).toBe('SPEED_ANOMALY');
    expect(types[0].count).toBe(2);
  });

  it('should get top anomaly', () => {
    component.getAiAnalysis();
    const top = component.getTopAnomaly();
    expect(top).toBeTruthy();
    expect(top!.name).toBe('SPEED_ANOMALY');
  });

  it('should return null for top anomaly when no data', () => {
    expect(component.getTopAnomaly()).toBeNull();
  });

  it('should return empty anomaly types when no data', () => {
    expect(component.getAnomalyTypes()).toEqual([]);
  });

  it('should go back', () => {
    component.back();
    expect(location.back).toHaveBeenCalled();
  });

  it('should use custom limit from form', () => {
    component.archiveForm.patchValue({ limit: 500 });
    component.getArchives();
    expect(boitierService.getArchiveOfBoitier).toHaveBeenCalledWith(123, 500);
  });

  it('should handle non-array archive response', () => {
    boitierService.getArchiveOfBoitier.mockReturnValue(of({ data: null }));
    component.getArchives();
    expect(component.archives()).toEqual([]);
  });

  it('should handle raws nested response', () => {
    boitierService.getRaws.mockReturnValue(of({ data: { raws: [], count: 0 } }));
    component.getAllRaws();
    expect(component.rawData().count).toBe(0);
  });
});
