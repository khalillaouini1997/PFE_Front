import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { dns } from '../global.config';


@Injectable({
  providedIn: 'root'
})
export class AuthentificationService {

  USER_TOKEN: string = "";
  TOKEN_PREFIX: string = "Bearer ";
  currentUser = null;
  constructor(private _http: HttpClient) { }

  //=================================
  // authentication
  //=================================

  authentificate(login: string, password: string): Observable<any> {
    const loginRequest = {
      username: login,
      password: password
    };

    return this._http.post(dns + "authenticate", loginRequest);
  }


  saveTokenInStorage(token: string, isAuthenticated: boolean) {
    this.USER_TOKEN = this.TOKEN_PREFIX + token;
    localStorage.setItem("token", this.USER_TOKEN);
    localStorage.setItem("id_token", token);
    localStorage.setItem("isAuthenticate", "" + isAuthenticated);
  }
}
