import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GsClassComponent } from './gs-class.component';

describe('GsClassComponent', () => {
  let component: GsClassComponent;
  let fixture: ComponentFixture<GsClassComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GsClassComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GsClassComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
