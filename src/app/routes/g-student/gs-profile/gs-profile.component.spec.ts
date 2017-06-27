import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GsProfileComponent } from './gs-profile.component';

describe('GsProfileComponent', () => {
  let component: GsProfileComponent;
  let fixture: ComponentFixture<GsProfileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GsProfileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GsProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
