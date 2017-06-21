import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GtApprovalComponent } from './gt-approval.component';

describe('GtApprovalComponent', () => {
  let component: GtApprovalComponent;
  let fixture: ComponentFixture<GtApprovalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GtApprovalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GtApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
