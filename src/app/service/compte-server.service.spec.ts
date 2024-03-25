import { TestBed } from '@angular/core/testing';

import { CompteServerService } from './compte-server.service';

describe('CompteServerService', () => {
  let service: CompteServerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CompteServerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
