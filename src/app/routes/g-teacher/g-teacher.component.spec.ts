import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GTeacherComponent } from './g-teacher.component';

describe('GTeacherComponent', () => {
  let component: GTeacherComponent;
  let fixture: ComponentFixture<GTeacherComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GTeacherComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GTeacherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
