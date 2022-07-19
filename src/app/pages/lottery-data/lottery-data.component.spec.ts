import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LotteryDataComponent } from './lottery-data.component';

describe('LotteryDataComponent', () => {
  let component: LotteryDataComponent;
  let fixture: ComponentFixture<LotteryDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LotteryDataComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LotteryDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
