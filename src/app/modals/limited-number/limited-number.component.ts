import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { getDatabase, onValue, orderByChild, query, ref, update } from 'firebase/database';

@Component({
  selector: 'app-limited-number',
  templateUrl: './limited-number.component.html',
  styleUrls: ['./limited-number.component.scss']
})
export class LimitedNumberComponent implements OnInit {
  @Input() public installmentList: any;
  
  db = getDatabase();
  formlimitedPayHalf: FormGroup | any;
  formlimitedNotAccept: FormGroup | any;

  limitedPayHalfList: any = [];
  limitedNotAcceptList: any = [];

  constructor(
    public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder) {
    this.formlimitedPayHalf = this.formBuilder.group({
      number_pay_half: new FormControl('', [Validators.required]),
      check_pay_half_reverse_all: new FormControl(false),
    });

    this.formlimitedNotAccept = this.formBuilder.group({
      number_not_accept: new FormControl('', [Validators.required]),
      check_not_accept_reverse_all: new FormControl(false),
    });
  }

  ngOnInit(): void {
    console.log("[LimitedNumberComponent][ngOnInit]");
    console.log("installmentList", this.installmentList);
    this.limitedPayHalfList = this.installmentList?.limited_pay_half;
    this.limitedNotAcceptList = this.installmentList?.limited_not_accept;
    
  }

  onSavelimitedPayHalf() {
    console.log("[onlimitedPayHalf]", this.formlimitedPayHalf.controls['number_pay_half'].value);

    let numberlimitedPayHalf: any[] =this.installmentList?.limited_pay_half == undefined ? [] : this.installmentList?.limited_pay_half;
    numberlimitedPayHalf.push({
      create_at: Date.now(),
      number: this.formlimitedPayHalf.controls['number_pay_half'].value,
      type: "จ่ายครึ่ง",
    });
    console.log("[onSavelimitedPayHalf] number_pay_half", this.formlimitedPayHalf.value.number_pay_half);
    if(this.formlimitedPayHalf.value.number_pay_half.length == 3 && this.formlimitedPayHalf.value.check_pay_half_reverse_all){
      let numLength1 = this.formlimitedPayHalf.value.number_pay_half[0];
      let numLength2 = this.formlimitedPayHalf.value.number_pay_half[1];
      let numLength3 = this.formlimitedPayHalf.value.number_pay_half[2];
      let sixSwap: any = [];
      let threeSwapNumber1 = numLength1.concat(numLength2).concat(numLength3);
      let threeSwapNumber2 = numLength2.concat(numLength1).concat(numLength3);
      let threeSwapNumber3 = numLength3.concat(numLength2).concat(numLength1);
      let threeSwapNumber4 = numLength1.concat(numLength3).concat(numLength2);
      let threeSwapNumber5 = numLength2.concat(numLength3).concat(numLength1);
      let threeSwapNumber6 = numLength3.concat(numLength1).concat(numLength2);

      sixSwap.push(
        threeSwapNumber1, threeSwapNumber2, threeSwapNumber3, threeSwapNumber4, threeSwapNumber5, threeSwapNumber6
      )

      console.log("[onSavelimitedPayHalf] sixSwap => ", sixSwap);
      for(let i = 0; i < sixSwap.length; i++){
        numberlimitedPayHalf.push({
          create_at: Date.now(),
          number: sixSwap[i],
          type: "จ่ายครึ่ง",
        });
      }
      

    }else if(this.formlimitedPayHalf.value.number_pay_half.length == 2 && this.formlimitedPayHalf.value.check_pay_half_reverse_all){
      let numLength1 = this.formlimitedPayHalf.value.number_pay_half[0];
      let numLength2 = this.formlimitedPayHalf.value.number_pay_half[1];
      let twoSwap: any = [];
      let twoSwapNumber1 = numLength1.concat(numLength2);
      let twoSwapNumber2 = numLength2.concat(numLength1);
      twoSwap.push(twoSwapNumber1, twoSwapNumber2)

      console.log("[onSavelimitedPayHalf] twoSwap => ", twoSwap);
      for(let i = 0; i < twoSwap.length; i++){
        numberlimitedPayHalf.push({
          create_at: Date.now(),
          number: twoSwap[i],
          type: "จ่ายครึ่ง",
        });
      }
    }

    const set = new Set();
    let uniqueNumber = numberlimitedPayHalf.filter((item: any, index: any) => {
      console.log("[onSavelimitedPayHalf] uniqueNumber c=> ", item.number + "index=> " + index);
      const alreadyHas = set.has(item.number)
      set.add(item.number)

      return !alreadyHas
    });
    console.log("[onSavelimitedPayHalf] uniqueNumber", uniqueNumber);

    this.updatelimitedPayHalf(uniqueNumber);

  }

  onRemovelimitedPayHalf(index: number) {
    console.log("[onRemovelimitedPayHalf] index => ", index);

    const installmentAll = this.installmentList.limited_pay_half;
    const indexOfObject = installmentAll.findIndex((object: any) => {
      return object.id === index;
    });

    installmentAll.splice(indexOfObject, 1);

    console.log("[onRemovelimitedPayHalf] installmentSelect => ", installmentAll);

    this.updatelimitedPayHalf(installmentAll);
  }

