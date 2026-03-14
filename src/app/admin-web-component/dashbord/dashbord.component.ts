import { Component, OnInit, AfterViewInit, OnDestroy, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from "@angular/router";
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { CompteClientWebInfoDTO, Tram } from 'src/app/data/data';
import { AuthService } from 'src/app/service/auth.service';
import { WebAccountService } from "src/app/service/web-account.service";
import { saveAs as importedSaveAs } from 'file-saver';
// Leaflet is loaded globally via angular.json scripts
// MarkerCluster extends the global L object, so we must use declare instead of import
declare const L: any;
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
    selector: 'app-dashbord',
    templateUrl: './dashbord.component.html',
    styleUrls: ['./dashbord.component.css'],
    imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, DecimalPipe, DatePipe]
})
export class DashbordComponent implements OnInit, AfterViewInit, OnDestroy {
  protected readonly Math = Math;

  comptesWeb: CompteClientWebInfoDTO[] = [];
  realtimes: Tram[] = [];
  loading: boolean = false;
  dashboardForm!: FormGroup;

  // UI State
  fullscreenMap: boolean = false;
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  filterValues: any = {
    matricule: '',
    status: 'ALL',
    speed: '',
    ignition: 'ALL'
  };

  // Pagination
  currentPage: number = 1;
  pageSize: number = 10;
  pageSizeOptions: number[] = [5, 10, 20, 50];

  // KPI Data
  stats = {
    total: 0,
    valid: 0,
    technicalIssue: 0,
    moving: 0
  };

  private map?: any;
  private markerClusterGroup?: any;
  private stateChart?: Chart;
  private speedChart?: Chart;
  private puceChart?: Chart;
  
  @ViewChild('statusChart') set statusChartCanvasRef(el: ElementRef) {
    this.statusChartCanvas = el;
    if (el && this.realtimes.length > 0) this.updateStateChart();
  }
  statusChartCanvas!: ElementRef;

  @ViewChild('speedChartCanvas') set speedChartCanvasRef(el: ElementRef) {
    this.speedChartCanvas = el;
    if (el && this.realtimes.length > 0) this.updateSpeedChart();
  }
  speedChartCanvas!: ElementRef;

  @ViewChild('puceChartCanvas') set puceChartCanvasRef(el: ElementRef) {
    this.puceChartCanvas = el;
    if (el && this.realtimes.length > 0) this.updatePuceChart();
  }
  puceChartCanvas!: ElementRef;

  @ViewChild('mapContainer') set mapContainerRef(el: ElementRef) {
    this.mapContainer = el;
    if (el && this.realtimes.length > 0) {
        this.initMap();
        this.updateMarkers();
    }
  }
  mapContainer!: ElementRef;

  private readonly authService = inject(AuthService);
  private readonly webAccountService = inject(WebAccountService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);

