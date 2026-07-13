import {TestBed} from '@angular/core/testing';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {IpAdresseComponent} from './ip-adresse.component';
import {IpAddressService} from '../../service/ip-address.service';
import {ToastrService} from 'ngx-toastr';
import {TranslateModule} from '@ngx-translate/core';
import {of, throwError} from 'rxjs';
import {ReactiveFormsModule} from '@angular/forms';

describe('IpAdresseComponent', () => {
  let component: IpAdresseComponent;
  let ipAddressService: {
    getAllIpAddresses: ReturnType<typeof vi.fn>;
    deleteIpAddress: ReturnType<typeof vi.fn>;
    updateIpAddress: ReturnType<typeof vi.fn>;
    typeConnection: any[]
  };
  let toastr: { success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn>; warning: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    ipAddressService = {
      getAllIpAddresses: vi.fn().mockReturnValue(of({
        data: {content: [{idIpAdresse: 1, label: 'Test IP', value: '192.168.1.1'}], totalElements: 1}
      })),
      deleteIpAddress: vi.fn(),
      updateIpAddress: vi.fn(),
      typeConnection: [{type: 'MySQL'}],
    };
    toastr = {success: vi.fn(), error: vi.fn(), warning: vi.fn()};

    await TestBed.configureTestingModule({
      imports: [IpAdresseComponent, TranslateModule.forRoot(), ReactiveFormsModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        {provide: IpAddressService, useValue: ipAddressService},
        {provide: ToastrService, useValue: toastr}
      ]
    }).compileComponents();

    component = TestBed.createComponent(IpAdresseComponent).componentInstance;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load IP addresses on init', () => {
    component.ngOnInit();
    expect(ipAddressService.getAllIpAddresses).toHaveBeenCalled();
    expect(component.ips.length).toBe(1);
  });

  it('should search IP addresses', () => {
    component.ngOnInit();
    component.searchIpAddress('test');
    expect(component.pagination.bigCurrentPage).toBe(1);
    expect(ipAddressService.getAllIpAddresses).toHaveBeenCalled();
  });

  it('should delete IP address', () => {
    component.ngOnInit();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    ipAddressService.deleteIpAddress.mockReturnValue(of({}));
    component.deleteIpAddress(1);
    expect(ipAddressService.deleteIpAddress).toHaveBeenCalledWith(1);
  });

  it('should not delete if not confirmed', () => {
    component.ngOnInit();
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    component.deleteIpAddress(1);
    expect(ipAddressService.deleteIpAddress).not.toHaveBeenCalled();
  });

  it('should select IP address', () => {
    component.ngOnInit();
    const ip = {idIpAdresse: 1, label: 'Test', value: '192.168.1.1'};
    component.onSelect(ip as any);
    expect(component.ipAddressSelected.label).toBe('Test');
    expect(component.updateIpForm.get('label')?.value).toBe('Test');
  });

  it('should update IP address', () => {
    component.ngOnInit();
    component.updateIpForm.patchValue({idIpAdresse: 1, label: 'Updated', value: '10.0.0.1'});
    ipAddressService.updateIpAddress.mockReturnValue(of({}));
    component.updateIpAdress();
    expect(ipAddressService.updateIpAddress).toHaveBeenCalled();
  });

  it('should not update when id is null', () => {
    component.ngOnInit();
    component.updateIpForm.patchValue({idIpAdresse: null});
    component.updateIpAdress();
    expect(ipAddressService.updateIpAddress).not.toHaveBeenCalled();
  });

  it('should handle load error', () => {
    component.ngOnInit();
    ipAddressService.getAllIpAddresses.mockReturnValue(throwError(() => new Error('fail')));
    component.getAllIpAddresse('', 0, 15);
    expect(component.ips).toEqual([]);
  });

  it('should handle delete error', () => {
    component.ngOnInit();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    ipAddressService.deleteIpAddress.mockReturnValue(throwError(() => new Error('fail')));
    component.deleteIpAddress(1);
    expect(component).toBeTruthy();
  });
});
