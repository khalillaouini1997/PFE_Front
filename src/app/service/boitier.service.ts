import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Boitier, DeviceOpt, DeviceSetting, PageResponse, PathConfigPayload, RealTime, RecalculatePayload, VehiculeSetting } from '../data/data';

@Injectable({
    providedIn: 'root'
})
export class BoitierService {
    private readonly http = inject(HttpClient);

    // Preparation & Listing
    prepareDBForAllDevises(idServer: number): Observable<void> {
        return this.http.get<void>(`${environment.apiBaseUrl}boities/${idServer}`);
    }

    prepareDBForSingleDevise(idServer: number, idBoitier: number): Observable<void> {
        return this.http.get<void>(`${environment.apiBaseUrl}boities/${idServer}/device/${idBoitier}`);
    }

    getAllCompteDevises(idServer: number): Observable<Boitier[]> {
        return this.http.get<Boitier[]>(`${environment.apiBaseUrl}boities/all/${idServer}`);
    }

    getBoitierOfAccount(id: number, keyword: string, page: number, size: number): Observable<PageResponse<Boitier>> {
        return this.http.get<PageResponse<Boitier>>(`${environment.apiBaseUrl}compteServer/${id}/Boitiers?keyWord=${keyword}&page=${page}&size=${size}`);
    }

    getAllBoitierofIdcompte(idCompteServer: number): Observable<Boitier[]> {
        return this.http.get<Boitier[]>(`${environment.apiBaseUrl}compteServer/${idCompteServer}/listBoitiers`);
    }

    // CRUD & Updates
    addBoitiers(idCompteServer: number, nbrBoitiers: number): Observable<void> {
        return this.http.post<void>(`${environment.apiBaseUrl}compteServer/${idCompteServer}?nombreBoitier=${nbrBoitiers}`, null);
    }

    deleteCompteServer(id: number): Observable<void> {
        return this.http.delete<void>(`${environment.apiBaseUrl}compteServer/${id}`);
    }

    updateBoitier(boitier: Boitier, idServer: number, updateType: string): Observable<Boitier> {
        return this.http.put<Boitier>(`${environment.apiBaseUrl}boities?idServer=${idServer}&updateType=${updateType}`, boitier);
    }

    // Archives & Raws
    lastArchiveOfBoitier(numBoitier: number): Observable<RealTime> {
        return this.http.get<RealTime>(`${environment.apiBaseUrl}boities/${numBoitier}/lastArchive`);
    }

    getRaws(numBoitier: number, limit: number): Observable<any[]> {
        return this.http.get<any[]>(`${environment.apiBaseUrl}boities/${numBoitier}/Raw/${limit}`);
    }

    getArchiveOfBoitier(numboitier: number, limit: number): Observable<RealTime[]> {
        return this.http.get<RealTime[]>(`${environment.apiBaseUrl}boities/${numboitier}/Archives/${limit}`);
    }

    // Recalculation
    recalculeHistorique(idCompteWeb: number, payload: RecalculatePayload): Observable<void> {
        return this.http.put<void>(`${environment.apiBaseUrl}boities/${idCompteWeb}/recalculate/historique`, payload);
    }

    recalculeAlert(idCompteWeb: number, payload: RecalculatePayload): Observable<void> {
        return this.http.put<void>(`${environment.apiBaseUrl}boities/${idCompteWeb}/recalculate/alert`, payload);
    }

    recalculeFuel(idCompteWeb: number, payload: RecalculatePayload): Observable<void> {
        return this.http.put<void>(`${environment.apiBaseUrl}boities/${idCompteWeb}/recalculate/fuel`, payload);
    }

    recalculePaths(idCompteWeb: number, payload: RecalculatePayload): Observable<void> {
        return this.http.put<void>(`${environment.apiBaseUrl}boities/${idCompteWeb}/recalculate/paths`, payload);
    }

    recalculeBoitier(idCompteWeb: number, payload: RecalculatePayload): Observable<void> {
        return this.http.put<void>(`${environment.apiBaseUrl}boities/${idCompteWeb}/recalculate/resetboitier`, payload);
    }

    resetRT(idCompteWeb: number, payload: RecalculatePayload): Observable<void> {
        return this.http.put<void>(`${environment.apiBaseUrl}boities/${idCompteWeb}/recalculate/resetRT`, payload);
    }

    // Configuration & Settings
    getDeviceOptionConfig(idCompteWeb: number, idBoitier: number): Observable<DeviceOpt[]> {
        return this.http.get<DeviceOpt[]>(`${environment.apiBaseUrl}boities/${idCompteWeb}/options/${idBoitier}`);
    }

    getPathConfig(idCompteWeb: number, idBoitier: number): Observable<PathConfigPayload> {
        return this.http.get<PathConfigPayload>(`${environment.apiBaseUrl}boities/${idCompteWeb}/pathconfig/${idBoitier}`);
    }

    getDeviceSettings(idCompteWeb: number, idBoitier: number): Observable<DeviceSetting[]> {
        return this.http.get<DeviceSetting[]>(`${environment.apiBaseUrl}boities/${idCompteWeb}/devicesettings/${idBoitier}`);
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

    getDeviceIdImei(url: string, imei: number): Observable<any> {
        return this.http.get<any>(url + imei);
    }
}
