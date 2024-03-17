import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { dns } from '../global.config';


@Injectable({
  providedIn: 'root'
})
export class AuthentificationService {

  USER_TOKEN: string = "";
  TOKEN_PREFIX: string = "rimtel ";
  currentUser = null;
  constructor(private _http: HttpClient) { }

  //=================================
  // authentication
  //=================================

  authentificate(login: string, password: string): Observable<any> {

    let headers = new HttpHeaders({
      "Content-Type": "application/json"
    });

    return this._http.post(dns + "authenticate?username=" + login + "&password=" + password, { headers: headers });
  }


  saveTokenInStorage(token: string, isAuthenticated: boolean) {
    this.USER_TOKEN = this.TOKEN_PREFIX + token
    localStorage.setItem("token", this.USER_TOKEN);
    localStorage.setItem("isAuthenticate", "" + isAuthenticated);

  }
}
