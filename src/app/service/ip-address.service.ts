import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { IpAddress } from '../data/data';

@Injectable({
    providedIn: 'root'
})
export class IpAddressService {
    private readonly http = inject(HttpClient);

    readonly typeConnection: { type: string; }[] = [
        { type: "jdbc" },
        { type: "http " }
    ];

    getAllIps(): Observable<IpAddress[]> {
        return this.http.get<IpAddress[]>(`${environment.apiBaseUrl}ips`);
    }

    getAllIpAddresses(keyword: string, page: number, size: number): Observable<any> {
        return this.http.get<any>(`${environment.apiBaseUrl}ips/all?keyWord=${keyword}&page=${page}&size=${size}`);
    }

    saveIpAddress(ipAddress: IpAddress): Observable<any> {
        return this.http.post(`${environment.apiBaseUrl}ips`, ipAddress);
    }

    deleteIpAddress(id: number): Observable<any> {
        return this.http.delete(`${environment.apiBaseUrl}ips/${id}`);
    }

    updateIpAddress(id: number, ipAddress: IpAddress): Observable<any> {
        return this.http.put<any>(`${environment.apiBaseUrl}ips/${id}`, ipAddress);
    }
}
