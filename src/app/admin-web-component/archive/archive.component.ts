import { CommonModule, Location } from '@angular/common';
import { Component, OnInit, viewChild, signal } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { TabsetComponent, TabsModule } from "ngx-bootstrap/tabs";
import { Archive, raws } from "../../data/data";
import { BoitierService } from "../../service/boitier.service";
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';


@Component({
    selector: 'app-archive',
    standalone: true,
    templateUrl: './archive.component.html',
    styleUrls: ['./archive.component.css'],
    imports: [CommonModule, FormsModule, ReactiveFormsModule, TabsModule]
})
export class ArchiveComponent implements OnInit {
  staticTabs = viewChild<TabsetComponent>('staticTabs');
  archives = signal<Archive[]>([]);
  rawData = signal<raws>(new raws());
  numBoitier = signal<number>(0);
  archiveForm!: FormGroup;

  constructor(private _location: Location, private route: ActivatedRoute, private boitierService: BoitierService, private router: Router, private fb: FormBuilder) { }

  ngOnInit(): void {
    this.initForms();
    this.route.params.subscribe((params: Params) => {
      this.numBoitier.set(+params['numBoitier']);
    });
    this.getArchives();
  }

  initForms() {
    this.archiveForm = this.fb.group({
      limit: [200]
    });
  }

  //=====================================
  //     Go back to the previous page
  //=====================================

  back() {
    this._location.back();
  }

  //=====================================
  //     Get all device's raw
  //=====================================

  getAllRaws() {
    const limit = this.archiveForm.get('limit')?.value || 200;
    this.boitierService.getRaws(this.numBoitier(), limit).subscribe((_raws: any) => {
      const updatedRaws = new raws();
      updatedRaws.raws = _raws.raws;
      updatedRaws.count = _raws.count;
      this.rawData.set(updatedRaws);
    });
  }

  //=====================================
  // Get archive of device form database
  //
  //=====================================
  getArchives() {
    const limit = this.archiveForm.get('limit')?.value || 200;
    this.boitierService.getArchiveOfBoitier(this.numBoitier(), limit).subscribe(_archives => {
      const archs = (_archives as any[]).map(a => ({
        ...a,
        latitude: +a.latitude.toFixed(5),
        longitude: +a.longitude.toFixed(5)
      }));
      this.archives.set(archs);
    });
  }
}
