import { Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { AdministratorCompte, CompteServer, Option } from "../data/data";

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  compteServer: CompteServer[];
  administratorCompte: AdministratorCompte[];

  isAuthenticated: boolean = false;


  constructor(private http: HttpClient) { }

  loadTestAuthenticated(): boolean {
    const token = localStorage.getItem("token");
    return token !== null;
  }

  logoutStorage() {
    localStorage.removeItem("token");
    localStorage.removeItem("id_token");
    localStorage.removeItem("isAuthenticate");
  }

}
