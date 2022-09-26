import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { equalTo, getDatabase, onValue, orderByChild, query, ref, update } from 'firebase/database';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-add-reward-lottery',
  templateUrl: './add-reward-lottery.component.html',
  styleUrls: ['./add-reward-lottery.component.scss']
})
export class AddRewardLotteryComponent implements OnInit {
  //Firebase
  db = getDatabase();

  formReward: FormGroup | any;

  @Input() public installment: any;
  
  constructor(public activeModal: NgbActiveModal, private formBuilder: FormBuilder) {
    this.formReward = this.formBuilder.group({
      first: new FormControl('', [Validators.required]),
      last3f1: new FormControl('', [Validators.required]),
      last3f2: new FormControl('', [Validators.required]),
      last3b1: new FormControl('', [Validators.required]),
      last3b2: new FormControl('', [Validators.required]),
      last2: new FormControl('', [Validators.required]),
    });
  }

  ngOnInit(): void {
    console.log("[ngOnInit] installment --> ", this.installment.id);
    
  }

  onSubmitReward() {
    console.log("[onSubmitReward]", this.formReward.value);
    update(ref(this.db, 'installment/' + this.installment.id), {
      award: this.formReward.value,
      edit_at: Date.now()
    }).then(() => {
      // Data saved successfully!
      console.log('Data saved successfully!');
    }).catch((error) => {
      // The write failed...
      console.log('error', error);
    });
  }

}
