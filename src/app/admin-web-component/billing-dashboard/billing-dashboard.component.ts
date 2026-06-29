import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-billing-dashboard',
  standalone: true,
  templateUrl: './billing-dashboard.component.html',
  styleUrls: ['./billing-dashboard.component.css'],
  imports: [CommonModule, TranslateModule]
})
export class BillingDashboardComponent {
  private readonly sanitizer = inject(DomSanitizer);

  private readonly METABASE_URL = 'http://localhost:3000/embed/dashboard/YOUR_TOKEN_HERE';

  metabaseUrl: SafeResourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.METABASE_URL);
}