  ngOnInit() {
    this.initForms();
    
    // Check for fullscreen map mode
    this.route.queryParams.subscribe(params => {
      this.fullscreenMap = params['fullscreenMap'] === 'true';
    });

    if (localStorage.getItem("isReloading") === "true") {
      localStorage.removeItem("isReloading");
      window.location.reload();
    }

    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/error']);
    } else {
      this.webAccountService.getAllCompteClientWeb().subscribe(res => {
        this.comptesWeb = res;
        
        // If in fullscreen mode, we might want to auto-select a default or keep previous
      });
    }
  }

  get filteredRealtimes(): Tram[] {
    let data = [...this.realtimes];

    // Filtering
    Object.keys(this.filterValues).forEach(key => {
      const val = this.filterValues[key];
      if (!val || val === 'ALL') return;

      // When filtering, we usually want to reset to the first page
      // However, doing it inside the getter is tricky as it's a side effect.
      // We will handle resetting explicitly in the HTML/template bindings if needed,
      // or just accept that the slice might be empty if we are on a high page.
      // Better: Reset page if filters change. 
      // I'll add a helper for filter change.

      data = data.filter(item => {
        if (key === 'status') {
          return item.status === val;
        }
        if (key === 'ignition') {
          const expected = val === 'ON';
          return item.ignition === expected;
        }
        if (key === 'speed') {
          const numSpeed = parseFloat(val);
          if (isNaN(numSpeed)) return true;
          // Filter vehicles going at least the specified speed
          return item.speed >= numSpeed;
        }
        if (key === 'matricule') {
          return item.matricule?.toLowerCase().includes(val.toLowerCase());
        }
        return true;
      });
    });

    // Sorting
    if (this.sortColumn) {
      data.sort((a, b) => {
        const valA = (a as any)[this.sortColumn];
        const valB = (b as any)[this.sortColumn];
        
        if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return data;
  }

  get paginatedRealtimes(): Tram[] {
    const data = this.filteredRealtimes;
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return data.slice(startIndex, startIndex + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredRealtimes.length / this.pageSize);
  }

  get totalFilteredItems(): number {
    return this.filteredRealtimes.length;
  }

  onFilterChange() {
    this.currentPage = 1;
  }

  setPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  onPageSizeChange() {
    this.currentPage = 1;
  }

  getPageNumbers(): number[] {
    const total = this.totalPages;
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    // Simple logic for ellipses could go here, but let's keep it simple for now
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  toggleSort(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
  }

  openExternalMap() {
    const urlTree = this.router.createUrlTree(['/adminWeb/dashboard'], { queryParams: { fullscreenMap: 'true' } });
    const serialized = this.router.serializeUrl(urlTree);
    const fullUrl = `${window.location.origin}${serialized}`;
    window.open(fullUrl, '_blank');
  }

  ngAfterViewInit() {
    // We can't initMap here because it's wrapped in *ngIf="realtimes.length > 0"
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
    if (this.markerClusterGroup) {
      this.markerClusterGroup.clearLayers();
    }
    if (this.stateChart) {
      this.stateChart.destroy();
    }
    if (this.speedChart) {
      this.speedChart.destroy();
    }
    if (this.puceChart) {
      this.puceChart.destroy();
    }
  }

  initForms() {
    this.dashboardForm = this.fb.group({
      compteWeb: [null]
    });
  }

  private initMap() {
    if (this.map) return; // Prevent double init
    
    if (!this.mapContainer) return;

    // Center on Tunisia
    this.map = L.map(this.mapContainer.nativeElement).setView([33.8869, 9.5375], 6); 
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.markerClusterGroup = (L as any).markerClusterGroup();
    this.map.addLayer(this.markerClusterGroup!);
  }

  // Map of deviceId -> car style for consistent random assignment
  private deviceIconMap = new Map<number, string>();
  private readonly carStyles = ['c1', 'c2', 'c3', 'c4'];
  private readonly validAngles = [0, 45, 90, 135, 180, 225, 270, 315, 360];

  private getCarIcon(tram: Tram) {
    // Assign a random car style to each device (persists across updates)
    if (!this.deviceIconMap.has(tram.deviceid)) {
      const randomStyle = this.carStyles[Math.floor(Math.random() * this.carStyles.length)];
      this.deviceIconMap.set(tram.deviceid, randomStyle);
    }
    const carStyle = this.deviceIconMap.get(tram.deviceid)!;

    // Snap rotation angle to nearest 45° step
    const rawAngle = tram.rotation_angle || 0;
    const snapped = this.validAngles.reduce((prev, curr) =>
      Math.abs(curr - rawAngle) < Math.abs(prev - rawAngle) ? curr : prev
    );

    const iconUrl = `assets/images/cars/${carStyle}x${snapped}.png`;

    return L.icon({
      iconUrl: iconUrl,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16]
    });
  }

  private updateMarkers() {
    if (!this.map || !this.markerClusterGroup) {
      this.initMap();
    }
    
    if (!this.map || !this.markerClusterGroup) return;

    // Clear existing markers
    this.markerClusterGroup.clearLayers();

    const bounds: any[] = [];

    this.realtimes.forEach(tram => {
      if (tram.latitude && tram.longitude) {
        const marker = L.marker([tram.latitude, tram.longitude], {
          icon: this.getCarIcon(tram)
        })
        .bindPopup(`
          <div style="font-family: 'Public Sans', sans-serif;">
            <b style="color: #2b3674; font-size: 14px;">${tram.matricule}</b><br>
            <span style="color: #a3aed0;">ID:</span> ${tram.deviceid}<br>
            <span style="color: #a3aed0;">Vitesse:</span> <b>${tram.speed} km/h</b><br>
            <span style="color: #a3aed0;">Status:</span> ${tram.status}
          </div>
        `);
        
        this.markerClusterGroup!.addLayer(marker);
        bounds.push([tram.latitude, tram.longitude]);
      }
    });

    if (bounds.length > 0) {
      this.map.fitBounds(L.latLngBounds(bounds), { padding: [50, 50] });
    }
    
    this.map.invalidateSize();
  }

  private updateStats() {
    this.stats.total = this.realtimes.length;
    this.stats.valid = this.realtimes.filter(t => t.status === 'VALID').length;
    this.stats.technicalIssue = this.realtimes.filter(t => t.status === 'TECHNICAL_ISSUE').length;
    this.stats.moving = this.realtimes.filter(t => t.speed > 0).length;

    this.updateChart();
  }

  private updateChart() {
    this.updateStateChart();
    this.updateSpeedChart();
    this.updatePuceChart();
  }

  private updateStateChart() {
    if (!this.statusChartCanvas) return;
    const data = {
      labels: ['Valide', 'Problème Tech', 'Non Valide'],
      datasets: [{
        data: [
          this.stats.valid,
          this.stats.technicalIssue,
          this.realtimes.filter(t => t.status === 'NON_VALID').length
        ],
        backgroundColor: ['#05cd99', '#ee5d50', '#ffb800'],
        hoverOffset: 4
      }]
    };

    if (this.stateChart) {
      this.stateChart.data = data;
      this.stateChart.update();
    } else {
      this.stateChart = new Chart(this.statusChartCanvas.nativeElement, {
        type: 'doughnut',
        data: data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom' } }
        }
      });
    }
  }

  private updateSpeedChart() {
    if (!this.speedChartCanvas) return;
    const bands = {
      '0 km/h': this.realtimes.filter(t => t.speed === 0).length,
      '1-30 km/h': this.realtimes.filter(t => t.speed > 0 && t.speed <= 30).length,
      '31-60 km/h': this.realtimes.filter(t => t.speed > 30 && t.speed <= 60).length,
      '61+ km/h': this.realtimes.filter(t => t.speed > 60).length
    };

    const data = {
      labels: Object.keys(bands),
      datasets: [{
        label: 'Véhicules',
        data: Object.values(bands),
        backgroundColor: '#4318ff',
        borderRadius: 8
      }]
    };

    if (this.speedChart) {
      this.speedChart.data = data;
      this.speedChart.update();
    } else {
      this.speedChart = new Chart(this.speedChartCanvas.nativeElement, {
        type: 'bar',
        data: data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true, grid: { display: false } }, x: { grid: { display: false } } }
        }
      });
    }
  }

  private updatePuceChart() {
    if (!this.puceChartCanvas) return;
    
    const counts = {
      'Orange Tunisie': this.realtimes.filter(t => t.numPuce?.startsWith('8921601')).length,
      'Tunisie Telecom': this.realtimes.filter(t => t.numPuce?.startsWith('8921602')).length,
      'Ooredoo Tunisie': this.realtimes.filter(t => t.numPuce?.startsWith('8921603')).length,
      'Unknown': this.realtimes.filter(t => {
        const p = t.numPuce || '';
        return !p.startsWith('8921601') && !p.startsWith('8921602') && !p.startsWith('8921603');
      }).length
    };

    const data = {
      labels: Object.keys(counts),
      datasets: [{
        data: Object.values(counts),
        backgroundColor: ['#ff7900', '#0075c2', '#ed1c24', '#a3aed0'],
        hoverOffset: 4
      }]
    };

    if (this.puceChart) {
      this.puceChart.data = data;
      this.puceChart.update();
    } else {
      this.puceChart = new Chart(this.puceChartCanvas.nativeElement, {
        type: 'pie',
        data: data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom' } }
        }
      });
    }
  }

  diffHours(date: Date): number {
    date = new Date(date);
    return ((new Date().getTime()) - date.getTime()) / (60 * 60 * 1000);
  }

  getAllLastTramByCompteWeb() {
    const selectedCompte = this.dashboardForm.get('compteWeb')?.value;
    if (!selectedCompte || !selectedCompte.idCompteClientWeb) return;

    this.loading = true;
    this.webAccountService.getAllLastTram(selectedCompte.idCompteClientWeb).subscribe(res => {
      this.realtimes = res as any;
      this.loading = false;
      
      // Use a slight delay to ensure DOM is ready and elements have size
      setTimeout(() => {
        this.updateMarkers();
        this.updateStats();
        
        // Ensure map is correctly sized
        if (this.map) {
          this.map.invalidateSize();
        }
      }, 50); 
    });
  }

  onExport() {
    if (this.realtimes.length <= 0) return;

    this.webAccountService.exportLastTram(this.realtimes as any)
      .subscribe(blob => {
        importedSaveAs(blob, 'Repport d\'état des boitiers.xlsx');
      });
  }
}
