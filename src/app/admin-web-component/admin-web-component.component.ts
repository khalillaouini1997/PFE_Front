import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { AdministratorCompte } from '../data/data';
import { DataService } from '../service/data.service';
import { owner } from '../global.config';
import { NgIf, NgClass } from '@angular/common';

@Component({
    selector: 'app-admin-web-component',
    templateUrl: './admin-web-component.component.html',
    styleUrls: ['./admin-web-component.component.css'],
    standalone: true,
    imports: [NgIf, NgClass, RouterLink, RouterLinkActive, RouterOutlet]
})
export class AdminWebComponentComponent implements OnInit {

  isActiveDashBoard: boolean = true;
  isActiveServerForm: boolean = false;
  isActiveForm: boolean = false;
  isActiveListServer: boolean = false;
  isActiveListWeb: boolean = false;
  isActiveRequest: boolean = false;
  isActiveIntervention: boolean = false;
  isActiveAccessLog: boolean = false;
  isActiveTraccar: boolean = false;
  isActiveAdminCompte: boolean = false;
  isActiveAddAdminCompte: boolean = false;
  owner: string;
  global: string;

  // Declaration vars !!!
  public currentUser: AdministratorCompte = new AdministratorCompte();
  constructor(private router: Router, private service: DataService) {
    this.owner = owner;
    this.currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  }

  ngOnInit() {
    this.service.isAuthenticated = this.service.loadTestAuthenticated();

    if (!this.service.isAuthenticated) {
      this.router.navigate(['/error']);
    } else {
      this.service.getAllOptions().subscribe(res => {
        this.service.options = res;
      });
    }

  }

  //=====================================
  //    Log Out
  //=====================================

  logout() {
    this.router.navigate(['/authentification']);
    this.service.logoutStorage();
  }

  isAdminGolbal(): any {
    let currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (currentUser.user.role != 'REPORTER') {
      return true;
    }
  }

  isWebAdmin() : any {
    let currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (currentUser.user.role != 'WEBADMIN') {
      return true;
    }
  }


  isReporter(): any {
    for (let i = 0; i < this.service.administratorCompte.length; i++) {
      if (this.service.administratorCompte[i].role == 'REPORTER') {
        return 'REPORTER';
      }
    }
  }

  isAgent() : any {
    let currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (currentUser.user.role == 'AGENT') {
      return true;
    }
  }

  isUserName() : any {
    let currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (currentUser.user.username == 'fasttrackw') {
      return true;
    }
  }

  isGlobalAdmin() : any {
    let currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (currentUser.user.role == 'GLOBALADMIN' || currentUser.user.role == 'WEBADMIN') {
      return true;
    }
  }

  isGlobalAdminDesc() : any {
    let currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (currentUser.user.role == 'GLOBALADMINDESC') {
      return true;
    }
  }

  isAgentAdmin(): boolean {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    return currentUser && currentUser.user && currentUser.user.role === 'GLOBALADMIN';
  }
}
