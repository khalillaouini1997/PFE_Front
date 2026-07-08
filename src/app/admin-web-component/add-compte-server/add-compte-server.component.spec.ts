import { TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { AddCompteServerComponent } from './add-compte-server.component';
import { CompteServerService } from '../../service/compte-server.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { TranslateService, TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';

describe('AddCompteServerComponent', () => {
  let component: AddCompteServerComponent;
  let compteServerService: { createServerComptewithBoitier: ReturnType<typeof vi.fn>; isExistPseudo: ReturnType<typeof vi.fn>; isExistLogin: ReturnType<typeof vi.fn> };
  let toastr: { success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn>; warning: ReturnType<typeof vi.fn> };
  let router: { navigate: ReturnType<typeof vi.fn> };
  let translate: { instant: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    compteServerService = {
      createServerComptewithBoitier: vi.fn(),
      isExistPseudo: vi.fn().mockReturnValue(of({ data: false })),
      isExistLogin: vi.fn().mockReturnValue(of({ data: false })),
    };
    toastr = { success: vi.fn(), error: vi.fn(), warning: vi.fn() };
    router = { navigate: vi.fn() };
    translate = { instant: vi.fn().mockReturnValue('') };

    await TestBed.configureTestingModule({
      imports: [AddCompteServerComponent, TranslateModule.forRoot({ loader: { provide: TranslateLoader, useValue: { getTranslation: () => of({}) } } })],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: CompteServerService, useValue: compteServerService },
        { provide: ToastrService, useValue: toastr },
        { provide: Router, useValue: router },
        { provide: TranslateService, useValue: translate }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(AddCompteServerComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form', () => {
    expect(component.serverForm).toBeTruthy();
    expect(component.serverForm.get('pseudo')).toBeTruthy();
    expect(component.serverForm.get('login')).toBeTruthy();
  });

  it('should validate password match', () => {
    component.serverForm.patchValue({
      password: 'test123',
      confirmationPassword: 'test123'
    });
    expect(component.serverForm.hasError('mismatch')).toBe(false);
  });

  it('should detect password mismatch', () => {
    component.serverForm.patchValue({
      password: 'test123',
      confirmationPassword: 'different'
    });
    expect(component.serverForm.errors?.['mismatch']).toBe(true);
  });

  it('should get numberBoitier', () => {
    component.serverForm.patchValue({ numberBoitier: 5 });
    expect(component.numberBoitier).toBe(5);
  });

  it('should get numberBoitier default', () => {
    expect(component.numberBoitier).toBe(0);
  });

  it('should add compte server', () => {
    component.serverForm.patchValue({
      pseudo: 'test', login: 'user', password: 'pass123',
      confirmationPassword: 'pass123', numberBoitier: 2,
      date_Expiration: new Date()
    });
    compteServerService.createServerComptewithBoitier.mockReturnValue(of({}));
    component.addCompteServer();
    expect(compteServerService.createServerComptewithBoitier).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/adminWeb/listWebs']);
  });

  it('should not add when form invalid', () => {
    component.addCompteServer();
    expect(toastr.warning).toHaveBeenCalled();
  });

  it('should handle add error', () => {
    component.serverForm.patchValue({
      pseudo: 'test', login: 'user', password: 'pass123',
      confirmationPassword: 'pass123', numberBoitier: 2,
      date_Expiration: new Date()
    });
    compteServerService.createServerComptewithBoitier.mockReturnValue(throwError(() => ({
      error: { message: 'Duplicate' }
    })));
    component.addCompteServer();
    expect(component.mode).toBe(true);
    expect(component.messageError).toBe('Duplicate');
  });

  it('should check pseudo existence', () => {
    component.serverForm.patchValue({ pseudo: 'test' });
    component.onKeyPseudo();
    expect(compteServerService.isExistPseudo).toHaveBeenCalledWith('test');
  });

  it('should check login existence', () => {
    component.serverForm.patchValue({ login: 'user' });
    component.onKeyLogin();
    expect(compteServerService.isExistLogin).toHaveBeenCalledWith('user');
  });

  it('should handle empty pseudo', () => {
    component.serverForm.patchValue({ pseudo: '' });
    component.onKeyPseudo();
    expect(compteServerService.isExistPseudo).not.toHaveBeenCalled();
  });

  it('should reinitialise', () => {
    component.reinitialisation();
    expect(component.serverForm.get('numberBoitier')?.value).toBe(0);
  });
});
