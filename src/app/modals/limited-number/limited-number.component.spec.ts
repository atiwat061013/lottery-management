import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LimitedNumberComponent } from './limited-number.component';

describe('LimitedNumberComponent', () => {
  let component: LimitedNumberComponent;
  let fixture: ComponentFixture<LimitedNumberComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LimitedNumberComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LimitedNumberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
