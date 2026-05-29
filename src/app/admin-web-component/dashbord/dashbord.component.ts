import { ChangeDetectorRef, Component, OnInit, OnDestroy, inject, ElementRef, signal, viewChild, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from "@angular/router";
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { CompteClientWebInfoDTO, Tram } from 'src/app/data/data';
import { AuthService } from 'src/app/service/auth.service';
import { WebAccountService } from "src/app/service/web-account.service";
import { saveAs as importedSaveAs } from 'file-saver';
import { PowerBIDashboardComponent } from '../../powerbi-dashboard/powerbi-dashboard.component';
declare const L: any;
import { Chart, registerables } from 'chart.js';
import { TableModule } from 'primeng/table';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

Chart.register(...registerables);

@Component({
  selector: 'app-dashbord',
  standalone: true,
  templateUrl: './dashbord.component.html',
  styleUrls: ['./dashbord.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    DecimalPipe,
    DatePipe,
    TableModule,
    BadgeModule,
    ButtonModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    TranslateModule,
    PowerBIDashboardComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashbordComponent implements OnInit, OnDestroy {
  protected readonly Math = Math;

  // ── Data signals ──────────────────────────────────────────────────────────
  comptesWeb = signal<CompteClientWebInfoDTO[]>([]);
  realtimes  = signal<Tram[]>([]);
  loading    = signal<boolean>(false);
  dashboardForm!: FormGroup;
  fullscreenMap = signal<boolean>(false);
  currentTab = signal<'realtime' | 'analytics'>('realtime');

  // ── KPI stats ─────────────────────────────────────────────────────────────
  stats = signal({ total: 0, valid: 0, technicalIssue: 0, moving: 0 });

  // ── Map overlay panel state ───────────────────────────────────────────────
  mapOverlayOpen = false;

  // ── Private chart / map references ───────────────────────────────────────
  private map?: any;
  private markerClusterGroup?: any;
  private stateChart?: Chart;
  private speedChart?: Chart;
  private puceChart?: Chart;
  private sparklineCharts: Chart[] = [];

  // ── ViewChild canvas refs ─────────────────────────────────────────────────
  statusChartCanvas  = viewChild<ElementRef>('statusChart');
  speedChartCanvas   = viewChild<ElementRef>('speedChartCanvas');
  puceChartCanvas    = viewChild<ElementRef>('puceChartCanvas');
  mapContainer       = viewChild<ElementRef>('mapContainer');

  // Sparkline canvases (one per KPI card)
  sparkTotal  = viewChild<ElementRef>('sparkTotal');
  sparkValid  = viewChild<ElementRef>('sparkValid');
  sparkIssue  = viewChild<ElementRef>('sparkIssue');
  sparkMoving = viewChild<ElementRef>('sparkMoving');

  // ── DI ───────────────────────────────────────────────────────────────────
  private readonly authService      = inject(AuthService);
  private readonly webAccountService = inject(WebAccountService);
  private readonly router           = inject(Router);
  private readonly fb               = inject(FormBuilder);
  private readonly route            = inject(ActivatedRoute);
  private readonly cdr              = inject(ChangeDetectorRef);
  private readonly translate        = inject(TranslateService);

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  ngOnInit() {
    this.initForms();

    this.route.queryParams.subscribe(params => {
      this.fullscreenMap.set(params['fullscreenMap'] === 'true');
    });

    if (localStorage.getItem('isReloading') === 'true') {
      localStorage.removeItem('isReloading');
      globalThis.location.reload();
    }

    if (this.authService.isAuthenticated()) {
      this.webAccountService.getAllWebAccountNames().subscribe(res => {
        this.comptesWeb.set(res);
      });
    } else {
      this.router.navigate(['/error']);
    }
  }

  ngOnDestroy() {
    this.map?.remove();
    this.markerClusterGroup?.clearLayers();
    this.stateChart?.destroy();
    this.speedChart?.destroy();
    this.puceChart?.destroy();
    this.sparklineCharts.forEach(c => c.destroy());
  }

  // ── Forms ─────────────────────────────────────────────────────────────────
  initForms() {
    this.dashboardForm = this.fb.group({ compteWeb: [null] });
  }

  // ── Map helpers ───────────────────────────────────────────────────────────
  openExternalMap() {
    const urlTree   = this.router.createUrlTree(['/adminWeb/dashboard'], { queryParams: { fullscreenMap: 'true' } });
    const serialized = this.router.serializeUrl(urlTree);
    globalThis.open(`${globalThis.location.origin}${serialized}`, '_blank');
  }

  /** Toggle the map overlay layer panel */
  toggleMapOverlay() {
    this.mapOverlayOpen = !this.mapOverlayOpen;
  }

  zoomIn()  { this.map?.zoomIn();  }
  zoomOut() { this.map?.zoomOut(); }

  /** Centre map and open popup for a given row */
  locateOnMap(data: Tram) {
    if (!this.map) return;
    this.map.setView([data.latitude, data.longitude], 15);
    this.mapOverlayOpen = false;
  }

  /** Placeholder — wire up to a dialog / side-panel as needed */
  openDetails(data: Tram) {
    console.log('Details for device', data.deviceid, data);
    // e.g. this.dialogService.open(TerminalDetailComponent, { data, header: data.matricule });
  }

  // ── Map initialisation ────────────────────────────────────────────────────
  private initMap() {
    if (this.map) return;
    const container = this.mapContainer()?.nativeElement;
    if (!container) return;
    const height = container.offsetHeight || container.clientHeight;
    if (height === 0) { console.warn('[Map] Container height is 0, skipping init.'); return; }

    this.map = L.map(container).setView([33.8869, 9.5375], 6);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.markerClusterGroup = L.markerClusterGroup();
    this.map.addLayer(this.markerClusterGroup);
  }

  // ── Icon helpers ──────────────────────────────────────────────────────────
  private readonly deviceIconMap = new Map<number, string>();
  private readonly carStyles   = ['c1', 'c2', 'c3', 'c4'];
  private readonly validAngles = [0, 45, 90, 135, 180, 225, 270, 315, 360];

  private getCarIcon(tram: Tram) {
    if (!this.deviceIconMap.has(tram.deviceid)) {
      this.deviceIconMap.set(tram.deviceid, this.carStyles[Math.floor(Math.random() * this.carStyles.length)]);
    }
    const carStyle = this.deviceIconMap.get(tram.deviceid)!;
    const rawAngle = tram.rotation_angle || 0;
    const snapped  = this.validAngles.reduce((prev, curr) =>
      Math.abs(curr - rawAngle) < Math.abs(prev - rawAngle) ? curr : prev
    );
    return L.icon({ iconUrl: `assets/images/cars/${carStyle}x${snapped}.png`, iconSize: [32, 32], iconAnchor: [16, 16], popupAnchor: [0, -16] });
  }

  // ── Markers ───────────────────────────────────────────────────────────────
  private updateMarkers() {
    if (!this.map || !this.markerClusterGroup) this.initMap();
    if (!this.map || !this.markerClusterGroup) return;

    this.markerClusterGroup.clearLayers();
    const bounds: any[] = [];

    this.realtimes().forEach(tram => {
      if (tram.latitude && tram.longitude) {
        const marker = L.marker([tram.latitude, tram.longitude], { icon: this.getCarIcon(tram) })
          .bindPopup(`
            <div style="font-family:'Public Sans',sans-serif">
              <b style="color:#2b3674;font-size:14px">${tram.matricule}</b><br>
              <span style="color:#a3aed0">ID:</span> ${tram.deviceid}<br>
              <span style="color:#a3aed0">Vitesse:</span> <b>${tram.speed} km/h</b><br>
              <span style="color:#a3aed0">Status:</span> ${tram.status}
            </div>`);
        this.markerClusterGroup!.addLayer(marker);
        bounds.push([tram.latitude, tram.longitude]);
      }
    });

    if (bounds.length) this.map.fitBounds(L.latLngBounds(bounds), { padding: [50, 50] });
    this.map.invalidateSize();
  }

  // ── Stats + charts ────────────────────────────────────────────────────────
  private updateStats() {
    const data = this.realtimes();
    this.stats.set({
      total:          data.length,
      valid:          data.filter(t => t.status === 'VALID').length,
      technicalIssue: data.filter(t => t.status === 'TECHNICAL_ISSUE').length,
      moving:         data.filter(t => t.speed > 0).length
    });
    this.updateChart();
    this.drawSparklines();
  }

  private updateChart() {
    this.updateStateChart();
    this.updateSpeedChart();
    this.updatePuceChart();
  }

  private updateStateChart() {
    const canvas = this.statusChartCanvas();
    if (!canvas) return;
    const stats = this.stats();
    const data = {
      labels: [
        this.translate.instant('DASHBOARD.STATE_VALID'),
        this.translate.instant('DASHBOARD.STATE_ISSUE'),
        this.translate.instant('DASHBOARD.STATE_NON_VALID')
      ],
      datasets: [{
        data: [stats.valid, stats.technicalIssue, this.realtimes().filter(t => t.status === 'NON_VALID').length],
        backgroundColor: ['#05cd99', '#ee5d50', '#ffb800'],
        hoverOffset: 4
      }]
    };
    if (this.stateChart) { this.stateChart.data = data; this.stateChart.update(); }
    else {
      this.stateChart = new Chart(canvas.nativeElement, {
        type: 'doughnut', data,
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
      });
    }
  }

  private updateSpeedChart() {
    const canvas = this.speedChartCanvas();
    if (!canvas) return;
    const r = this.realtimes();
    const bands = {
      '0 km/h':    r.filter(t => t.speed === 0).length,
      '1-30 km/h': r.filter(t => t.speed > 0 && t.speed <= 30).length,
      '31-60 km/h':r.filter(t => t.speed > 30 && t.speed <= 60).length,
      '61+ km/h':  r.filter(t => t.speed > 60).length
    };
    const data = {
      labels: Object.keys(bands),
      datasets: [{
        label: this.translate.instant('DASHBOARD.VEHICLES'),
        data: Object.values(bands),
        backgroundColor: '#4318ff', borderRadius: 8
      }]
    };
    if (this.speedChart) { this.speedChart.data = data; this.speedChart.update(); }
    else {
      this.speedChart = new Chart(canvas.nativeElement, {
        type: 'bar', data,
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true, grid: { display: false } }, x: { grid: { display: false } } }
        }
      });
    }
  }

  private updatePuceChart() {
    const canvas = this.puceChartCanvas();
    if (!canvas) return;
    const r = this.realtimes();
    const counts = {
      'Orange Tunisie':  r.filter(t => t.numPuce?.startsWith('8921601')).length,
      'Tunisie Telecom': r.filter(t => t.numPuce?.startsWith('8921602')).length,
      'Ooredoo Tunisie': r.filter(t => t.numPuce?.startsWith('8921603')).length,
      'Unknown': r.filter(t => { const p = t.numPuce || ''; return !p.startsWith('892160'); }).length
    };
    const data = {
      labels: Object.keys(counts),
      datasets: [{ data: Object.values(counts), backgroundColor: ['#ff7900', '#0075c2', '#ed1c24', '#a3aed0'], hoverOffset: 4 }]
    };
    if (this.puceChart) { this.puceChart.data = data; this.puceChart.update(); }
    else {
      this.puceChart = new Chart(canvas.nativeElement, {
        type: 'pie', data,
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
      });
    }
  }

  // ── Sparklines (KPI mini trend lines) ────────────────────────────────────
  private drawSparklines() {
    const s = this.stats();

    // Generate a simple descending/ascending mock series ending at the real value.
    // In production you would pass real historical arrays here.
    const mockSeries = (end: number, trend: 'up' | 'down'): number[] => {
      const steps = 6;
      return Array.from({ length: steps }, (_, i) => {
        const delta = trend === 'up' ? -(steps - 1 - i) : (steps - 1 - i);
        return Math.max(0, end + delta);
      });
    };

    const configs: Array<{ ref: ElementRef<HTMLCanvasElement> | undefined; color: string; series: number[] }> = [
      { ref: this.sparkTotal()?.nativeElement  ? this.sparkTotal()  : undefined, color: '#4f46e5', series: mockSeries(s.total,          'up')   },
      { ref: this.sparkValid()?.nativeElement  ? this.sparkValid()  : undefined, color: '#10b981', series: mockSeries(s.valid,          'up')   },
      { ref: this.sparkIssue()?.nativeElement  ? this.sparkIssue()  : undefined, color: '#f43f5e', series: mockSeries(s.technicalIssue, 'down') },
      { ref: this.sparkMoving()?.nativeElement ? this.sparkMoving() : undefined, color: '#f59e0b', series: mockSeries(s.moving,         'up')   },
    ];

    // Destroy previous instances
    this.sparklineCharts.forEach(c => c.destroy());
    this.sparklineCharts = [];

    configs.forEach(({ ref, color, series }) => {
      const el = ref?.nativeElement as HTMLCanvasElement | undefined;
      if (!el) return;
      const ctx = el.getContext('2d');
      if (!ctx) return;

      const chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: series.map(() => ''),
          datasets: [{
            data: series,
            borderColor: color,
            borderWidth: 2,
            pointRadius: 0,
            tension: 0.4,
            fill: true,
            backgroundColor: color + '22',
          }]
        },
        options: {
          responsive: false,
          animation: false,
          plugins: { legend: { display: false }, tooltip: { enabled: false } },
          scales: { x: { display: false }, y: { display: false } }
        }
      });
      this.sparklineCharts.push(chart);
    });
  }

  // ── Utilities ─────────────────────────────────────────────────────────────
  diffHours(date: Date): number {
    return (Date.now() - new Date(date).getTime()) / (60 * 60 * 1000);
  }

  // ── Tab Navigation ─────────────────────────────────────────────────────
  switchTab(tab: 'realtime' | 'analytics') {
    this.currentTab.set(tab);
  }

  // ── Data loading ──────────────────────────────────────────────────────────
  getAllLastTramByCompteWeb() {
    const selectedCompte = this.dashboardForm.get('compteWeb')?.value;
    if (!selectedCompte?.idCompteClientWeb) return;

    this.loading.set(true);
    this.webAccountService.getAllLastTram(selectedCompte.idCompteClientWeb).subscribe(res => {
      this.realtimes.set(res as any);
      this.loading.set(false);
      this.cdr.detectChanges();

      setTimeout(() => {
        if (!this.map) this.initMap();
        this.map?.invalidateSize();
        this.updateMarkers();
        this.updateStats(); // also calls drawSparklines()
      }, 300);

      setTimeout(() => {
        if (!this.map) return;
        this.map.invalidateSize();
        const bounds = this.realtimes()
          .filter(t => t.latitude && t.longitude)
          .map(t => [t.latitude, t.longitude]);
        if (bounds.length) this.map.fitBounds(L.latLngBounds(bounds), { padding: [50, 50] });
      }, 1000);
    });
  }

  onExport() {
    if (!this.realtimes().length) return;
    this.webAccountService.exportLastTram(this.realtimes() as any)
      .subscribe(blob => importedSaveAs(blob, "Repport d'état des boitiers.xlsx"));
  }
}
