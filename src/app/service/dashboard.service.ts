import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  isAuthenticated: boolean = false;

  constructor() { }

  loadTestAuthenticated(): boolean {
    let isAuthenticated: string | null = "";
    isAuthenticated = localStorage.getItem("isAuthenticate");
    if (isAuthenticated == "true") {
      return true
    } else {
      return false;
    }
  }
}
