import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { InterventionInfo, PageResponse } from '../data/data';

@Injectable({
    providedIn: 'root'
})
export class VehiculeService {
    private readonly http = inject(HttpClient);

    getVehiculeInfo(page: number, size: number): Observable<PageResponse<InterventionInfo>> {
        return this.http.get<PageResponse<InterventionInfo>>(`${environment.apiBaseUrl}vehicule/list?page=${page}&size=${size}`);
    }

    updateTechnicianIntervention(deviceId: number, date: Date): Observable<boolean> {
        return this.http.post<boolean>(`${environment.apiBaseUrl}vehicule/update/${deviceId}`, date);
    }
}
