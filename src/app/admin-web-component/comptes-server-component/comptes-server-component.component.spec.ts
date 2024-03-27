import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ComptesServerComponentComponent } from './comptes-server-component.component';

describe('ComptesServerComponentComponent', () => {
  let component: ComptesServerComponentComponent;
  let fixture: ComponentFixture<ComptesServerComponentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ComptesServerComponentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComptesServerComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
