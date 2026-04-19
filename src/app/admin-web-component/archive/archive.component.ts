import { CommonModule, DatePipe, DecimalPipe, Location, NgClass } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Archive, raws } from "../../data/data";
import { BoitierService } from "../../service/boitier.service";
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { TabsModule } from 'primeng/tabs';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-archive',
  standalone: true,
  templateUrl: './archive.component.html',
  styleUrls: ['./archive.component.css'],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TableModule, TabsModule, DatePipe, DecimalPipe, NgClass, TranslateModule]
})
export class ArchiveComponent implements OnInit {
  archives = signal<Archive[]>([]);
  rawData = signal<raws>(new raws());
  numBoitier = signal<number>(0);
  archiveForm!: FormGroup;

  constructor(
    private readonly _location: Location,
    private readonly route: ActivatedRoute,
    private readonly boitierService: BoitierService,
    private readonly router: Router,
    private readonly fb: FormBuilder
  ) { }

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

  back() {
    this._location.back();
  }

  getAllRaws() {
    const limit = this.archiveForm.get('limit')?.value || 200;
    this.boitierService.getRaws(this.numBoitier(), limit).subscribe((_raws: any) => {
      const updatedRaws = new raws();
      updatedRaws.raws = _raws.raws;
      updatedRaws.count = _raws.count;
      this.rawData.set(updatedRaws);
    });
  }

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
