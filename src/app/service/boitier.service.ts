import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Boitier, RecalculatePayload, DeviceOpt, DeviceSetting, VehiculeSetting, PathConfigPayload } from '../data/data';

@Injectable({
    providedIn: 'root'
})
export class BoitierService {
    private readonly http = inject(HttpClient);

    // Preparation & Listing
    prepareDBForAllDevises(idServer: number): Observable<any> {
        return this.http.get<any>(`${environment.apiBaseUrl}boities/${idServer}`);
    }

    prepareDBForSingleDevise(idServer: number, idBoitier: number): Observable<any> {
        return this.http.get<any>(`${environment.apiBaseUrl}boities/${idServer}/device/${idBoitier}`);
    }

    getAllCompteDevises(idServer: number): Observable<any> {
        return this.http.get<any>(`${environment.apiBaseUrl}boities/all/${idServer}`);
    }

    getBoitierOfAccount(id: number, keyword: string, page: number, size: number): Observable<any> {
        return this.http.get<any>(`${environment.apiBaseUrl}compteServer/${id}/Boitiers?keyWord=${keyword}&page=${page}&size=${size}`);
    }

    getAllBoitierofIdcompte(idCompteServer: number): Observable<any> {
        return this.http.get<any>(`${environment.apiBaseUrl}compteServer/${idCompteServer}/listBoitiers`);
    }

    // CRUD & Updates
    addBoitiers(idCompteServer: number, nbrBoitiers: number): Observable<any> {
        return this.http.post<any>(`${environment.apiBaseUrl}compteServer/${idCompteServer}?nombreBoitier=${nbrBoitiers}`, null);
    }

    deleteCompteServer(id: number): Observable<any> {
        return this.http.delete<any>(`${environment.apiBaseUrl}compteServer/${id}`);
    }

    updateBoitier(boitier: Boitier, idServer: number, updateType: string): Observable<any> {
        return this.http.put<any>(`${environment.apiBaseUrl}boities?idServer=${idServer}&updateType=${updateType}`, boitier);
    }

    // Archives & Raws
    lastArchiveOfBoitier(numBoitier: number): Observable<any> {
        return this.http.get<any>(`${environment.apiBaseUrl}boities/${numBoitier}/lastArchive`);
    }

    getRaws(numBoitier: number, limit: number): Observable<any> {
        return this.http.get<any>(`${environment.apiBaseUrl}boities/${numBoitier}/Raw/${limit}`);
    }

    getArchiveOfBoitier(numboitier: number, limit: number): Observable<any> {
        return this.http.get<any>(`${environment.apiBaseUrl}boities/${numboitier}/Archives/${limit}`);
    }

    // Recalculation
    recalculeHistorique(idCompteWeb: number, payload: RecalculatePayload): Observable<any> {
        return this.http.put<any>(`${environment.apiBaseUrl}boities/${idCompteWeb}/recalculate/historique`, payload);
    }

    recalculeAlert(idCompteWeb: number, payload: RecalculatePayload): Observable<any> {
        return this.http.put<any>(`${environment.apiBaseUrl}boities/${idCompteWeb}/recalculate/alert`, payload);
    }

    recalculeFuel(idCompteWeb: number, payload: RecalculatePayload): Observable<any> {
        return this.http.put<any>(`${environment.apiBaseUrl}boities/${idCompteWeb}/recalculate/fuel`, payload);
    }

    recalculePaths(idCompteWeb: number, payload: RecalculatePayload): Observable<any> {
        return this.http.put<any>(`${environment.apiBaseUrl}boities/${idCompteWeb}/recalculate/paths`, payload);
    }

    recalculeBoitier(idCompteWeb: number, payload: RecalculatePayload): Observable<any> {
        return this.http.put<any>(`${environment.apiBaseUrl}boities/${idCompteWeb}/recalculate/resetboitier`, payload);
    }

    resetRT(idCompteWeb: number, payload: RecalculatePayload): Observable<any> {
        return this.http.put<any>(`${environment.apiBaseUrl}boities/${idCompteWeb}/recalculate/resetRT`, payload);
    }

    // Configuration & Settings
    getDeviceOptionConfig(idCompteWeb: number, idBoitier: number): Observable<any> {
        return this.http.get<any>(`${environment.apiBaseUrl}boities/${idCompteWeb}/options/${idBoitier}`);
    }

    getPathConfig(idCompteWeb: number, idBoitier: number): Observable<any> {
        return this.http.get<any>(`${environment.apiBaseUrl}boities/${idCompteWeb}/pathconfig/${idBoitier}`);
    }

    getDeviceSettings(idCompteWeb: number, idBoitier: number): Observable<any> {
        return this.http.get<any>(`${environment.apiBaseUrl}boities/${idCompteWeb}/devicesettings/${idBoitier}`);
    }

    editDeviceOptionConfig(idCompteWeb: number, deviceOpt: DeviceOpt): Observable<any> {
        return this.http.put<any>(`${environment.apiBaseUrl}boities/${idCompteWeb}/options`, deviceOpt);
    }

    editDeviceSetting(idCompteWeb: number, deviceSetting: DeviceSetting): Observable<any> {
        return this.http.put<any>(`${environment.apiBaseUrl}boities/${idCompteWeb}/settings`, deviceSetting);
    }

    editPathConfig(idServer: number, pathConfigPayload: PathConfigPayload): Observable<any> {
        return this.http.post<any>(`${environment.apiBaseUrl}boities/editPathConfig/${idServer}`, pathConfigPayload);
    }

    resetOdometre(idCompteWeb: number, vehiculeSetting: VehiculeSetting): Observable<any> {
        return this.http.put<any>(`${environment.apiBaseUrl}boities/${idCompteWeb}/resetOdo`, vehiculeSetting);
    }

    getDeviceIdImei(url: string, imei: number): Observable<any> {
        return this.http.get<any>(url + imei);
    }
}
