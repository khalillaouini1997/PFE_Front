import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComptesServerComponentComponent } from './comptes-server-component.component';
import { CompteServerService } from '../../service/compte-server.service';
import { IpAddressService } from '../../service/ip-address.service';
import { AuthService } from '../../service/auth.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateModule } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

describe('ComptesServerComponentComponent', () => {
  let component: ComptesServerComponentComponent;
  let fixture: ComponentFixture<ComptesServerComponentComponent>;
  let compteServerService: { getAllServerAccount: ReturnType<typeof vi.fn>; deleteCompteServer: ReturnType<typeof vi.fn>; updateServerCompte: ReturnType<typeof vi.fn>; ExportListComptesServer: ReturnType<typeof vi.fn> };
  let ipAddressService: { getAllIpAddresses: ReturnType<typeof vi.fn> };
  let authService: { hasRole: ReturnType<typeof vi.fn> };
  let toastr: { success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn>; warning: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    compteServerService = {
      getAllServerAccount: vi.fn().mockReturnValue(of({
        data: { content: [{ idCompteClientServer: 1, pseudo: 'test', login: 'user', date_Expiration: Date.now() + 86400000 }], totalElements: 1 }
      })),
      deleteCompteServer: vi.fn(),
      updateServerCompte: vi.fn(),
      ExportListComptesServer: vi.fn(),
    };
    ipAddressService = { getAllIpAddresses: vi.fn().mockReturnValue(of({ data: { content: [] } })) };
    authService = { hasRole: vi.fn().mockReturnValue(true) };
    toastr = { success: vi.fn(), error: vi.fn(), warning: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ComptesServerComponentComponent, TranslateModule.forRoot()],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: CompteServerService, useValue: compteServerService },
        { provide: IpAddressService, useValue: ipAddressService },
        { provide: AuthService, useValue: authService },
        { provide: ToastrService, useValue: toastr },
        { provide: ActivatedRoute, useValue: { params: of({}) } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ComptesServerComponentComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    fixture.destroy();
    vi.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load comptes server on init', () => {
    component.ngOnInit();
    expect(compteServerService.getAllServerAccount).toHaveBeenCalled();
    expect(component.comptesServer.length).toBe(1);
  });

  it('should check canDelete', () => {
    expect(component.canDelete()).toBe(true);
  });

  it('should search accounts', () => {
    component.ngOnInit();
    component.searchAccount('test');
    expect(component.pagination.bigCurrentPage).toBe(1);
    expect(compteServerService.getAllServerAccount).toHaveBeenCalled();
  });

  it('should delete compte server', () => {
    component.ngOnInit();
    component.updateServerForm.patchValue({ idCompteClientServer: 1 });
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    compteServerService.deleteCompteServer.mockReturnValue(of({}));
    component.deleteCompteServer();
    expect(compteServerService.deleteCompteServer).toHaveBeenCalledWith(1);
  });

  it('should not delete if not confirmed', () => {
    component.ngOnInit();
    component.updateServerForm.patchValue({ idCompteClientServer: 1 });
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    component.deleteCompteServer();
    expect(compteServerService.deleteCompteServer).not.toHaveBeenCalled();
  });

  it('should update compte server', () => {
    component.updateModal = { nativeElement: { showModal: vi.fn(), close: vi.fn() } } as any;
    vi.spyOn(component, 'closeUpdateModal').mockImplementation(() => {});
    component.ngOnInit();
    component.updateServerForm.patchValue({ idCompteClientServer: 1, pseudo: 'updated', login: 'user', password: 'pass', idIpAdresse: 1 });
    compteServerService.updateServerCompte.mockReturnValue(of({
      idCompteClientServer: 1, pseudo: 'updated', date_Expiration: Date.now() + 86400000
    }));
    component.updateCompteServer();
    expect(compteServerService.updateServerCompte).toHaveBeenCalled();
  });

  it('should handle update error', () => {
    component.ngOnInit();
    component.updateServerForm.patchValue({ idCompteClientServer: 1 });
    compteServerService.updateServerCompte.mockReturnValue(throwError(() => ({
      error: { message: 'Failed' }
    })));
    component.updateCompteServer();
    expect(component.mode).toBe(true);
  });

  it('should select compte server', () => {
    component.updateModal = { nativeElement: { showModal: vi.fn(), close: vi.fn() } } as any;
    const compte = { idCompteClientServer: 1, pseudo: 'test', date_Expiration: Date.now() };
    component.onSelect(compte as any);
    expect(component.updateServerForm.get('pseudo')?.value).toBe('test');
  });

  it('should export', () => {
    component.ngOnInit();
    component.comptesServer = [{ idCompteClientServer: 1 } as any];
    compteServerService.ExportListComptesServer.mockReturnValue(of(new Blob()));
    component.onExport();
    expect(compteServerService.ExportListComptesServer).toHaveBeenCalled();
  });

  it('should not export empty list', () => {
    component.ngOnInit();
    component.comptesServer = [];
    component.onExport();
    expect(compteServerService.ExportListComptesServer).not.toHaveBeenCalled();
  });

  it('should handle load error', () => {
    component.ngOnInit();
    compteServerService.getAllServerAccount.mockReturnValue(throwError(() => new Error('fail')));
    component.loadComptesServer();
    expect(component.loading).toBe(false);
  });

  it('should handle accounts as direct array', () => {
    component.ngOnInit();
    compteServerService.getAllServerAccount.mockReturnValue(of([
      { idCompteClientServer: 1, pseudo: 'test', date_Expiration: Date.now() }
    ]));
    component.loadComptesServer();
    expect(component.comptesServer.length).toBe(1);
  });
});
