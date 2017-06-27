import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GsSocialComponent } from './gs-social.component';

describe('GsSocialComponent', () => {
  let component: GsSocialComponent;
  let fixture: ComponentFixture<GsSocialComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GsSocialComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GsSocialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
