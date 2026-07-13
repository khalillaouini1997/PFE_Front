import {inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {IpAddress, PageResponse} from '../data/data';

@Injectable({
  providedIn: 'root'
})
export class IpAddressService {
  readonly typeConnection: { type: string; }[] = [
    {type: "jdbc"},
    {type: "http"}
  ];
  private readonly http = inject(HttpClient);

  getAllIpAddresses(keyword: string, page: number, size: number): Observable<PageResponse<IpAddress>> {
    return this.http.get<PageResponse<IpAddress>>(`${environment.apiBaseUrl}ips/all?keyWord=${keyword}&page=${page}&size=${size}`);
  }

  saveIpAddress(ipAddress: IpAddress): Observable<IpAddress> {
    return this.http.post<IpAddress>(`${environment.apiBaseUrl}ips`, ipAddress);
  }

  deleteIpAddress(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiBaseUrl}ips/${id}`);
  }

  updateIpAddress(id: number, ipAddress: IpAddress): Observable<IpAddress> {
    return this.http.put<IpAddress>(`${environment.apiBaseUrl}ips/${id}`, ipAddress);
  }
}
