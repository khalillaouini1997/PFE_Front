import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Intervention } from '../data/data';

@Injectable({
    providedIn: 'root'
})
export class InterventionService {
    private readonly http = inject(HttpClient);

    getIntervention(idTenant: number): Observable<any> {
        return this.http.get<any>(`${environment.apiBaseUrl}help/list/${idTenant}`);
    }

    updateIntervention(intervention: Intervention, idTenant: number): Observable<boolean> {
        return this.http.post<boolean>(`${environment.apiBaseUrl}help/update/?tenantId=${idTenant}`, intervention);
    }
}
