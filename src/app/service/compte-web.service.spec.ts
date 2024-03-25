import { TestBed } from '@angular/core/testing';

import { CompteWebService } from './compte-web.service';

describe('CompteWebService', () => {
  let service: CompteWebService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CompteWebService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
