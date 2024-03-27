import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { dns } from '../global.config';
import { createAuthorizationHeader } from '../utils/security/headers';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  AdministratorCompte,
  Boitier,
  CompteServer,
  CompteWeb,
  DeviceOpt,
  DeviceSetting,
  Intervention,
  IpAddress,
  Option,
  RecalculatePayload,
  Tram,
  VehiculeSetting
} from '../data/data';
import { map } from "rxjs/operators";
import { jwtDecode } from "jwt-decode";

@Injectable({
  providedIn: 'root'
})
export class DataService {

  isAuthenticated: boolean | null;
  ips: IpAddress[] = [];
  options: Option[];
  administratorCompte: AdministratorCompte[];

  //List of Connection Type
  typeConnection: string;

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

  getAllCompteClientWeb(): Observable<any> {
    let headers = createAuthorizationHeader();
    return this._http.get(dns + "compteWeb/All?userName=" + this.currentUser.username, { headers: headers });
  }

  getAllLastTram(idCompteWeb: number): Observable<any> {
    let headers = createAuthorizationHeader();
    return this._http.get(dns + "compteWeb/" + idCompteWeb + "/lastTrame", { headers: headers });
  }

  exportLastTram(realtimes: Tram[]): Observable<any> {
    let headers = createAuthorizationHeader();
    return this._http.post(dns + 'compteWeb/lastTrame/export', realtimes, { headers: headers });
  }

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
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '' // Use Bearer token format
    });
    return headers;
  }

  getAllIps(): Observable<any> {
    return this._http.get(dns + "ips", { headers: this.getHeaders() }).pipe(
      map(res => res) // No need for res.json() with HttpClient
    );
  }

  prepareDBForAllDevises(idServer: number): Observable<any> {
    return this._http.get(dns + "boities/" + idServer, { headers: this.getHeaders() }).pipe(
      map(res => res)
    );
  }

  prepareDBForSingleDevise(idServer: number, idBoitier: number): Observable<any> {
    return this._http.get(dns + "boities/" + idServer + "/device/" + idBoitier, { headers: this.getHeaders() }).pipe(
      map(res => res)
    );
  }

  getAllCompteDevises(idServer: number): Observable<any> {
    return this._http.get(dns + "boities/all/" + idServer, { headers: this.getHeaders() }).pipe(
      map(res => res)
    );
  }

  getAllLastTramforAllClient(): Observable<any> {
    const headers = this.getHeaders();
    return this._http.get<any>(dns + 'compteWeb/AllLastTram', { headers });
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



  getAllIpAddresse(keyword: string, page: number, size: number): Observable<any> {
    const headers = this.getHeaders();
    return this._http.get(dns + "ips/all?keyWord=" + keyword + "&page=" + page + "&size=" + size, { headers });
  }
  deleteIpAdress(id: number) {
    const headers = this.getHeaders();
    return this._http.delete(dns + "ips/" + id, { headers });

  }
  updateIpAdress(id: number, ipAdress: IpAddress): Observable<any> {
    const headers = this.getHeaders();
    return this._http.put(dns + "ips/" + id, ipAdress, { headers });
  }

  loadTestAuthenticated(): boolean {
    var res = document.cookie.split(";");
    let isAuthenticatedstr: string = "";
    //isAuthenticatedstr = localStorage.getItem("isAuthenticateAdmin");
    if (isAuthenticatedstr == "true") {
      return true
    } else {
      return false;
    }
  }


  getCurrentUserName(): any {
    try {
      const decode = jwtDecode(localStorage.getItem("token") as never, { header: true });
      return decode;
    }
    catch (Error) {
      return null;
    }
  }

  getAllWebAccountByKeyWord(keyWord: string, page: number, size: number): Observable<any> {
    const headers = this.getHeaders();
    return this._http.get(dns + "compteWeb?keyWord=" + keyWord + "&page=" + page + "&size=" + size + "&userName=" + this.getCurrentUserName(), { headers });
  }


  deleteWebAccount(id: number) {
    const headers = this.getHeaders();
    return this._http.delete(dns + "compteWeb/" + id, { headers });
  }

  getDateLog(username: string): Observable<any> {
    const headers = this.getHeaders();
    return this._http.get(dns + "compteWeb?datelog=" + username, { headers });

  }


  ExportListComptesServer(comptesServer: CompteServer[]): Observable<any> {
    const headers = this.getHeaders();
    return this._http.post(dns + 'compteServerWeb/export', comptesServer, { headers });
  }

  getAllServerAccount(keyWord: string, page: number, size: number): Observable<any> {
    const headers = this.getHeaders();
    return this._http.get(dns + "compteServerWeb?keyWord=" + keyWord + "&page=" + page + "&size=" + size + "&userName=" + this.getCurrentUserName(), { headers });
  }

  deleteCompteServer(id: number) {
    const headers = this.getHeaders();
    this._http.delete(dns + "compteServer/" + id, { headers });
  }

  updateServerCompte(id: number, compteServer: CompteServer): Observable<any> {
    const headers = this.getHeaders();
    return this._http.put(dns + "compteServer/" + id, compteServer, { headers });
  }

  getCompteServerById(id: number): Observable<any> {
    const headers = this.getHeaders();
    return this._http.get(dns + "compteServer/" + id, { headers });
  }

  getBoitierOfAccount(keyWord: string, id: number, page: number, size: number): Observable<any> {
    const headers = this.getHeaders();
    return this._http.get(dns + "compteServer/" + id + "/Boitiers?&keyWord=" + keyWord + "&page=" + page + "&size=" + size, { headers });
  }

  updateBoitier(boitier: Boitier, idServer: number, updateType: string): Observable<any> {
    const headers = this.getHeaders();
    return this._http.put(dns + "boities?idServer=" + idServer + "&updateType=" + updateType, boitier, { headers });
  }


  lastArchiveOfBoitier(numBoitier: number): Observable<any> {
    const headers = this.getHeaders();
    return this._http.get(dns + "boities/" + numBoitier + "/lastArchive", { headers });
  }

  extendIntervalOfBoitiers(idCompteServer: number): Observable<any> {
    const headers = this.getHeaders();
    return this._http.put(dns + "compteServer/" + idCompteServer + "/newInterval", null, { headers });
  }

  addBoitiers(idCompteServer: number, nbrBoitiers: number): Observable<any> {
    const headers = this.getHeaders();
    return this._http.post(dns + "compteServer/" + idCompteServer + "?nombreBoitier=" + nbrBoitiers, null, { headers });
  }

  getAllAdminComptesByKeyWord(keyWord: string, page: number, size: number): any {
    const headers = this.getHeaders();
    if (this.isAgentAdmin()) {
      return this._http.get(dns + "adminCompteWeb/all?keyWord=" + keyWord + "&page=" + page + "&size=" + size, { headers });
    }
  }

  addAdminCompte(adminCompte: AdministratorCompte): any {
    const headers = this.getHeaders();
    if (this.isAgentAdmin()) {
      return this._http.post(dns + "adminCompteWeb/add", adminCompte, { headers });
    }
  }

  createServerComptewithBoitier(compteServer: CompteServer, nbrBoitiers: number): Observable<any> {
    const headers = this.getHeaders();
    return this._http.post(dns + "compteServer/addNewComptewithBoitier?nombreBoitier=" + nbrBoitiers + "&username=" + this.getCurrentUserName(), compteServer, { headers });
  }

  isExistPseudo(pseudo: String): Observable<any> {
    const headers = this.getHeaders();
    return this._http.get(dns + "/compteServer/pseudo?pseudo=" + pseudo, { headers });

  }
  isExistLogin(login: String): Observable<any> {
    const headers = this.getHeaders();
    return this._http.get(dns + "/compteServer/login?login=" + login, { headers });

  }

  getAllOptions(): Observable<any> {
    const headers = this.getHeaders();
    return this._http.get(dns + "options", { headers });
  }

  logoutStorage() {
    localStorage.removeItem("token");
    localStorage.removeItem("isAuthenticate");
  }

  getAllServerAccountForForm(): Observable<any> {
    const headers = this.getHeaders();
    let keyWord = "";
    return this._http.get(dns + "compteServerWeb?keyWord=" + keyWord + "&size=" + 1000000 + "&userName=" + this.getCurrentUserName(), { headers });
  }

  associateCompteWebToCompteServer(idWeb: number, idServer: number): Observable<any> {
    const headers = this.getHeaders();
    return this._http.put(dns + "compteWeb/" + idWeb + "/compteServer/" + idServer, null, { headers });
  }

  addCompteWeb(compteWeb: CompteWeb): Observable<any> {
    const headers = this.getHeaders();
    return this._http.post(dns + "compteWeb?userName=" + this.getCurrentUserName(), compteWeb,  { headers });
  }

}
