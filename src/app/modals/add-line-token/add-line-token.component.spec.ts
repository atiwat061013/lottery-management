import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddLineTokenComponent } from './add-line-token.component';

describe('AddLineTokenComponent', () => {
  let component: AddLineTokenComponent;
  let fixture: ComponentFixture<AddLineTokenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddLineTokenComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddLineTokenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
