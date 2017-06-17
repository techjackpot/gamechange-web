import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderTeacherComponent } from './header-teacher.component';

describe('HeaderTeacherComponent', () => {
  let component: HeaderTeacherComponent;
  let fixture: ComponentFixture<HeaderTeacherComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeaderTeacherComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderTeacherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
