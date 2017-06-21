import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GtConvenorComponent } from './gt-convenor.component';

describe('GtConvenorComponent', () => {
  let component: GtConvenorComponent;
  let fixture: ComponentFixture<GtConvenorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GtConvenorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GtConvenorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
