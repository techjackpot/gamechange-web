import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GsCardgameComponent } from './gs-cardgame.component';

describe('GsCardgameComponent', () => {
  let component: GsCardgameComponent;
  let fixture: ComponentFixture<GsCardgameComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GsCardgameComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GsCardgameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
