import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CompteServerDetailsComponent } from './compte-server-details.component';

describe('CompteServerDetailsComponent', () => {
  let component: CompteServerDetailsComponent;
  let fixture: ComponentFixture<CompteServerDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompteServerDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompteServerDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
