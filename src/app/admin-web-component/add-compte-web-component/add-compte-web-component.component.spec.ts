import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, Router } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { TranslateModule } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { AddCompteWebComponentComponent } from './add-compte-web-component.component';
import { WebAccountService } from '../../service/web-account.service';
import { CompteServerService } from '../../service/compte-server.service';
import { IpAddressService } from '../../service/ip-address.service';

describe('AddCompteWebComponentComponent', () => {
  let component: AddCompteWebComponentComponent;
  let fixture: ComponentFixture<AddCompteWebComponentComponent>;
  let webAccountService: { addCompteWeb: ReturnType<typeof vi.fn>; associateCompteWebToCompteServer: ReturnType<typeof vi.fn>; codesPays: any[] };
  let compteServerService: { getAllServerAccountForForm: ReturnType<typeof vi.fn> };
  let ipAddressService: { getAllIpAddresses: ReturnType<typeof vi.fn> };
  let toastr: { warning: ReturnType<typeof vi.fn>; success: ReturnType<typeof vi.fn> };
  let router: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    webAccountService = {
      addCompteWeb: vi.fn(),
      associateCompteWebToCompteServer: vi.fn().mockReturnValue(of({})),
      codesPays: [{ key: 'Tunisie', value: '216' }],
    };
    compteServerService = { getAllServerAccountForForm: vi.fn().mockReturnValue(of({ data: [] })) };
    ipAddressService = { getAllIpAddresses: vi.fn().mockReturnValue(of({ content: [] })) };
    toastr = { warning: vi.fn(), success: vi.fn() };
    router = { navigate: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [AddCompteWebComponentComponent, TranslateModule.forRoot()],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        importProvidersFrom(ToastrModule.forRoot()),
        { provide: WebAccountService, useValue: webAccountService },
        { provide: CompteServerService, useValue: compteServerService },
        { provide: IpAddressService, useValue: ipAddressService },
        { provide: ToastrService, useValue: toastr },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AddCompteWebComponentComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form', () => {
    expect(component.webForm).toBeTruthy();
    expect(component.webForm.get('login')).toBeTruthy();
    expect(component.webForm.get('password')).toBeTruthy();
  });

  it('should load server accounts on init', () => {
    component.ngOnInit();
    expect(compteServerService.getAllServerAccountForForm).toHaveBeenCalled();
  });

  it('should load codes pays on init', () => {
    component.ngOnInit();
    expect(component.codesPays()).toEqual(webAccountService.codesPays);
  });

  it('should load ip addresses on init', () => {
    component.ngOnInit();
    expect(ipAddressService.getAllIpAddresses).toHaveBeenCalled();
  });

  it('should handle server accounts error', () => {
    compteServerService.getAllServerAccountForForm.mockReturnValue(throwError(() => new Error('fail')));
    expect(() => component.ngOnInit()).not.toThrow();
  });

  it('should show warning on invalid form submit', () => {
    component.addCompteWeb();
    expect(toastr.warning).toHaveBeenCalled();
  });

  it('should submit valid form', () => {
    webAccountService.addCompteWeb.mockReturnValue(of({ idCompteClientWeb: 1 }));
    component.ngOnInit();
    component.webForm.patchValue({
      login: 'test',
      password: 'pass',
      code_pays: '216',
      idCompte: '1',
      ipAdresse: '1',
    });
    component.addCompteWeb();
    expect(webAccountService.addCompteWeb).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/adminWeb/listWebs']);
  });

  it('should set server account on form submit', () => {
    webAccountService.addCompteWeb.mockReturnValue(of({ idCompteClientWeb: 1 }));
    compteServerService.getAllServerAccountForForm.mockReturnValue(of({ data: [{ idCompteClientServer: 1, name: 'server1' }] }));
    component.ngOnInit();
    component.webForm.patchValue({
      login: 'test',
      password: 'pass',
      code_pays: '216',
      idCompte: '1',
      ipAdresse: '1',
    });
    component.addCompteWeb();
    expect(webAccountService.addCompteWeb).toHaveBeenCalled();
  });

  it('should set ip addresses from response', () => {
    ipAddressService.getAllIpAddresses.mockReturnValue(of({ content: [{ id: 1, ip: '192.168.1.1' }] }));
    component.ngOnInit();
    expect(component.ipAddresses()).toEqual([{ id: 1, ip: '192.168.1.1' }]);
  });
});
