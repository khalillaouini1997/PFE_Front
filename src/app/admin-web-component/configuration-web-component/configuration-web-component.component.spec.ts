import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigurationWebComponentComponent } from './configuration-web-component.component';

describe('ConfigurationWebComponentComponent', () => {
  let component: ConfigurationWebComponentComponent;
  let fixture: ComponentFixture<ConfigurationWebComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [ConfigurationWebComponentComponent]
})
    .compileComponents();

    fixture = TestBed.createComponent(ConfigurationWebComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
