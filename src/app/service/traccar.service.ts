import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class TraccarService {
  private readonly authService = inject(AuthService);
  private readonly _http = inject(HttpClient);

  getLisTraccar(): Observable<any> {
    const userObj = this.authService.getCurrentUser();
    const idTraccar = userObj?.user?.idTraccar ?? 0;
    const url = `${environment.apiBaseUrl}traccar/${idTraccar}`;
    return this._http.get(url);
  }
}

