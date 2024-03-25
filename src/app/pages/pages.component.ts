import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdministratorCompte } from '../data/data';
import { DashboardService } from '../service/dashboard.service';
import { owner } from '../global.config';

@Component({
  selector: 'app-pages',
  templateUrl: './pages.component.html',
  styleUrls: ['./pages.component.scss']
})
export class PagesComponent implements OnInit {
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
  currentUser: AdministratorCompte | null = null;

  constructor(private router: Router, private dashboardService: DashboardService) {
    this.owner = owner;
    this.currentUser = JSON.parse(localStorage.getItem('currentUser') ?? 'null');
  }

  ngOnInit(): void {
    this.dashboardService.isAuthenticated = this.dashboardService.loadTestAuthenticated();
    if (!this.dashboardService.isAuthenticated) {
      this.router.navigate(['/error']);
    } else {
      this.loadOptions();
    }
  }

  loadOptions(): void {
    this.dashboardService.getAllOptions().subscribe(res => {
      this.dashboardService.options = res;
    });
  }

  logout(): void {
    this.router.navigate(['/authentification']);
    this.dashboardService.logoutStorage();
  }

  isAdminGlobal(): boolean {
    const currentUser = JSON.parse(localStorage.getItem('user') ?? '{}');
    return currentUser.user?.role !== 'REPORTER';
  }

  isWebAdmin(): boolean {
    const currentUser = JSON.parse(localStorage.getItem('user') ?? '{}');
    return currentUser.user?.role !== 'WEBADMIN';
  }

  isReporter(): string {
    const reporter = this.dashboardService.administratorCompte.find(user => user.role === 'REPORTER');
    return reporter ? 'REPORTER' : '';
  }

  isAgent(): boolean {
    const currentUser = JSON.parse(localStorage.getItem('user') ?? '{}');
    return currentUser.user?.role === 'AGENT';
  }

  isUserName(): boolean {
    const currentUser = JSON.parse(localStorage.getItem('user') ?? '{}');
    return currentUser.user?.username === 'fasttrackw';
  }

  isGlobalAdmin(): boolean {
    const currentUser = JSON.parse(localStorage.getItem('user') ?? '{}');
    return currentUser.user?.role === 'GLOBALADMIN' || currentUser.user?.role === 'WEBADMIN';
  }

  isGlobalAdminDesc(): boolean {
    const currentUser = JSON.parse(localStorage.getItem('user') ?? '{}');
    return currentUser.user?.role === 'GLOBALADMINDESC';
  }

  isAgentAdmin(): boolean {
    const currentUser = JSON.parse(localStorage.getItem('user') ?? '{}');
    return currentUser.user?.role === 'GLOBALADMIN';
  }
}
