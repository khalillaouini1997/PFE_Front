import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { ToastrModule } from 'ngx-toastr';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { AddAdresseIpComponent } from './add-adresse-ip.component';
import { IpAddressService } from '../../service/ip-address.service';
import { ToastrService } from 'ngx-toastr';

describe('AddAdresseIpComponent', () => {
  let component: AddAdresseIpComponent;
  let fixture: ComponentFixture<AddAdresseIpComponent>;
  let ipAddressService: { saveIpAddress: ReturnType<typeof vi.fn>; typeConnection: any[] };
  let toastr: { success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn>; warning: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    ipAddressService = {
      saveIpAddress: vi.fn().mockReturnValue(of({})),
      typeConnection: [{ type: 'SSH' }, { type: 'JDBC' }],
    };
    toastr = { success: vi.fn(), error: vi.fn(), warning: vi.fn() };

    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideRouter([]),
        importProvidersFrom(ToastrModule.forRoot()),
        { provide: IpAddressService, useValue: ipAddressService },
        { provide: ToastrService, useValue: toastr },
      ],
      imports: [TranslateModule.forRoot(), AddAdresseIpComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AddAdresseIpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize ipForm', () => {
    expect(component.ipForm).toBeTruthy();
    expect(component.ipForm.get('label')).toBeTruthy();
    expect(component.ipForm.get('value')).toBeTruthy();
    expect(component.ipForm.get('typeConnection')).toBeTruthy();
  });

  it('should set typeConnection on ngOnInit', () => {
    component.ngOnInit();
    expect(component.typeConnection).toEqual([{ type: 'SSH' }, { type: 'JDBC' }]);
  });

  it('should have default typeConnection SSH', () => {
    expect(component.ipForm.get('typeConnection')?.value).toBe('SSH');
  });

  it('should warn if form is invalid', () => {
    component.ipForm.get('label')?.setValue('');
    component.ipForm.get('value')?.setValue('');
    component.saveIpAddres();
    expect(toastr.warning).toHaveBeenCalled();
  });

  it('should call saveIpAddress with valid form', () => {
    component.ipForm.patchValue({ label: 'Test IP', value: '192.168.1.1' });
    component.saveIpAddres();
    expect(ipAddressService.saveIpAddress).toHaveBeenCalled();
  });

  it('should reset form after save', () => {
    component.ipForm.patchValue({ label: 'Test IP', value: '192.168.1.1' });
    component.saveIpAddres();
    expect(component.ipForm.get('typeConnection')?.value).toBe('SSH');
  });

  it('should handle save error', () => {
    ipAddressService.saveIpAddress.mockReturnValue(throwError(() => new Error('fail')));
    component.ipForm.patchValue({ label: 'Test IP', value: '192.168.1.1' });
    component.saveIpAddres();
  });

  it('should validate IP address format', () => {
    component.ipForm.get('value')?.setValue('999.999.999.999');
    expect(component.ipForm.get('value')?.valid).toBe(false);
  });

  it('should accept valid IP address', () => {
    component.ipForm.get('value')?.setValue('192.168.1.1');
    expect(component.ipForm.get('value')?.valid).toBe(true);
  });
});
