import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class AuthentificationService {

  USER_TOKEN: string = "";
  TOKEN_PREFIX: string = "Bearer ";
  currentUser = null;
  private readonly _http = inject(HttpClient);

  //=================================
  // authentication
  //=================================

  authentificate(login: string, password: string): Observable<any> {
    const loginRequest = {
      username: login,
      password: password
    };

    return this._http.post(environment.apiBaseUrl + "authenticate", loginRequest);
  }

  saveTokenInStorage(token: string, isAuthenticated: boolean) {
    this.USER_TOKEN = this.TOKEN_PREFIX + token;
    localStorage.setItem("token", this.USER_TOKEN);
    localStorage.setItem("isAuthenticate", "" + isAuthenticated);
  }
}
