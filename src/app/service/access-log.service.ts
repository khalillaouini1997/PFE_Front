import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AccessLog, PageResponse } from '../data/data';

@Injectable({
    providedIn: 'root'
})
export class AccessLogService {
    private readonly http = inject(HttpClient);

    getAllAccessLog(keyWord: string, page: number, size: number): Observable<PageResponse<AccessLog>> {
        return this.http.get<PageResponse<AccessLog>>(`${environment.apiBaseUrl}accessLog?keyWord=${keyWord}&page=${page}&size=${size}`);
    }
}
