import {Component, EventEmitter, inject, OnInit, Output, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router, RouterModule} from '@angular/router';
import {TranslateModule} from '@ngx-translate/core';
import {AdministratorCompte, createAdministratorCompte} from 'src/app/data/data';
import {AuthService} from 'src/app/service/auth.service';
import {WebAccountService} from 'src/app/service/web-account.service';
import {WebSocketService} from 'src/app/service/web-socket.service';


@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  isCollapsed = signal(false);
  isActiveDashBoard: boolean = true;
  isActiveGlobalDashBoard: boolean = false;
  isActiveServerForm: boolean = false;
  isActiveForm: boolean = false;
  isActiveListServer: boolean = false;
  isActiveListWeb: boolean = false;
  isActiveRequest: boolean = false;
  isActiveAccessLog: boolean = false;
  isActiveTraccar: boolean = false;
  isActiveAdminCompte: boolean = false;
  isActiveAddAdminCompte: boolean = false;
  isActiveBilling: boolean = false;
  owner: string = "TDS";
  notificationCount: number = 0;

  public currentUser: AdministratorCompte = createAdministratorCompte();

  @Output() sidebarToggle = new EventEmitter<boolean>();

  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly webAccountService = inject(WebAccountService);
  private readonly webSocketService = inject(WebSocketService);

  constructor() {
    this.currentUser = this.authService.getCurrentUser() || createAdministratorCompte();
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

  isWebAdminOrGlobal(): boolean {
    return this.authService.hasRole('WEBADMIN') || this.authService.hasRole('GLOBALADMINDESC');
  }

  isGlobalAdminDesc(): boolean {
    return this.authService.hasRole('GLOBALADMINDESC');
  }

  isAgent(): boolean {
    return this.authService.hasRole('AGENT');
  }

  canDelete(): boolean {
    return this.authService.hasRole('GLOBALADMINDESC');
  }

  toggleSidebar() {
    this.isCollapsed.update(v => !v);
    this.sidebarToggle.emit(this.isCollapsed());
  }

  setMenu(menu: string) {
    this.isActiveDashBoard = menu === 'dashboard';
    this.isActiveGlobalDashBoard = menu === 'globalDashboard';
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
}
