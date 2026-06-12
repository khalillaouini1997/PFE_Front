import { Component, OnInit, inject, signal, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AdministratorCompte } from 'src/app/data/data';
import { AuthService } from 'src/app/service/auth.service';
import { WebAccountService } from 'src/app/service/web-account.service';
import { WebSocketService } from 'src/app/service/web-socket.service';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';


@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, ThemeToggleComponent],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
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
  isActiveBilling: boolean = false;
  owner: string = "TDS";
  notificationCount: number = 0;

  public currentUser: AdministratorCompte = new AdministratorCompte();

  @Output() sidebarToggle = new EventEmitter<boolean>();

  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly webAccountService = inject(WebAccountService);
  private readonly webSocketService = inject(WebSocketService);
  private readonly translate = inject(TranslateService);

  constructor() {
    this.currentUser = this.authService.getCurrentUser() || new AdministratorCompte();
  }

  ngOnInit() {
    this.webSocketService.getNotifications().subscribe(notification => {
      if (notification) {
        this.notificationCount++;
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/authentification']);
  }

  isAdminGolbal(): boolean {
    return this.authService.hasRole('GLOBALADMINDESC');
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
    return this.authService.hasRole('GLOBALADMINDESC') || this.authService.hasRole('WEBADMIN');
  }

  isAgentAdmin(): boolean {
    return this.authService.hasRole('AGENT') || this.authService.hasRole('GLOBALADMINDESC');
  }

  isGlobalAdminDesc(): boolean {
    return this.authService.hasRole('GLOBALADMINDESC');
  }

  toggleSidebar() {
    this.isCollapsed.update(v => !v);
    this.sidebarToggle.emit(this.isCollapsed());
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
    this.isActiveBilling = menu === 'billing';
  }

  changeLanguage(lang: string) {
    this.translate.use(lang);
    localStorage.setItem('language', lang);
  }

  isLang(lang: string): boolean {
    return this.translate.currentLang === lang || (lang === 'fr' && !this.translate.currentLang);
  }
}