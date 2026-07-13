import {inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {AuthService} from './auth.service';
import {TraccarDto} from '../data/data';

@Injectable({
  providedIn: 'root'
})
export class TraccarService {
  private readonly authService = inject(AuthService);
  private readonly _http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}traccar`;

  getLisTraccar(keyword: string = ''): Observable<any> {
    const userObj = this.authService.getCurrentUser();
    const idTraccar = userObj?.user?.idTraccar ?? 0;
    let url = `${this.baseUrl}/${idTraccar}`;
    if (keyword) {
      url += `?keyword=${encodeURIComponent(keyword)}`;
    }
    return this._http.get(url);
  }

  createDevice(dto: TraccarDto): Observable<any> {
    return this._http.post(this.baseUrl, dto);
  }

  updateDevice(id: number, dto: TraccarDto): Observable<any> {
    return this._http.put(`${this.baseUrl}/${id}`, dto);
  }

  deleteDevice(id: number): Observable<any> {
    return this._http.delete(`${this.baseUrl}/${id}`);
  }
}