  updatelimitedPayHalf(numberlimitedPayHalfList: any[]) {
    update(ref(this.db, 'installment/' + this.installmentList.id), {
      limited_pay_half: numberlimitedPayHalfList,
      edit_at: Date.now()
    }).then(() => {
      // Data saved successfully!
      console.log('Data saved successfully!');
      // this.createContectModalClose?.nativeElement?.click();
      this.fetchInstallmentList();
      this.formlimitedPayHalf.reset();

    }).catch((error) => {
      // The write failed...
      console.log('error', error);
    });
  }


  onSavelimitedNotAccept() {
    console.log("[onSavelimitedNotAccept]", this.formlimitedNotAccept.controls['number_not_accept'].value);

    let numberlimitedNotAccept: any[] =this.installmentList?.limited_not_accept == undefined ? [] : this.installmentList?.limited_not_accept;
    numberlimitedNotAccept.push({
      create_at: Date.now(),
      number: this.formlimitedNotAccept.controls['number_not_accept'].value,
      type: "จ่ายครึ่ง",
    });
    console.log("[onSavelimitedNotAccept] number_not_accept", this.formlimitedNotAccept.value.number_not_accept);
    if(this.formlimitedNotAccept.value.number_not_accept.length == 3 && this.formlimitedNotAccept.value.check_not_accept_reverse_all){
      let numLength1 = this.formlimitedNotAccept.value.number_not_accept[0];
      let numLength2 = this.formlimitedNotAccept.value.number_not_accept[1];
      let numLength3 = this.formlimitedNotAccept.value.number_not_accept[2];
      let sixSwap: any = [];
      let threeSwapNumber1 = numLength1.concat(numLength2).concat(numLength3);
      let threeSwapNumber2 = numLength2.concat(numLength1).concat(numLength3);
      let threeSwapNumber3 = numLength3.concat(numLength2).concat(numLength1);
      let threeSwapNumber4 = numLength1.concat(numLength3).concat(numLength2);
      let threeSwapNumber5 = numLength2.concat(numLength3).concat(numLength1);
      let threeSwapNumber6 = numLength3.concat(numLength1).concat(numLength2);

      sixSwap.push(
        threeSwapNumber1, threeSwapNumber2, threeSwapNumber3, threeSwapNumber4, threeSwapNumber5, threeSwapNumber6
      )

      console.log("[onSavelimitedNotAccept] sixSwap => ", sixSwap);
      for(let i = 0; i < sixSwap.length; i++){
        numberlimitedNotAccept.push({
          create_at: Date.now(),
          number: sixSwap[i],
          type: "จ่ายครึ่ง",
        });
      }
      

    }else if(this.formlimitedNotAccept.value.number_not_accept.length == 2 && this.formlimitedNotAccept.value.check_not_accept_reverse_all){
      let numLength1 = this.formlimitedNotAccept.value.number_not_accept[0];
      let numLength2 = this.formlimitedNotAccept.value.number_not_accept[1];
      let twoSwap: any = [];
      let twoSwapNumber1 = numLength1.concat(numLength2);
      let twoSwapNumber2 = numLength2.concat(numLength1);
      twoSwap.push(twoSwapNumber1, twoSwapNumber2)

      console.log("[onSavelimitedNotAccept] twoSwap => ", twoSwap);
      for(let i = 0; i < twoSwap.length; i++){
        numberlimitedNotAccept.push({
          create_at: Date.now(),
          number: twoSwap[i],
          type: "จ่ายครึ่ง",
        });
      }
    }

    const set = new Set();
    let uniqueNumber = numberlimitedNotAccept.filter((item: any, index: any) => {
      console.log("[onSavelimitedNotAccept] uniqueNumber c=> ", item.number + "index=> " + index);
      const alreadyHas = set.has(item.number)
      set.add(item.number)

      return !alreadyHas
    });
    console.log("[onSavelimitedNotAccept] uniqueNumber", uniqueNumber);

    this.updatelimitedNotAccept(uniqueNumber);
  }

  updatelimitedNotAccept(numberlimitedNotAcceptList: any[]) {
    update(ref(this.db, 'installment/' + this.installmentList.id), {
      limited_not_accept: numberlimitedNotAcceptList,
      edit_at: Date.now()
    }).then(() => {
      // Data saved successfully!
      console.log('Data saved successfully!');
      // this.createContectModalClose?.nativeElement?.click();
      this.fetchInstallmentList();
      this.formlimitedNotAccept.reset();

    }).catch((error) => {
      // The write failed...
      console.log('error', error);
    });
  }

  fetchInstallmentList() {
    const starCountRef = query(ref(this.db, 'installment/'+this.installmentList.id));
    onValue(starCountRef, async (snapshot) => {
      const data = await snapshot.val();
      this.installmentList = data;
      this.limitedPayHalfList = this.installmentList.limited_pay_half;
      this.limitedNotAcceptList = this.installmentList.limited_not_accept;

      console.log("[fetchInstallmentList]", this.installmentList);

    });
  }

}
