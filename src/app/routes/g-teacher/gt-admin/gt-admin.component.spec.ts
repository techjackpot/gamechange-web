import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GtAdminComponent } from './gt-admin.component';

describe('GtAdminComponent', () => {
  let component: GtAdminComponent;
  let fixture: ComponentFixture<GtAdminComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GtAdminComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GtAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
