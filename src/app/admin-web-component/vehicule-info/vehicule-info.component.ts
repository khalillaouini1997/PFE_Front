import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe, NgFor, NgIf } from '@angular/common';
import { InterventionInfo } from "../../data/data";
import { ToastrService } from "ngx-toastr";
import { VehiculeService } from "../../service/vehicule.service";
import { finalize } from "rxjs";
import { FormsModule } from '@angular/forms';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { PaginationModule } from 'ngx-bootstrap/pagination';

@Component({
  selector: 'app-vehicule-info',
  templateUrl: './vehicule-info.component.html',
  styleUrls: ['./vehicule-info.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, TooltipModule, PaginationModule]
})
export class VehiculeInfoComponent implements OnInit {

  public maxSize: number = 5;
  public bigTotalItems: number = 0;
  public bigCurrentPage: number = 1;
  public numPages: number = 0;
  itemsPerPage = 30;
  selectedState: string = 'ALL';
  states = [{ name: 'ALL', label: 'tous' }, { name: 'untreated', label: 'non traité' }, { name: 'treated', label: 'traité' }];

  vehiculeInfos: InterventionInfo[] = [];
  vehiculeInfosFiltered: InterventionInfo[] = [];
  loading: boolean = false;

  private readonly vehiculeService = inject(VehiculeService);
  private readonly toastr = inject(ToastrService);

  ngOnInit() {
    this.getVehiculeInfo(this.bigCurrentPage - 1, this.itemsPerPage);
  }

  getVehiculeInfo(page: number, size: number) {
    this.loading = true;
    this.vehiculeInfos = [];
    this.vehiculeInfosFiltered = [];
    this.vehiculeService.getVehiculeInfo(page, size)
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: (resp) => {
          this.vehiculeInfos = resp.content;
          this.bigTotalItems = resp.totalElements;
          this.vehiculeInfosFiltered = resp.content;
        }
      });
  }

  public pageChanged(event: any): void {
    this.bigCurrentPage = event.page;
    this.getVehiculeInfo(this.bigCurrentPage - 1, this.itemsPerPage);
  }

  updateIntervention(vehiculeInfo: InterventionInfo) {
    this.vehiculeService.updateTechnicianIntervention(vehiculeInfo.deviceId, vehiculeInfo.createdAt)
      .subscribe(res => {
        if (res) {
          this.toastr.success('Modifié');
        } else {
          this.toastr.error('error');
        }
      });
  }

  onSelectState() {
    switch (this.selectedState) {
      case 'untreated':
        this.vehiculeInfosFiltered = this.vehiculeInfos.filter(v => !v.verified);
        break;
      case 'treated':
        this.vehiculeInfosFiltered = this.vehiculeInfos.filter(v => v.verified);
        break;
      case 'ALL':
        this.vehiculeInfosFiltered = this.vehiculeInfos;
    }
  }
}
