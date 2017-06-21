import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GtClassesComponent } from './gt-classes.component';

describe('GtClassesComponent', () => {
  let component: GtClassesComponent;
  let fixture: ComponentFixture<GtClassesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GtClassesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GtClassesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
