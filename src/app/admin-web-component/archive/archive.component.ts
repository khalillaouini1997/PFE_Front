import { CommonModule, DatePipe, DecimalPipe, Location, NgClass } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Archive, Raws, Raw, BoitierAnalysis, createRaws } from "../../data/data";

import { BoitierService } from "../../service/boitier.service";
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { TabsModule } from 'primeng/tabs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-archive',
  standalone: true,
  templateUrl: './archive.component.html',
  styleUrls: ['./archive.component.css'],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TableModule, TabsModule, DatePipe, DecimalPipe, NgClass, TranslateModule, PageHeaderComponent]
})
export class ArchiveComponent implements OnInit {
  archives = signal<Archive[]>([]);
  rawData = signal<Raws>(createRaws());
  numBoitier = signal<number>(0);
  archiveForm!: FormGroup;

  analysisData = signal<BoitierAnalysis | null>(null);
  isAnalyzing = signal<boolean>(false);
  analysisDays = signal<number>(500);
  selectedLimit = 500;


  constructor(
    private readonly _location: Location,
    private readonly route: ActivatedRoute,
    private readonly boitierService: BoitierService,
    private readonly router: Router,
    private readonly fb: FormBuilder,
    private readonly toastr: ToastrService,
    private readonly translate: TranslateService
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
      // Handle nested response structure
      const rawData = _raws.data || _raws;
      const updatedRaws = createRaws();
      updatedRaws.raws = rawData.raws || [];
      updatedRaws.count = rawData.count || 0;
      this.rawData.set(updatedRaws);
    });
  }

  getArchives() {
    const limit = this.archiveForm.get('limit')?.value || 200;
    this.boitierService.getArchiveOfBoitier(this.numBoitier(), limit).subscribe(_archives => {
      // Handle different response structures
      let archivesData: any = _archives;
      if (_archives && typeof _archives === 'object' && !Array.isArray(_archives)) {
        archivesData = (_archives as any).data || (_archives as any).content || [];
      }
      if (!Array.isArray(archivesData)) {
        archivesData = [];
      }
      
      const archs = archivesData.map(a => {
        // Parse date from DD-MM-YYYY HH:mm:ss format to Date object
        let parsedDate = a.date;
        if (a.date && typeof a.date === 'string') {
          const parts = a.date.split(' ');
          if (parts.length === 2) {
            const dateParts = parts[0].split('-');
            const timeParts = parts[1].split(':');
            if (dateParts.length === 3 && timeParts.length === 3) {
              parsedDate = new Date(
                Number.parseInt(dateParts[2]), // year
                Number.parseInt(dateParts[1]) - 1, // month (0-indexed)
                Number.parseInt(dateParts[0]), // day
                Number.parseInt(timeParts[0]), // hours
                Number.parseInt(timeParts[1]), // minutes
                Number.parseInt(timeParts[2]) // seconds
              );
            }
          }
        }
        return {
          ...a,
          date: parsedDate,
          latitude: +a.latitude.toFixed(5),
          longitude: +a.longitude.toFixed(5)
        };
      });
      this.archives.set(archs);
    });
  }

  getAiAnalysis() {
    this.isAnalyzing.set(true);
    this.boitierService.getBoitierAnalysis(this.numBoitier(), 30, this.selectedLimit).subscribe({
      next: (data) => {
        this.analysisData.set(data);
        this.isAnalyzing.set(false);
      },
      error: (_err) => {
        this.isAnalyzing.set(false);
      }
    });
  }

  changeDays(limit: number) {
    this.selectedLimit = limit;
  }

  deleteRaw(raw: Raw) {
    if (!confirm(this.translate.instant('ARCHIVE.CONFIRM_DELETE_RAW'))) return;
    this.boitierService.deleteRaw(this.numBoitier(), raw.idTram).subscribe({
      next: () => {
        const current = this.rawData();
        this.rawData.set({
          raws: current.raws.filter(r => r.idTram !== raw.idTram),
          count: current.count - 1
        });
        this.toastr.success(this.translate.instant('ARCHIVE.RAW_DELETED'), this.translate.instant('COMMON.SUCCESS'));
      },
      error: () => {
        this.toastr.error(this.translate.instant('COMMON.ERROR_OCCURRED'), this.translate.instant('COMMON.ERROR'));
      }
    });
  }

  getAnomalyTypes(): { name: string; count: number }[] {
    const data = this.analysisData();
    if (!data?.topAnomalyTypes) return [];
    return Object.entries(data.topAnomalyTypes)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  getTopAnomaly(): { name: string; count: number } | null {
    const types = this.getAnomalyTypes();
    return types.length > 0 ? types[0] : null;
  }
}

