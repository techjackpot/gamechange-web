import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayscreenComponent } from './playscreen.component';

describe('PlayscreenComponent', () => {
  let component: PlayscreenComponent;
  let fixture: ComponentFixture<PlayscreenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlayscreenComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayscreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
