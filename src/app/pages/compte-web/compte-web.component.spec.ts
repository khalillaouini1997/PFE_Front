import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompteWebComponent } from './compte-web.component';

describe('CompteWebComponent', () => {
  let component: CompteWebComponent;
  let fixture: ComponentFixture<CompteWebComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CompteWebComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompteWebComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
