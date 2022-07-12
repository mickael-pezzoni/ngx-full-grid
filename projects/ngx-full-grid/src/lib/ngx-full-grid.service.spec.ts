import { TestBed } from '@angular/core/testing';

import { NgxFullGridService } from './ngx-full-grid.service';

describe('NgxFullGridService', () => {
  let service: NgxFullGridService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgxFullGridService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
