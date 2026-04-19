import { Router, RouterModule } from '@angular/router';
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdministratorCompte } from '../data/data';
import { WebAccountService } from '../service/web-account.service';
import { WebSocketService } from '../service/web-socket.service';
import { AuthService } from '../service/auth.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-admin-web-component',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './admin-web-component.component.html',
  styleUrls: ['./admin-web-component.component.css']
})
export class AdminWebComponentComponent implements OnInit {

  isCollapsed = signal(false);
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
  owner: string = "TDS";
  notificationCount: number = 0;

  public currentUser: AdministratorCompte = new AdministratorCompte();

  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly webAccountService = inject(WebAccountService);
  private readonly webSocketService = inject(WebSocketService);
  private readonly translate = inject(TranslateService);

  constructor() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  }

  ngOnInit() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/authentification']);
      return;
    }

    this.webSocketService.getNotifications().subscribe(notification => {
      if (notification) {
        this.notificationCount++;
      }
    });

    this.webAccountService.getAllOptions().subscribe({
      next: (res) => {
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/authentification']);
  }

  isAdminGolbal(): boolean {
    return this.authService.hasRole('GLOBALADMIN');
  }

  isWebAdmin(): boolean {
    return this.authService.hasRole('WEBADMIN');
  }

  isReporter(): boolean {
    return this.authService.hasRole('REPORTER');
  }

  isAgent(): boolean {
    return this.authService.hasRole('AGENT');
  }

  isGlobalAdmin(): boolean {
    return this.authService.hasRole('GLOBALADMIN') || this.authService.hasRole('WEBADMIN');
  }

  isAgentAdmin(): boolean {
    return this.authService.hasRole('AGENT') || this.authService.hasRole('GLOBALADMIN');
  }

  isGlobalAdminDesc(): boolean {
    return this.authService.hasRole('GLOBALADMINDESC');
  }

  toggleSidebar() {
    this.isCollapsed.update(v => !v);
  }

  setMenu(menu: string) {
    this.isActiveDashBoard = menu === 'dashboard';
    this.isActiveAddAdminCompte = menu === 'addAdmin';
    this.isActiveAdminCompte = menu === 'listAdmin';
    this.isActiveServerForm = menu === 'addServer';
    this.isActiveListServer = menu === 'listServer';
    this.isActiveForm = menu === 'addWeb';
    this.isActiveListWeb = menu === 'listWeb';
    this.isActiveAccessLog = menu === 'logs';
    this.isActiveTraccar = menu === 'traccar';
  }

  changeLanguage(lang: string) {
    this.translate.use(lang);
    localStorage.setItem('language', lang);
  }

  isLang(lang: string): boolean {
    return this.translate.currentLang === lang || (lang === 'fr' && !this.translate.currentLang);
  }
}
