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

  getLisTraccar(keyword: string = ''): Observable<any> {
    const userObj = this.authService.getCurrentUser();
    console.log('TRACCAR DEBUG: userObj =', JSON.stringify(userObj));
    console.log('TRACCAR DEBUG: userObj?.user =', JSON.stringify(userObj?.user));
    console.log('TRACCAR DEBUG: userObj?.user?.idTraccar =', userObj?.user?.idTraccar);
    const idTraccar = userObj?.user?.idTraccar ?? 0;
    console.log('TRACCAR DEBUG: final idTraccar =', idTraccar);
    let url = `${environment.apiBaseUrl}traccar/${idTraccar}`;
    if (keyword) {
      url += `?keyword=${encodeURIComponent(keyword)}`;
    }
    return this._http.get(url);
  }
}

