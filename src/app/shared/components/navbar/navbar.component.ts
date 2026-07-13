import {Component, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {Theme, ThemeService} from '../../services/theme.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  private readonly themeService = inject(ThemeService);
  currentTheme = signal<Theme>(this.themeService.getTheme());
  private readonly translate = inject(TranslateService);

  toggleTheme(): void {
    this.themeService.toggle();
    this.currentTheme.set(this.themeService.getTheme());
  }

  changeLanguage(lang: string): void {
    this.translate.use(lang);
    localStorage.setItem('language', lang);
  }

  isLang(lang: string): boolean {
    return this.translate.currentLang === lang || (lang === 'fr' && !this.translate.currentLang);
  }
}
