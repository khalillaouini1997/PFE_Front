import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Archive, Boitier, BoitierRealTime, DeviceOpt, DeviceSetting, PageResponse, PathConfigPayload, Raws, RecalculatePayload, VehiculeSetting, BoitierAnalysis } from '../data/data';


@Injectable({
    providedIn: 'root'
})
export class BoitierService {
    private readonly http = inject(HttpClient);

    // Preparation & Listing
    prepareDBForAllDevises(idServer: number): Observable<void> {
        return this.http.post<void>(`${environment.apiBaseUrl}boities/${idServer}/prepareDB`, null);
    }

    prepareDBForSingleDevise(idServer: number, idBoitier: number): Observable<void> {
        return this.http.post<void>(`${environment.apiBaseUrl}boities/${idServer}/device/${idBoitier}/prepareDB`, null);
    }

    getAllCompteDevises(idServer: number): Observable<Boitier[]> {
        return this.http.get<Boitier[]>(`${environment.apiBaseUrl}boities/all/${idServer}`);
    }

    getBoitierOfAccount(id: number, keyword: string, page: number, size: number): Observable<PageResponse<Boitier>> {
        return this.http.get<PageResponse<Boitier>>(`${environment.apiBaseUrl}compteServer/${id}/Boitiers?keyWord=${keyword}&page=${page}&size=${size}`);
    }

    // CRUD & Updates
    updateBoitier(boitier: Boitier, idServer: number, updateType: string): Observable<Boitier> {
        return this.http.put<Boitier>(`${environment.apiBaseUrl}boities?idServer=${idServer}&updateType=${updateType}`, boitier);
    }

    // Archives & Raws
    lastArchiveOfBoitier(numBoitier: number): Observable<BoitierRealTime> {
        return this.http.get<BoitierRealTime>(`${environment.apiBaseUrl}boities/${numBoitier}/lastArchive`);
    }

    getRaws(numBoitier: number, limit: number): Observable<Raws> {
        return this.http.get<Raws>(`${environment.apiBaseUrl}boities/${numBoitier}/Raw/${limit}`);
    }

    getArchiveOfBoitier(numboitier: number, limit: number): Observable<Archive[]> {
        return this.http.get<Archive[]>(`${environment.apiBaseUrl}boities/${numboitier}/Archives/${limit}`);
    }

    // Recalculation
    recalculeHistorique(idCompteWeb: number, payload: RecalculatePayload): Observable<void> {
        return this.http.post<void>(`${environment.apiBaseUrl}boities/${idCompteWeb}/recalculate/historique`, payload);
    }

    recalculeAlert(idCompteWeb: number, payload: RecalculatePayload): Observable<void> {
        return this.http.post<void>(`${environment.apiBaseUrl}boities/${idCompteWeb}/recalculate/alert`, payload);
    }

    recalculeFuel(idCompteWeb: number, payload: RecalculatePayload): Observable<void> {
        return this.http.post<void>(`${environment.apiBaseUrl}boities/${idCompteWeb}/recalculate/fuel`, payload);
    }

    recalculePaths(idCompteWeb: number, payload: RecalculatePayload): Observable<void> {
        return this.http.post<void>(`${environment.apiBaseUrl}boities/${idCompteWeb}/recalculate/paths`, payload);
    }

    recalculeBoitier(idCompteWeb: number, payload: RecalculatePayload): Observable<void> {
        return this.http.post<void>(`${environment.apiBaseUrl}boities/${idCompteWeb}/recalculate/resetboitier`, payload);
    }

    resetRT(idCompteWeb: number, payload: RecalculatePayload): Observable<void> {
        return this.http.post<void>(`${environment.apiBaseUrl}boities/${idCompteWeb}/recalculate/resetRT`, payload);
    }

    // Configuration & Settings
    getDeviceOptionConfig(idCompteWeb: number, idBoitier: number): Observable<DeviceOpt[]> {
        return this.http.get<any>(`${environment.apiBaseUrl}boities/${idCompteWeb}/options/${idBoitier}`).pipe(
            map(response => response.data)
        );
    }

    getPathConfig(idCompteWeb: number, idBoitier: number): Observable<PathConfigPayload> {
        return this.http.get<any>(`${environment.apiBaseUrl}boities/${idCompteWeb}/pathconfig/${idBoitier}`).pipe(
            map(response => response.data)
        );
    }

    getDeviceSettings(idCompteWeb: number, idBoitier: number): Observable<DeviceSetting[]> {
        return this.http.get<any>(`${environment.apiBaseUrl}boities/${idCompteWeb}/devicesettings/${idBoitier}`).pipe(
            map(response => response.data)
        );
    }

    editDeviceOptionConfig(idCompteWeb: number, deviceOpt: DeviceOpt): Observable<void> {
        return this.http.put<void>(`${environment.apiBaseUrl}boities/${idCompteWeb}/options`, deviceOpt);
    }

    editDeviceSetting(idCompteWeb: number, deviceSetting: DeviceSetting): Observable<void> {
        return this.http.put<void>(`${environment.apiBaseUrl}boities/${idCompteWeb}/settings`, deviceSetting);
    }

    editPathConfig(idServer: number, pathConfigPayload: PathConfigPayload): Observable<void> {
        return this.http.post<void>(`${environment.apiBaseUrl}boities/editPathConfig/${idServer}`, pathConfigPayload);
    }

    resetOdometre(idCompteWeb: number, vehiculeSetting: VehiculeSetting): Observable<void> {
        return this.http.put<void>(`${environment.apiBaseUrl}boities/${idCompteWeb}/resetOdo`, vehiculeSetting);
    }

    getLastId(idCompteWeb: number, idBoitier: number): Observable<{ lastId: number }> {
        return this.http.get<{ lastId: number }>(`${environment.apiBaseUrl}boities/${idCompteWeb}/lastId/${idBoitier}`);
    }

    resetLastId(idCompteWeb: number, vehiculeSetting: VehiculeSetting): Observable<void> {
        return this.http.put<void>(`${environment.apiBaseUrl}boities/${idCompteWeb}/resetLastId`, vehiculeSetting);
    }

    getDeviceIdImei(url: string, imei: number): Observable<any> {
        return this.http.get<any>(url + imei);
    }

    getBoitierAnalysis(numBoitier: number, days: number = 30): Observable<BoitierAnalysis> {
        return this.http.get<BoitierAnalysis>(`${environment.apiBaseUrl}boities/${numBoitier}/analysis?days=${days}`);
    }
}

