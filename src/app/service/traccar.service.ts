import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { dns } from '../global.config';
import { AdministratorCompte } from '../data/data';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class TraccarService {
  public currentUser: AdministratorCompte;

  constructor(private _http: HttpClient) {

  }

  getLisTraccar(): Observable<any> {
    this.currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const url = `${dns}traccar/${this.currentUser.idTraccar}`;
    return this._http.get(url);
  }

}
