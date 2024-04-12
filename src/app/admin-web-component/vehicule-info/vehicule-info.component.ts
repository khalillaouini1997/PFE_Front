import {Component, OnInit, ViewContainerRef} from '@angular/core';
import {InterventionInfo} from "../../data/data";
import {ToastrService} from "ngx-toastr";
import {DataService} from "../../service/data.service";
import {finalize} from "rxjs";

@Component({
  selector: 'app-vehicule-info',
  templateUrl: './vehicule-info.component.html',
  styleUrls: ['./vehicule-info.component.css']
})
export class VehiculeInfoComponent implements OnInit {

  public maxSize: number = 5;
  public bigTotalItems: number = 175;
  public bigCurrentPage: number = 1;
  public numPages: number = 0;
  itemsPerPage = 30;
  selectedState: string = 'ALL';
  states = [{ name: 'ALL', label: 'tous' }, { name: 'untreated', label: 'non traité' }, { name: 'treated', label: 'traité' }];

  vehiculeInfos: InterventionInfo[] = [];
  vehiculeInfosFiltered: InterventionInfo[] = [];
  loading: boolean = false;

  constructor(private dataService: DataService, public toastr: ToastrService, vcr: ViewContainerRef) {
    //this.toastr.setRootViewContainerRef(vcr);
  }

  ngOnInit() {
    this.getVehiculeInfo(this.bigCurrentPage - 1, this.itemsPerPage);
  }

  getVehiculeInfo(page: number, size: number) {
    this.loading = true;
    this.vehiculeInfos = [];
    this.vehiculeInfosFiltered = [];
    this.dataService.getVehiculeInfo(page, size)
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe(resp => {
        this.vehiculeInfos = resp.content;
        this.bigTotalItems = resp.totalElements;
        this.vehiculeInfosFiltered = resp.content;
      });
  }
  public pageChanged(event: any): void {
    this.bigCurrentPage = event.page;

    this.getVehiculeInfo(this.bigCurrentPage - 1, this.itemsPerPage);
  }

  updateIntervention(vehiculeInfo: InterventionInfo) {
    this.dataService.updateTechnicianIntervention(vehiculeInfo.deviceId, vehiculeInfo.createdAt)
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
