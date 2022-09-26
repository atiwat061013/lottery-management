import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddRewardLotteryComponent } from './add-reward-lottery.component';

describe('AddRewardLotteryComponent', () => {
  let component: AddRewardLotteryComponent;
  let fixture: ComponentFixture<AddRewardLotteryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddRewardLotteryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddRewardLotteryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
