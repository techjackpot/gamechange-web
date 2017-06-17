import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderConvenorComponent } from './header-convenor.component';

describe('HeaderConvenorComponent', () => {
  let component: HeaderConvenorComponent;
  let fixture: ComponentFixture<HeaderConvenorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeaderConvenorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderConvenorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
