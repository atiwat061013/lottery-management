import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAwardsLotteryComponent } from './add-awards-lottery.component';

describe('AddAwardsLotteryComponent', () => {
  let component: AddAwardsLotteryComponent;
  let fixture: ComponentFixture<AddAwardsLotteryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddAwardsLotteryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddAwardsLotteryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
