import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { ToastrModule } from 'ngx-toastr';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { AddAdminCompteComponent } from './add-admin-compte.component';
import { AdminAccountService } from '../../service/admin-account.service';
import { ToastrService } from 'ngx-toastr';

describe('AddAdminCompteComponent', () => {
  let component: AddAdminCompteComponent;
  let fixture: ComponentFixture<AddAdminCompteComponent>;
  let adminAccountService: { addAdminCompte: ReturnType<typeof vi.fn> };
  let toastr: { success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn>; warning: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    adminAccountService = { addAdminCompte: vi.fn().mockReturnValue(of({})) };
    toastr = { success: vi.fn(), error: vi.fn(), warning: vi.fn() };

    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideRouter([]),
        importProvidersFrom(ToastrModule.forRoot()),
        { provide: AdminAccountService, useValue: adminAccountService },
        { provide: ToastrService, useValue: toastr },
      ],
      imports: [TranslateModule.forRoot(), AddAdminCompteComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddAdminCompteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize adminForm', () => {
    expect(component.adminForm).toBeTruthy();
    expect(component.adminForm.get('username')).toBeTruthy();
    expect(component.adminForm.get('password')).toBeTruthy();
    expect(component.adminForm.get('role')).toBeTruthy();
  });

  it('should have default role WEBADMIN', () => {
    expect(component.adminForm.get('role')?.value).toBe('WEBADMIN');
  });

  it('should have roles list', () => {
    expect(component.roles).toEqual(['GLOBALADMINDESC', 'WEBADMIN', 'AGENT']);
  });

  it('should warn if form is invalid', () => {
    component.adminForm.get('username')?.setValue('');
    component.adminForm.get('password')?.setValue('');
    component.addAdminCompte();
    expect(toastr.warning).toHaveBeenCalled();
  });

  it('should call addAdminCompte with valid form', () => {
    component.adminForm.patchValue({ username: 'admin', password: 'pass123', role: 'WEBADMIN' });
    component.addAdminCompte();
    expect(adminAccountService.addAdminCompte).toHaveBeenCalled();
  });

  it('should handle addAdminCompte error', () => {
    adminAccountService.addAdminCompte.mockReturnValue(throwError(() => new Error('fail')));
    component.adminForm.patchValue({ username: 'admin', password: 'pass123' });
    component.addAdminCompte();
  });

  it('should reset form after success', () => {
    component.adminForm.patchValue({ username: 'admin', password: 'pass123' });
    component.addAdminCompte();
    expect(component.adminForm.get('username')?.value).toBeNull();
  });
});
