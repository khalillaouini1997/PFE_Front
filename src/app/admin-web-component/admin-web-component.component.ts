import {ChangeDetectionStrategy, Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {SidebarComponent} from '../shared/components/sidebar/sidebar.component';
import {NavbarComponent} from '../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-admin-web-component',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent, NavbarComponent],
  templateUrl: './admin-web-component.component.html',
  styleUrls: ['./admin-web-component.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminWebComponentComponent {
  isSidebarCollapsed = false;

  onSidebarToggle(collapsed: boolean) {
    this.isSidebarCollapsed = collapsed;
  }
}
