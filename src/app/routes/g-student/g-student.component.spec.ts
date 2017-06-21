import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GStudentComponent } from './g-student.component';

describe('GStudentComponent', () => {
  let component: GStudentComponent;
  let fixture: ComponentFixture<GStudentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GStudentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GStudentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
