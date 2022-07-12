import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxFullGridComponent } from './ngx-full-grid.component';

describe('NgxFullGridComponent', () => {
  let component: NgxFullGridComponent<{}>;
  let fixture: ComponentFixture<NgxFullGridComponent<{}>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NgxFullGridComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NgxFullGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
