import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class VehiculeService {
    private readonly http = inject(HttpClient);

    getVehiculeInfo(page: number, size: number): Observable<any> {
        return this.http.get<any>(`${environment.apiBaseUrl}vehicule/list?page=${page}&size=${size}`);
    }

    updateTechnicianIntervention(deviceId: number, date: Date): Observable<boolean> {
        return this.http.post<boolean>(`${environment.apiBaseUrl}vehicule/update/${deviceId}`, date);
    }
}
