import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AccessLogService {
    private readonly http = inject(HttpClient);

    getAllAccessLog(keyWord: string, page: number, size: number): Observable<any> {
        return this.http.get<any>(`${environment.apiBaseUrl}accessLog?keyWord=${keyWord}&page=${page}&size=${size}`);
    }
}
