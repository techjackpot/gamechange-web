import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatecardComponent } from './createcard.component';

describe('CreatecardComponent', () => {
  let component: CreatecardComponent;
  let fixture: ComponentFixture<CreatecardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreatecardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreatecardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
