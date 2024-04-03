import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {dns} from "../global.config";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {AdministratorCompte, CompteServer, Option} from "../data/data";

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  compteServer: CompteServer[];
  administratorCompte: AdministratorCompte[];
  options: Option[];
  isAuthenticated: boolean = false;


  constructor(private http: HttpClient) { }

  loadTestAuthenticated(): boolean {
    let isAuthenticated: boolean | null = false;
    const token = localStorage.getItem("id_token")
    isAuthenticated = /*localStorage.getItem("isAuthenticate")*/token !== null ;

    if (isAuthenticated) {
      return true
    } else {
      return false;
    }
  }

  //=================================================
  // Options crud
  //=================================================

  /**
   * Get all Options
   *
   */

  getAllOptions(): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get<any>(`${dns}options`, { headers });
  }


  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders();
    headers = headers.append('Accept', 'application/json');
    headers = headers.append('Access-Control-Allow-Origin', '*');
    headers = headers.append('Content-Type', 'application/json');
    headers = headers.append('Authorization', this.loadToken());
    return headers;
  }

  logoutStorage() {
    localStorage.removeItem("id_token");
    localStorage.removeItem("isAuthenticate");
  }

  loadToken(): string {
    const token = localStorage.getItem("id_token");
    return token !== null ? token : '';
  }


}
