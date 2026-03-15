import { Component, OnInit, OnDestroy, inject, ElementRef, signal, viewChild, computed } from '@angular/core';
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
export class DashbordComponent implements OnInit, OnDestroy {
  protected readonly Math = Math;

  comptesWeb = signal<CompteClientWebInfoDTO[]>([]);
  realtimes = signal<Tram[]>([]);
  loading = signal<boolean>(false);
  dashboardForm!: FormGroup;

  // UI State
  fullscreenMap = signal<boolean>(false);
  sortColumn = signal<string>('');
  sortDirection = signal<'asc' | 'desc'>('asc');
  
  // Individual Filter Signals
  filterMatricule = signal<string>('');
  filterStatus = signal<string>('ALL');
  filterSpeed = signal<string>('');
  filterIgnition = signal<string>('ALL');


  // Pagination
  currentPage = signal<number>(1);
  pageSize = signal<number>(10);
  pageSizeOptions: number[] = [5, 10, 20, 50];

  // KPI Data
  stats = signal({
    total: 0,
    valid: 0,
    technicalIssue: 0,
    moving: 0
  });

  private map?: any;
  private markerClusterGroup?: any;
  private stateChart?: Chart;
  private speedChart?: Chart;
  private puceChart?: Chart;
  
  statusChartCanvas = viewChild<ElementRef>('statusChart');
  speedChartCanvas = viewChild<ElementRef>('speedChartCanvas');
  puceChartCanvas = viewChild<ElementRef>('puceChartCanvas');
  mapContainer = viewChild<ElementRef>('mapContainer');


  private readonly authService = inject(AuthService);
  private readonly webAccountService = inject(WebAccountService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);

  ngOnInit() {
    this.initForms();
    
    // Check for fullscreen map mode
    this.route.queryParams.subscribe(params => {
      this.fullscreenMap.set(params['fullscreenMap'] === 'true');
    });

    if (localStorage.getItem("isReloading") === "true") {
      localStorage.removeItem("isReloading");
      window.location.reload();
    }

    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/error']);
    } else {
      this.webAccountService.getAllCompteClientWeb().subscribe(res => {
        this.comptesWeb.set(res);
      });
    }
  }

  filteredRealtimes = computed(() => {
    let data = [...this.realtimes()];
    
    const matricule = this.filterMatricule().toLowerCase();
    const status = this.filterStatus();
    const speed = this.filterSpeed();
    const ignition = this.filterIgnition();

    // Filtering
    if (matricule) {
      data = data.filter(item => item.matricule?.toLowerCase().includes(matricule));
    }
    if (status !== 'ALL') {
      data = data.filter(item => item.status === status);
    }
    if (speed) {
      const numSpeed = parseFloat(speed);
      if (!isNaN(numSpeed)) {
        data = data.filter(item => item.speed >= numSpeed);
      }
    }
    if (ignition !== 'ALL') {
      const expected = ignition === 'ON';
      data = data.filter(item => item.ignition === expected);
    }


    // Sorting
    const sortBy = this.sortColumn();
    const direction = this.sortDirection();
    if (sortBy) {
      data.sort((a, b) => {
        const valA = (a as any)[sortBy];
        const valB = (b as any)[sortBy];
        
        if (valA < valB) return direction === 'asc' ? -1 : 1;
        if (valA > valB) return direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return data;
  });

  paginatedRealtimes = computed(() => {
    const data = this.filteredRealtimes();
    const startIndex = (this.currentPage() - 1) * this.pageSize();
    return data.slice(startIndex, startIndex + this.pageSize());
  });

  totalPages = computed(() => {
    return Math.ceil(this.filteredRealtimes().length / this.pageSize());
  });

  totalFilteredItems = computed(() => {
    return this.filteredRealtimes().length;
  });

  onFilterChange() {
    this.currentPage.set(1);
  }

  setPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
    }
  }

  prevPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
    }
  }

  onPageSizeChange() {
    this.currentPage.set(1);
  }

  getPageNumbers(): number[] {
    const total = this.totalPages();
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  toggleSort(column: string) {
    if (this.sortColumn() === column) {
      this.sortDirection.update(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
  }


  openExternalMap() {
    const urlTree = this.router.createUrlTree(['/adminWeb/dashboard'], { queryParams: { fullscreenMap: 'true' } });
    const serialized = this.router.serializeUrl(urlTree);
    const fullUrl = `${window.location.origin}${serialized}`;
    window.open(fullUrl, '_blank');
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
    
    const container = this.mapContainer();
    if (!container) return;

    // Center on Tunisia
    this.map = L.map(container.nativeElement).setView([33.8869, 9.5375], 6); 
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

    this.realtimes().forEach(tram => {
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
    const data = this.realtimes();
    this.stats.set({
      total: data.length,
      valid: data.filter(t => t.status === 'VALID').length,
      technicalIssue: data.filter(t => t.status === 'TECHNICAL_ISSUE').length,
      moving: data.filter(t => t.speed > 0).length
    });

    this.updateChart();
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
      labels: ['Valide', 'Problème Tech', 'Non Valide'],
      datasets: [{
        data: [
          stats.valid,
          stats.technicalIssue,
          this.realtimes().filter(t => t.status === 'NON_VALID').length
        ],
        backgroundColor: ['#05cd99', '#ee5d50', '#ffb800'],
        hoverOffset: 4
      }]
    };

    if (this.stateChart) {
      this.stateChart.data = data;
      this.stateChart.update();
    } else {
      this.stateChart = new Chart(canvas.nativeElement, {
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
    const canvas = this.speedChartCanvas();
    if (!canvas) return;
    const realtimes = this.realtimes();
    const bands = {
      '0 km/h': realtimes.filter(t => t.speed === 0).length,
      '1-30 km/h': realtimes.filter(t => t.speed > 0 && t.speed <= 30).length,
      '31-60 km/h': realtimes.filter(t => t.speed > 30 && t.speed <= 60).length,
      '61+ km/h': realtimes.filter(t => t.speed > 60).length
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
      this.speedChart = new Chart(canvas.nativeElement, {
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
    const canvas = this.puceChartCanvas();
    if (!canvas) return;
    
    const realtimes = this.realtimes();
    const counts = {
      'Orange Tunisie': realtimes.filter(t => t.numPuce?.startsWith('8921601')).length,
      'Tunisie Telecom': realtimes.filter(t => t.numPuce?.startsWith('8921602')).length,
      'Ooredoo Tunisie': realtimes.filter(t => t.numPuce?.startsWith('8921603')).length,
      'Unknown': realtimes.filter(t => {
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
      this.puceChart = new Chart(canvas.nativeElement, {
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

    this.loading.set(true);
    this.webAccountService.getAllLastTram(selectedCompte.idCompteClientWeb).subscribe(res => {
      this.realtimes.set(res as any);
      this.loading.set(false);
      
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
    if (this.realtimes().length <= 0) return;

    this.webAccountService.exportLastTram(this.realtimes() as any)
      .subscribe(blob => {
        importedSaveAs(blob, 'Repport d\'état des boitiers.xlsx');
      });
  }

}
