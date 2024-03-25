import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComptewebconfigComponent } from './comptewebconfig.component';

describe('ComptewebconfigComponent', () => {
  let component: ComptewebconfigComponent;
  let fixture: ComponentFixture<ComptewebconfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ComptewebconfigComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComptewebconfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
