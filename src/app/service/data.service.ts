import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { dns } from '../global.config';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import {
  AdministratorCompte, Boitier, CompteServer,
  DeviceOpt,
  DeviceSetting,
  Intervention,
  IpAddress,
  Option,
  RecalculatePayload,
  Tram,
  VehiculeSetting
} from '../data/data';
import { catchError, map } from "rxjs/operators";
import { jwtDecode } from "jwt-decode";

@Injectable({
  providedIn: 'root'
})
export class DataService {

  isAuthenticated: boolean | null;
  ips: IpAddress[] = [];
  options: Option[];
  administratorCompte: AdministratorCompte[];

  typeConnection: { type: string; }[] = [
    { type: "jdbc" },
    { type: "http " }
  ];

  codesPays = [
    { key: "Maroc", value: "212" },
    { key: "Afrique du Sud", value: "27" },
    { key: "Algérie", value: "213" },
    { key: "Angola", value: "244" },
    { key: "Bénin", value: "229" },
    { key: "Botswana", value: "267" },
    { key: "Burkina Faso", value: "226" },
    { key: "Burundi", value: "257" },
    { key: "Cameroun", value: "237" },
    { key: "Cap Vert", value: "238" },
    { key: "Comores", value: "269" },
    { key: "Côte d'Ivoire", value: "225" },
    { key: "Djibouti", value: "253" },
    { key: "Égypte", value: "20" },
    { key: "Éthiopie", value: "251" },
    { key: "Gabon", value: "241" },
    { key: "Gambie", value: "220" },
    { key: "Ghana", value: "233" },
    { key: "Guinée", value: "224" },
    { key: "Guinée Bisseau", value: "245" },
    { key: "Guinée Équatoriale", value: "240" },
    { key: "Kenya", value: "254" },
    { key: "Lesotho", value: "266" },
    { key: "Lybie", value: "218" },
    { key: "Madagascar", value: "261" },
    { key: "Malawi", value: "265" },
    { key: "Maurice", value: "230" },
    { key: "Mauritanie", value: "222" },
    { key: "Mozambique", value: "258" },
    { key: "Namibie", value: "264" },
    { key: "Niger", value: "227" },
    { key: "Nigeria", value: "234" },
    { key: "Ouganda", value: "256" },
    { key: "République démocratique du Congo", value: "243" },
    { key: "République Congo", value: "242" },
    { key: "Rwanda", value: "250" },
    { key: "Sao Tome-et-Principe", value: "239" },
    { key: "Sénégal", value: "221" },
    { key: "Seychelles", value: "248" },
    { key: "Sierra Leone", value: "232" },
    { key: "Somalie", value: "252" },
    { key: "Soudan", value: "249" },
    { key: "Swaziland", value: "268" },
    { key: "Tanzanie", value: "255" },
    { key: "Tchad", value: "235" },
    { key: "Togo", value: "228" },
    { key: "Tunisie", value: "216" },
    { key: "Zimbabwe", value: "263" },

  ]

  currentUser: AdministratorCompte;
  constructor(private _http: HttpClient) { }



