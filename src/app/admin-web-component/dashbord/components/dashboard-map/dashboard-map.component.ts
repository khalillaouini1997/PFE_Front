import { Component, input, output, viewChild, inject, AfterViewInit, OnDestroy, ElementRef, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RealTime } from '../../../../data/data';
import { MAP_CONSTANTS, CAR_STYLES, VALID_ANGLES, TIMEOUTS, REALTIME_CONSTANTS } from '../../../../shared/constants/app.constants';
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
  private markerMap = new Map<number, any>();
  private previousPositions = new Map<number, { lat: number; lng: number }>();
  private cdr = inject(ChangeDetectorRef);
  private animationFrameId?: number;

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
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.map?.remove();
    this.markerClusterGroup?.clearLayers();
    this.markerMap.clear();
    this.previousPositions.clear();
  }

  private initMap() {
    const container = this.mapContainer()?.nativeElement;
    if (!container) return;



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

  private currentFleetHash = '';

  private updateMarkers() {
    if (!this.map || !this.markerClusterGroup) return;

    const bounds: any[] = [];
    
    const newFleetHash = this.realtimes().map(t => t.deviceid).sort().join(',');
    const fleetChanged = newFleetHash !== this.currentFleetHash;

    this.realtimes().forEach(tram => {
      if (tram.latitude && tram.longitude) {
        const deviceId = tram.deviceid;
        const prevPos = this.previousPositions.get(deviceId);
        
        if (prevPos) {
          // Animate existing marker to new position
          this.animateMarkerPosition(deviceId, tram.latitude, tram.longitude);
        } else {
          // Create new marker
          this.createMarker(tram);
        }
        
        this.previousPositions.set(deviceId, { lat: tram.latitude, lng: tram.longitude });
        bounds.push([tram.latitude, tram.longitude]);
      }
    });

    // Remove markers for vehicles no longer in the list
    const currentDeviceIds = new Set(this.realtimes().map(t => t.deviceid));
    for (const [deviceId, marker] of this.markerMap) {
      if (!currentDeviceIds.has(deviceId)) {
        this.markerClusterGroup.removeLayer(marker);
        this.markerMap.delete(deviceId);
        this.previousPositions.delete(deviceId);
      }
    }

    if (bounds.length && fleetChanged) {
      this.currentFleetHash = newFleetHash;
      setTimeout(() => {
        if (this.map) {
          this.map.invalidateSize();
          this.map.fitBounds(L.latLngBounds(bounds), { padding: MAP_CONSTANTS.PADDING });
        }
      }, 100);
    } else {
      setTimeout(() => {
        if (this.map) {
          this.map.invalidateSize();
        }
      }, 100);
    }
  }

  private createMarker(tram: RealTime) {
    const marker = L.marker([tram.latitude, tram.longitude], { 
      icon: this.getCarIcon(tram),
      animate: true
    })
      .bindPopup(`
        <div style="font-family:'Public Sans',sans-serif">
          <b style="color:#2b3674;font-size:14px">${tram.matricule}</b><br>
          <span style="color:#a3aed0">ID:</span> ${tram.deviceid}<br>
          <span style="color:#a3aed0">Vitesse:</span> <b>${tram.speed} km/h</b><br>
          <span style="color:#a3aed0">Status:</span> ${tram.status}
        </div>
      `)
      .on('click', () => this.locateDevice.emit(tram));
    
    this.markerClusterGroup.addLayer(marker);
    this.markerMap.set(tram.deviceid, marker);
  }

  private animateMarkerPosition(deviceId: number, newLat: number, newLng: number) {
    const marker = this.markerMap.get(deviceId);
    if (!marker) return;

    const prevPos = this.previousPositions.get(deviceId);
    if (!prevPos) return;

    const startTime = performance.now();
    const duration = REALTIME_CONSTANTS.ANIMATION_DURATION_MS;
    const startLat = prevPos.lat;
    const startLng = prevPos.lng;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease-in-out function for smooth animation
      const easeProgress = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      const currentLat = startLat + (newLat - startLat) * easeProgress;
      const currentLng = startLng + (newLng - startLng) * easeProgress;

      marker.setLatLng([currentLat, currentLng]);

      if (progress < 1) {
        this.animationFrameId = requestAnimationFrame(animate);
      }
    };

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.animationFrameId = requestAnimationFrame(animate);
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
