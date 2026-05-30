import { Component, input, output, viewChild, inject, AfterViewInit, OnDestroy, ElementRef, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RealTime } from '../../../../data/data';
import { MAP_CONSTANTS, CAR_STYLES, VALID_ANGLES, TIMEOUTS } from '../../../../shared/constants/app.constants';
import { ChangeDetectorRef } from '@angular/core';

declare const L: any;

@Component({
  selector: 'app-dashboard-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-map.component.html',
  styleUrls: ['./dashboard-map.component.css']
})
export class DashboardMapComponent implements AfterViewInit, OnDestroy {
  realtimes = input<RealTime[]>([]);
  mapContainer = viewChild.required<ElementRef>('mapContainer');
  locateDevice = output<RealTime>();

  map?: any;
  private markerClusterGroup?: any;
  private deviceIconMap = new Map<number, string>();
  private cdr = inject(ChangeDetectorRef);

  constructor() {
    effect(() => {
      this.realtimes();
      this.updateMarkers();
    });
  }

  ngAfterViewInit() {
    this.initMap();
  }

  ngOnDestroy() {
    this.map?.remove();
    this.markerClusterGroup?.clearLayers();
  }

  private initMap() {
    const container = this.mapContainer()?.nativeElement;
    if (!container) return;

    const height = container.offsetHeight || container.clientHeight;
    if (height === 0) {
      console.warn('[Map] Container height is 0, skipping init.');
      return;
    }

    this.map = L.map(container).setView(
      [MAP_CONSTANTS.DEFAULT_CENTER.lat, MAP_CONSTANTS.DEFAULT_CENTER.lng],
      MAP_CONSTANTS.DEFAULT_ZOOM
    );

    L.tileLayer(MAP_CONSTANTS.TILE_LAYER_URL, {
      attribution: MAP_CONSTANTS.ATTRIBUTION
    }).addTo(this.map);

    this.markerClusterGroup = L.markerClusterGroup();
    this.map.addLayer(this.markerClusterGroup);

    this.updateMarkers();
  }

  private updateMarkers() {
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
            </div>
          `)
          .on('click', () => this.locateDevice.emit(tram));
        
        this.markerClusterGroup!.addLayer(marker);
        bounds.push([tram.latitude, tram.longitude]);
      }
    });

    if (bounds.length) {
      this.map.fitBounds(L.latLngBounds(bounds), { padding: MAP_CONSTANTS.PADDING });
    }
    
    this.map.invalidateSize();
  }

  private getCarIcon(tram: RealTime) {
    if (!this.deviceIconMap.has(tram.deviceid)) {
      this.deviceIconMap.set(
        tram.deviceid,
        CAR_STYLES[Math.floor(Math.random() * CAR_STYLES.length)]
      );
    }
    
    const carStyle = this.deviceIconMap.get(tram.deviceid)!;
    const rawAngle = (tram as any).rotation_angle || 0;
    const snapped = VALID_ANGLES.reduce((prev, curr) =>
      Math.abs(curr - rawAngle) < Math.abs(prev - rawAngle) ? curr : prev
    );

    return L.icon({
      iconUrl: `assets/images/cars/${carStyle}x${snapped}.png`,
      iconSize: MAP_CONSTANTS.ICON_SIZE,
      iconAnchor: MAP_CONSTANTS.ICON_ANCHOR,
      popupAnchor: MAP_CONSTANTS.POPUP_ANCHOR
    });
  }

  zoomIn() {
    this.map?.zoomIn();
  }

  zoomOut() {
    this.map?.zoomOut();
  }

  invalidateSize() {
    setTimeout(() => {
      this.map?.invalidateSize();
      this.updateMarkers();
    }, TIMEOUTS.MAP_INITIALIZE);
  }
}