  isAgentAdmin(): boolean {
    const userString = localStorage.getItem('user');
    if (userString) {
      const currentUser = JSON.parse(userString);
      if (currentUser && (currentUser.user.role === 'GLOBALADMIN' || currentUser.user.role === 'WEBADMIN')) {
        return true;
      }
    }
    return false;
  }

  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders();
    headers = headers.append('Accept', 'application/json');
    headers = headers.append('Access-Control-Allow-Origin', '*');
    headers = headers.append('Content-Type', 'application/json');
    headers = headers.append('Authorization', this.loadToken());
    return headers;
  }

  loadToken(): string {
    const token = localStorage.getItem("token");
    return token !== null ? token : '';
  }

  getAllIps(): Observable<any> {
    const headers = this.getHeaders();
    return this._http.get<any>(`${dns}ips`, { headers }).pipe(
      map(res => res) // No need for res.json() with HttpClient
    );
  }


  prepareDBForAllDevises(idServer: number): Observable<any> {
    return this._http.get<any>(`${dns}boities/${idServer}`, { headers: this.getHeaders() }).pipe(
      map(res => res)
    );
  }

  prepareDBForSingleDevise(idServer: number, idBoitier: number): Observable<any> {
    return this._http.get<any>(`${dns}boities/${idServer}/device/${idBoitier}`, { headers: this.getHeaders() }).pipe(
      map(res => res)
    );
  }

  getAllCompteDevises(idServer: number): Observable<any> {
    return this._http.get<any>(`${dns}boities/all/${idServer}`, { headers: this.getHeaders() }).pipe(
      map(res => res)
    );
  }

  updateBoitier(boitier: Boitier, idServer: number, updateType: string): Observable<any> {
    const options = { headers: this.getHeaders() };
    return this._http.put<any>(`${dns}boities?idServer=${idServer}&updateType=${updateType}`, boitier, options);
  }

  lastArchiveOfBoitier(numBoitier: number): Observable<any> {
    const options = { headers: this.getHeaders() };
    return this._http.get<any>(`${dns}boities/${numBoitier}/lastArchive`, options);
  }




  recalculeHistorique(idCompteWeb: number, recalculatePayload: RecalculatePayload): Observable<any> {
    const headers = this.getHeaders();
    return this._http.put<any>(`${dns}boities/${idCompteWeb}/recalculate/historique`, recalculatePayload, { headers });
  }

  recalculeAlert(idCompteWeb: number, recalculatePayload: RecalculatePayload): Observable<any> {
    const headers = this.getHeaders();
    return this._http.put<any>(`${dns}boities/${idCompteWeb}/recalculate/alert`, recalculatePayload, { headers });
  }

  recalculeFuel(idCompteWeb: number, recalculatePayload: RecalculatePayload): Observable<any> {
    const headers = this.getHeaders();
    return this._http.put<any>(`${dns}boities/${idCompteWeb}/recalculate/fuel`, recalculatePayload, { headers });
  }

  recalculePaths(idCompteWeb: number, recalculePaths: RecalculatePayload): Observable<any> {
    const headers = this.getHeaders();
    return this._http.put<any>(`${dns}boities/${idCompteWeb}/recalculate/paths`, recalculePaths, { headers });
  }

  recalculeBoitier(idCompteWeb: number, recalculePaths: RecalculatePayload): Observable<any> {
    const headers = this.getHeaders();
    return this._http.put<any>(`${dns}boities/${idCompteWeb}/recalculate/resetboitier`, recalculePaths, { headers });
  }

  resetRT(idCompteWeb: number, recalculePaths: RecalculatePayload): Observable<any> {
    const headers = this.getHeaders();
    return this._http.put<any>(`${dns}boities/${idCompteWeb}/recalculate/resetRT`, recalculePaths, { headers });
  }

  getDeviceOptionConfig(idCompteWeb: number, idBoitier: number): Observable<any> {
    const headers = this.getHeaders();
    return this._http.get<any>(`${dns}boities/${idCompteWeb}/options/${idBoitier}`, { headers });
  }

  getPathConfig(idCompteWeb: number, idBoitier: number): Observable<any> {
    const headers = this.getHeaders();
    return this._http.get<any>(`${dns}boities/${idCompteWeb}/pathconfig/${idBoitier}`, { headers });
  }

  getDeviceSettings(idCompteWeb: number, idBoitier: number): Observable<any> {
    const headers = this.getHeaders();
    return this._http.get<any>(`${dns}boities/${idCompteWeb}/devicesettings/${idBoitier}`, { headers });
  }

  editDeviceOptionConfig(idCompteWeb: number, deviceOpt: DeviceOpt): Observable<any> {
    const headers = this.getHeaders();
    return this._http.put<any>(`${dns}boities/${idCompteWeb}/options`, deviceOpt, { headers });
  }

  editDeviceSetting(idCompteWeb: number, deviceSetting: DeviceSetting): Observable<any> {
    const headers = this.getHeaders();
    return this._http.put<any>(`${dns}boities/${idCompteWeb}/settings`, deviceSetting, { headers });
  }

  resetOdometre(idCompteWeb: number, vehiculeSetting: VehiculeSetting): Observable<any> {
    const headers = this.getHeaders();
    return this._http.put<any>(`${dns}boities/${idCompteWeb}/resetOdo`, vehiculeSetting, { headers });
  }

  getIntervention(idTenant: number): Observable<any> {
    const headers = this.getHeaders();
    return this._http.get<any>(`${dns}help/list/${idTenant}`, { headers });
  }

  updateIntervention(interventionUpdate: Intervention, idTenant: number): Observable<boolean> {
    const headers = this.getHeaders();
    return this._http.post<any>(`${dns}help/update/?tenantId=${idTenant}`, interventionUpdate, { headers });
  }

  getVehiculeInfo(page: number, size: number): Observable<any> {
    const headers = this.getHeaders();
    return this._http.get<any>(`${dns}vehicule/list?page=${page}&size=${size}`, { headers });
  }

  updateTechnicianIntervention(deviceId: number, date: Date): Observable<boolean> {
    const headers = this.getHeaders();
    return this._http.post<boolean>(`${dns}vehicule/update/${deviceId}`, date, { headers });
  }

  getDeviceIdImei(url: string, imei: number): Observable<any> {
    const headers = this.getHeaders();
    return this._http.get<any>(url + imei, { headers });
  }

  getAllAccessLog(keyWord: string, page: number, size: number): Observable<any> {
    const headers = this.getHeaders();
    return this._http.get<any>(`${dns}accessLog?keyWord=${keyWord}&page=${page}&size=${size}`, { headers });
  }


  saveIpAddres(ipAddress: IpAddress): Observable<any> {
    const headers = this.getHeaders();
    return this._http.post(`${dns}ips`, ipAddress, { headers });
  }


  getAllIpAddresse(keyword: string, page: number, size: number): Observable<any> {
    const headers = this.getHeaders();
    return this._http.get<any>(`${dns}ips/all?keyWord=${keyword}&page=${page}&size=${size}`, { headers });
  }

  deleteIpAdress(id: number) {
    const headers = this.getHeaders();
    return this._http.delete(`${dns}ips/${id}`, { headers });
  }

  updateIpAdress(id: number, ipAdress: IpAddress): Observable<any> {
    const headers = this.getHeaders();
    return this._http.put<any>(`${dns}ips/${id}`, ipAdress, { headers });
  }


  loadTestAuthenticated(): boolean {
    var res = document.cookie.split(";");
    let isAuthenticatedstr: string = "";
    //isAuthenticatedstr = localStorage.getItem("isAuthenticateAdmin");
    return isAuthenticatedstr == "true";
  }


  getAllAdminComptesByKeyWord(keyWord: string, page: number, size: number): Observable<any> {
    const headers = this.getHeaders();
    if (this.isAgentAdmin()) {
      return this._http.get<any>(`${dns}adminCompteWeb/all?keyWord=${keyWord}&page=${page}&size=${size}`, { headers });
    } else {
      return throwError("Not authorized to access administrator accounts.");
    }
  }

  addAdminCompte(adminCompte: AdministratorCompte): Observable<any> {
    const headers = this.getHeaders();
    if (this.isAgentAdmin()) {
      return this._http.post<any>(`${dns}adminCompteWeb/add`, adminCompte, { headers });
    } else {
      return throwError("Not authorized to add administrator accounts.");
    }
  }

  getAllOptions(): Observable<any> {
    const headers = this.getHeaders();
    return this._http.get<any>(`${dns}options`, { headers });
  }


  logoutStorage() {
    localStorage.removeItem("token");
    localStorage.removeItem("isAuthenticate");
  }

  getAllServerAccountForForm(): Observable<any> {
    const headers = this.getHeaders();
    let keyWord = "";
    return this._http.get<any>(`${dns}compteServerWeb?keyWord=${keyWord}&size=${1000000}&userName=${this.getCurrentUserName()}`, { headers });
  }

  createServerComptewithBoitier(compteServer: CompteServer, nbrBoitiers: number): Observable<any> {
    let options = { headers: this.getHeaders() };
    return this._http.post<any>(dns + "compteServer/addNewComptewithBoitier?nombreBoitier=" + nbrBoitiers + "&username=" + this.getCurrentUserName(), compteServer, options);
  }

  associateCompteWebToCompteServer(idWeb: number, idServer: number): Observable<any> {
    const headers = this.getHeaders();
    return this._http.put<any>(`${dns}compteWeb/${idWeb}/compteServer/${idServer}`, null, { headers });
  }




  /**
   *
   * all Administrator compte
   *
   */
  getAllAdministratorCompteService(keyWord: string, page: number, size: number): Observable<any> {
    const headers = this.getHeaders();
    if (this.isAgentAdmin()) {
      return this._http.get<any>(`${dns}adminCompteWeb?keyWord=${keyWord}&page=${page}&size=${size}`, { headers }).pipe(
        catchError(this.handleError)
      );
    } else {
      return throwError("Not authorized to access administrator accounts.");
    }
  }


  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(errorMessage);
  }

  getCurrentUserName(): any {
    try {
      if (localStorage.getItem("currentUser") != null) {
        let decode: AdministratorCompte = JSON.parse(localStorage.getItem("currentUser") || "{}").user;
        return decode.username;
      }
    } catch (Error) {
      return null;
    }
  }

}
