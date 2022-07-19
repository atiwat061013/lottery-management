import { AfterViewInit, Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { getDatabase, ref, child, get, set, onValue, push, update, query, orderByChild, limitToLast, equalTo, orderByValue } from "firebase/database";
import { Subscription } from 'rxjs';
import * as md5 from 'md5';

@Component({
  selector: 'app-lottery-data',
  templateUrl: './lottery-data.component.html',
  styleUrls: ['./lottery-data.component.scss']
})
export class LotteryDataComponent implements AfterViewInit, OnInit {
  //Firebase
  db = getDatabase();

  @ViewChild('number') numberField: any;
  @ViewChildren('number') inputs: QueryList<ElementRef> | any;
  @ViewChild('number') emailInputElement!: ElementRef<HTMLInputElement>;


  @ViewChildren('number') rows: QueryList<any> | any;
  private sub1: Subscription = new Subscription();

  @ViewChildren('upper') upperField: QueryList<any> | any;
  @ViewChildren('lower') lowerField: QueryList<any> | any;
  @ViewChildren('todd') toddField: QueryList<any> | any;


  validation_messages = {
    installment_date: [{ type: 'required', message: 'Name is required.' }],
    customer: [{ type: 'required', message: 'Name is required.' }],
    installment: [{ type: 'required', message: 'Name is required.' }],
  };

  formLotteryArray: FormGroup | any;
  formModalInstallment: FormGroup | any;

  lotteryArray: FormArray | any;
  customerList: any = [];
  customerSelectIndex: any;

  installmentList: any = [];
  installmentSelectIndex: any;

  billsArray: any = [];
  billsPrice: number = 0;

  //data table
  isLoadingtableBills: boolean = true;
  billsByNameList: any = [];

  constructor(private formBuilder: FormBuilder) { }

  async ngOnInit(): Promise<any> {
    this.formLotteryArray = this.formBuilder.group({
      lotteryArray: this.formBuilder.array([this.createItem()]),
      customer: new FormControl('', [Validators.required]),
      checkCustomer: new FormControl(false),
      installment: new FormControl('', [Validators.required]),
    });

    this.formModalInstallment = this.formBuilder.group({
      installment_date: new FormControl('', [Validators.required]),
    });

    await this.fetchCustomerList();
    console.log("[ngOnInit]", await this.customerList);

    await this.fetchInstallmentList();

    await this.qurryBills();


  }

  ngAfterViewInit() {
    this.sub1 = this.rows?.changes.subscribe((resp: any) => {
      if (this.rows?.length > 1) {
        this.rows?.last.nativeElement.focus();
      }
    });
  }

  ngOnDestroy() {
    this.sub1.unsubscribe();
  }

  get f() {
    return this.formLotteryArray.controls;
  }


  async fetchCustomerList() {
    const starCountRef = ref(this.db, 'customer/');
    onValue(starCountRef, async (snapshot: any) => {
      const data = await snapshot.val();
      console.log("data", data);

      let tmpName: any = [];
      tmpName.push({
        label: 'เลือก',
        value: '',
        id: ''
      });

      Object.keys(data).forEach(async (key: any, index: number) => {
        tmpName.push({
          label: await data[key].name,
          value: await data[key].name,
          id: await data[key].id
        });
      });

      this.customerList = await tmpName;
      console.log("[fetchCustomerList]", this.customerList);


      let checkCustomerIndex = await this.customerList.findIndex((ele: any) => ele.value == localStorage.getItem("checkCustomer"));
      console.log("[fetchCustomerList]", "checkCustomer => " + checkCustomerIndex);
      this.formLotteryArray.controls['customer'].setValue(this.customerList[checkCustomerIndex].value);
      this.formLotteryArray.controls['checkCustomer'].setValue(this.customerList[checkCustomerIndex].value);

      this.customerSelectIndex = await checkCustomerIndex;

    });
  }

  fetchInstallmentList() {
    const starCountRef = query(ref(this.db, 'installment'), orderByChild('create_at'));
    onValue(starCountRef, async (snapshot) => {
      const data = await snapshot.val();
      console.log("data", data);

      let tmpInstallment: any = [];
      tmpInstallment.push({
        label: 'เลือกงวดที่ต้องการ',
        value: '',
        id: '',
        installment_date: ''
      });
      if (data != undefined) {
        Object.keys(data).forEach((key: any, index: number) => {
          tmpInstallment.push({
            label: "งวดประจำวันที่ " + data[key].installment_date,
            value: "งวดประจำวันที่ " + data[key].installment_date,
            id: data[key].id,
            installment_date: data[key].installment_date
          });
        });
      }

      this.installmentList = tmpInstallment;

      console.log("[fetchInstallmentList] data", this.installmentList);
      console.log("[fetchInstallmentList]", this.installmentList);



      //set last installment
      this.formLotteryArray.controls['installment'].setValue(this.installmentList[this.installmentList.length - 1].value)
      this.installmentSelectIndex = this.installmentList.length - 1


    });
  }

  createItem() {
    return this.formBuilder.group({
      number: new FormControl({ value: '', disabled: false }),
      upper: new FormControl(''),
      lower: new FormControl(''),
      todd: new FormControl({ value: '', disabled: true }),
    });
  }

  async addItem() {
    this.lotteryArray = this.f['lotteryArray'] as FormArray;
    // await this.lotteryArray.push(this.createItem());
    this.lotteryArray.push(this.createItem());
    // this.inputs.toArray()[this.inputs.toArray().length -1].nativeElement.focus();

    // // working
    // this.emailInputElement.nativeElement.focus();
    this.rows.last.nativeElement.focus();
    this.onSumPriceBills();

  }

  onKeyupNumberEnter() {
    this.upperField.last.nativeElement.focus();
  }

  onKeyupUpperEnter() {
    this.lowerField.last.nativeElement.focus();
  }

  onKeyupLowerEnter(index: number) {
    console.log("[onKeyupLowerEnter] index", index);


    console.log("[onKeyupLowerEnter] formLotteryArray", this.formLotteryArray.get("lotteryArray").at(index).get("number").value.length);
    if (this.formLotteryArray.get("lotteryArray").at(index).get("number").value.length == 3) {
      this.toddField.last.nativeElement.focus();
    } else {
      this.addItem();
    }
  }

  onChangeNumber(event: any, index: number) {
    console.log('[onChangeNumber] event: ', event.target.value);
    let personnalId = event.target.value;

    if (event.target.value.length == 1 || event.target.value.length == 2 || event.target.value.length == 0) {
      this.formLotteryArray.get("lotteryArray").at(index).get("todd").disable();
    } else {
      this.formLotteryArray.get("lotteryArray").at(index).get("todd").enable();
    }

  }

  onChangeUpper(event: any, index: number) {
    console.log('[onChangeUpper] event: ', event);
    let numberUpper = event.target.value;
    if (this.formLotteryArray.get("lotteryArray").at(index).get("number").value.length == 3) {
      if (event.key == "+") {
        console.log('[onChangeUpper] 3length numberUpper: ', numberUpper);
        console.log(this.formLotteryArray.get("lotteryArray").at(index).get("number").value[0]);
        let numLength1 = this.formLotteryArray.get("lotteryArray").at(index).get("number").value[0];
        let numLength2 = this.formLotteryArray.get("lotteryArray").at(index).get("number").value[1];
        let numLength3 = this.formLotteryArray.get("lotteryArray").at(index).get("number").value[2];
        if (numLength1 == numLength2 && numLength1 == numLength3 && numLength2 == numLength3) {
          console.log('[onChangeUpper] lotteryArray: same 3');

        } else if (numLength1 == numLength2 || numLength1 == numLength3 || numLength2 == numLength3) {
          console.log('[onChangeUpper] lotteryArray: same 2');
          if (event.key == "+") {
            this.formLotteryArray.get("lotteryArray").at(index).get("upper").setValue(numberUpper.substring(0, numberUpper.length - 1));
            let sixSwap: any = [];
            let threeSwapNumber1 = numLength1.concat(numLength2).concat(numLength3);
            let threeSwapNumber2 = numLength2.concat(numLength1).concat(numLength3);
            let threeSwapNumber3 = numLength3.concat(numLength2).concat(numLength1);
            let threeSwapNumber4 = numLength1.concat(numLength3).concat(numLength2);
            let threeSwapNumber5 = numLength2.concat(numLength3).concat(numLength1);
            let threeSwapNumber6 = numLength3.concat(numLength1).concat(numLength2);
            sixSwap.push(
              threeSwapNumber2, threeSwapNumber3, threeSwapNumber4, threeSwapNumber5, threeSwapNumber6
            )

            let uniqueChars = sixSwap.filter((c: any, index: any) => {
              return sixSwap.indexOf(c) === index;
            });

            console.log('[onChangeUpper] lotteryArray: not same uniqueChars ->', uniqueChars);

            this.lotteryArray = this.f['lotteryArray'] as FormArray;
            let upperPrice = this.formLotteryArray.get("lotteryArray").at(index).get("upper").value;
            for (let i = 0; i < uniqueChars.length; i++) {
              if (this.formLotteryArray.get("lotteryArray").at(index).get("number").value != uniqueChars[i]) {
                this.lotteryArray.push(this.formBuilder.group({
                  number: new FormControl({ value: uniqueChars[i], disabled: false }),
                  upper: new FormControl(upperPrice),
                  lower: new FormControl(''),
                  todd: new FormControl({ value: '', disabled: true })
                }));
              }
            }
          }

          this.addItem();

        } else {
          console.log('[onChangeUpper] lotteryArray: not same');
          if (event.key == "+") {
            this.formLotteryArray.get("lotteryArray").at(index).get("upper").setValue(numberUpper.substring(0, numberUpper.length - 1));
            let sixSwap: any = [];
            let sixSwapNumber1 = numLength1.concat(numLength2).concat(numLength3);
            let sixSwapNumber2 = numLength2.concat(numLength1).concat(numLength3);
            let sixSwapNumber3 = numLength3.concat(numLength2).concat(numLength1);
            let sixSwapNumber4 = numLength1.concat(numLength3).concat(numLength2);
            let sixSwapNumber5 = numLength2.concat(numLength3).concat(numLength1);
            let sixSwapNumber6 = numLength3.concat(numLength1).concat(numLength2);
            sixSwap.push(
              sixSwapNumber2, sixSwapNumber3, sixSwapNumber4, sixSwapNumber5, sixSwapNumber6
            )

            console.log('[onChangeUpper] lotteryArray: not same sixSwap ->', sixSwap);


            this.lotteryArray = this.f['lotteryArray'] as FormArray;
            let upperPrice = this.formLotteryArray.get("lotteryArray").at(index).get("upper").value;
            for (let i = 0; i < sixSwap.length; i++) {
              this.lotteryArray.push(this.formBuilder.group({
                number: new FormControl({ value: sixSwap[i], disabled: false }),
                upper: new FormControl(upperPrice),
                lower: new FormControl(''),
                todd: new FormControl({ value: '', disabled: true })
              }));
            }
          }

          this.addItem();

        }

      }
    } else {
      if (event.key == "+") {
        let numLength1 = this.formLotteryArray.get("lotteryArray").at(index).get("number").value[0];
        let numLength2 = this.formLotteryArray.get("lotteryArray").at(index).get("number").value[1];
        if (numLength1 == numLength2) {
          this.formLotteryArray.get("lotteryArray").at(index).get("upper").setValue(numberUpper.substring(0, numberUpper.length - 1));
          this.addItem();
        } else {
          console.log(numberUpper.substring(numberUpper.length - 1));
          this.formLotteryArray.get("lotteryArray").at(index).get("upper").setValue(numberUpper.substring(0, numberUpper.length - 1));

          console.log(this.formLotteryArray.value.lotteryArray);
          console.log(this.formLotteryArray.get("lotteryArray").at(index).get("number").value);

          let number = this.formLotteryArray.get("lotteryArray").at(index).get("number").value;
          let first = number[0];
          let last = number[number.length - 1];
          console.log("number position first: ", first + " last: " + last);
          let swapNumber = last.concat(first);

          let upperPrice = this.formLotteryArray.get("lotteryArray").at(index).get("upper").value;

          this.lotteryArray = this.f['lotteryArray'] as FormArray;
          this.lotteryArray.push(this.formBuilder.group({
            number: new FormControl({ value: swapNumber, disabled: false }),
            upper: new FormControl(upperPrice),
            lower: new FormControl(''),
            todd: new FormControl({ value: '', disabled: true })
          }));

          this.addItem();
        }

      }
    }

  }

  onChangeLower(event: any, index: number) {
    console.log('[onChangeLower] event: ', event.target.value);
    let numberLower = event.target.value;
    if (this.formLotteryArray.get("lotteryArray").at(index).get("number").value.length == 3) {
      if (event.key == "+") {
        console.log('[onChangeUpper] 3length numberLower: ', numberLower);
        console.log(this.formLotteryArray.get("lotteryArray").at(index).get("number").value[0]);
        let numLength1 = this.formLotteryArray.get("lotteryArray").at(index).get("number").value[0];
        let numLength2 = this.formLotteryArray.get("lotteryArray").at(index).get("number").value[1];
        let numLength3 = this.formLotteryArray.get("lotteryArray").at(index).get("number").value[2];
        if (numLength1 == numLength2 && numLength1 == numLength3 && numLength2 == numLength3) {
          console.log('[onChangeUpper] lotteryArray: same 3');

        } else if (numLength1 == numLength2 || numLength1 == numLength3 || numLength2 == numLength3) {
          console.log('[onChangeUpper] lotteryArray: same 2');
          if (event.key == "+") {
            this.formLotteryArray.get("lotteryArray").at(index).get("lower").setValue(numberLower.substring(0, numberLower.length - 1));
            let sixSwap: any = [];
            let threeSwapNumber1 = numLength1.concat(numLength2).concat(numLength3);
            let threeSwapNumber2 = numLength2.concat(numLength1).concat(numLength3);
            let threeSwapNumber3 = numLength3.concat(numLength2).concat(numLength1);
            let threeSwapNumber4 = numLength1.concat(numLength3).concat(numLength2);
            let threeSwapNumber5 = numLength2.concat(numLength3).concat(numLength1);
            let threeSwapNumber6 = numLength3.concat(numLength1).concat(numLength2);
            sixSwap.push(
              threeSwapNumber2, threeSwapNumber3, threeSwapNumber4, threeSwapNumber5, threeSwapNumber6
            )

            let uniqueChars = sixSwap.filter((c: any, index: any) => {
              return sixSwap.indexOf(c) === index;
            });

            console.log('[onChangeUpper] lotteryArray: not same uniqueChars ->', uniqueChars);

            this.lotteryArray = this.f['lotteryArray'] as FormArray;
            let lowerPrice = this.formLotteryArray.get("lotteryArray").at(index).get("lower").value;
            let upperPrice = this.formLotteryArray.get("lotteryArray").at(index).get("upper").value;
            for (let i = 0; i < uniqueChars.length; i++) {
              if (this.formLotteryArray.get("lotteryArray").at(index).get("number").value != uniqueChars[i]) {
                this.lotteryArray.push(this.formBuilder.group({
                  number: new FormControl({ value: uniqueChars[i], disabled: false }),
                  upper: new FormControl(upperPrice),
                  lower: new FormControl(lowerPrice),
                  todd: new FormControl({ value: '', disabled: true })
                }));
              }
            }
            this.addItem();
          }

        } else {
          console.log('[onChangeUpper] lotteryArray: not same');
          if (event.key == "+") {
            this.formLotteryArray.get("lotteryArray").at(index).get("lower").setValue(numberLower.substring(0, numberLower.length - 1));
            let sixSwap: any = [];
            let sixSwapNumber1 = numLength1.concat(numLength2).concat(numLength3);
            let sixSwapNumber2 = numLength2.concat(numLength1).concat(numLength3);
            let sixSwapNumber3 = numLength3.concat(numLength2).concat(numLength1);
            let sixSwapNumber4 = numLength1.concat(numLength3).concat(numLength2);
            let sixSwapNumber5 = numLength2.concat(numLength3).concat(numLength1);
            let sixSwapNumber6 = numLength3.concat(numLength1).concat(numLength2);
            sixSwap.push(
              sixSwapNumber2, sixSwapNumber3, sixSwapNumber4, sixSwapNumber5, sixSwapNumber6
            )

            console.log('[onChangeUpper] lotteryArray: not same sixSwap ->', sixSwap);

            let lowerPrice = this.formLotteryArray.get("lotteryArray").at(index).get("lower").value;
            let upperPrice = this.formLotteryArray.get("lotteryArray").at(index).get("upper").value;
            this.lotteryArray = this.f['lotteryArray'] as FormArray;
            for (let i = 0; i < sixSwap.length; i++) {
              this.lotteryArray.push(this.formBuilder.group({
                number: new FormControl({ value: sixSwap[i], disabled: false }),
                upper: new FormControl(upperPrice),
                lower: new FormControl(lowerPrice),
                todd: new FormControl({ value: '', disabled: true })
              }));
            }
            this.addItem();
          }

        }
      }
    } else {
      if (event.key == "+") {
        let numLength1 = this.formLotteryArray.get("lotteryArray").at(index).get("number").value[0];
        let numLength2 = this.formLotteryArray.get("lotteryArray").at(index).get("number").value[1];
        if (numLength1 == numLength2) {
          this.formLotteryArray.get("lotteryArray").at(index).get("lower").setValue(numberLower.substring(0, numberLower.length - 1));
          this.addItem();
        } else {
          console.log(numberLower.substring(numberLower.length - 1));
          this.formLotteryArray.get("lotteryArray").at(index).get("lower").setValue(numberLower.substring(0, numberLower.length - 1));

          console.log(this.formLotteryArray.value.lotteryArray);
          console.log(this.formLotteryArray.get("lotteryArray").at(index).get("number").value);

          let number = this.formLotteryArray.get("lotteryArray").at(index).get("number").value;
          let first = number[0];
          let last = number[number.length - 1];
          console.log("number position first: ", first + " last: " + last);
          let swapNumber = last.concat(first);

          let lowerPrice = this.formLotteryArray.get("lotteryArray").at(index).get("lower").value;
          let upperPrice = this.formLotteryArray.get("lotteryArray").at(index).get("upper").value;

          this.lotteryArray = this.f['lotteryArray'] as FormArray;
          this.lotteryArray.push(this.formBuilder.group({
            number: new FormControl({ value: swapNumber, disabled: false }),
            upper: new FormControl(upperPrice),
            lower: new FormControl(lowerPrice),
            todd: new FormControl({ value: '', disabled: true })
          }));

          this.addItem();
        }
      }
    }

  }

  removeItem(idx: number): void {
    (this.f['lotteryArray'] as FormArray).removeAt(idx);
    this.onSumPriceBills();
  }

  onSubmit() {
    this.formLotteryArray.markAllAsTouched();
    console.log(this.formLotteryArray.value.lotteryArray);
    let tmpBills = [];
    for (let i = 0; i < this.formLotteryArray.value.lotteryArray.length - 1; i++) {
      tmpBills.push({
        number: this.undefinedToNumber(this.formLotteryArray.value.lotteryArray[i].number),
        upper: this.undefinedToNumber(this.formLotteryArray.value.lotteryArray[i].upper),
        lower: this.undefinedToNumber(this.formLotteryArray.value.lotteryArray[i].lower),
        todd: this.undefinedToNumber(this.formLotteryArray.value.lotteryArray[i].todd)
      });

      console.log(this.undefinedToNumber(this.formLotteryArray.value.lotteryArray[i].todd));
    }

    this.billsArray = tmpBills;
    console.log("[onSubmit] billsArray", this.billsArray);

    console.log("[onSubmit] ", "installment_date => " + this.installmentList[this.installmentSelectIndex].installment_date);
    console.log("[onSubmit] ", "installmentList => " + this.installmentList);
    console.log("[onSubmit] ", "installmentSelectIndex => " + this.installmentSelectIndex);



    const newPostKey = push(child(ref(this.db), 'bills')).key;
    set(ref(this.db, 'bills/' + newPostKey), {
      id: newPostKey,
      customer_name: this.customerList[this.customerSelectIndex].value,
      customer_id: this.customerList[this.customerSelectIndex].id,
      installment_date: this.installmentList[this.installmentSelectIndex].installment_date,
      installment_id: this.installmentList[this.installmentSelectIndex].id,
      create_at: Date.now(),
      item_buy: this.billsArray,
    }).then((res: any) => {
      // Data saved successfully!
      console.log('Data saved successfully! res=> ', res);

      // update(ref(this.db, 'installment/'+ "c450b42843e0291b8cfee0dc3d79700d"), {
      //   bills: {newPostKey,}
      // }).then((res: any) => {
      //     // Data saved successfully!
      //     console.log('Data saved successfully! res=> ', res);




      //   }).catch((error) => {
      //     // The write failed...
      //     console.log('error', error);
      //   });

    }).catch((error) => {
      // The write failed...
      console.log('error', error);
    });


  }

  undefinedToNumber(number: any) {
    let result = ""
    if (number == undefined || number == "") {
      result = "0"
    } else {
      result = number
    }
    return result
  }

  async qurryBills() {
    console.log("[qurryBills] ", this.customerList);
    console.log("[qurryBills] ", this.customerSelectIndex);
    console.log("[qurryBills] ", this.customerList[this.customerSelectIndex].value);

    const mostViewedPosts = query(ref(this.db, 'bills'), orderByChild("customer_name"), equalTo(this.customerList[this.customerSelectIndex].value));
    onValue(mostViewedPosts, async (res) => {
      console.log("mostViewedPosts", res.val());
      let tmpBillsByName: any;
      if (res.val() != null) {
        tmpBillsByName = Object.values(res?.val());
      }

      console.log("data", tmpBillsByName);

      this.billsByNameList = tmpBillsByName;
      console.log("billsByNameList: ", this.billsByNameList);

    });
  }

  onCustomerChange(event: any) {
    console.log('[onCustomerChange] event: ', event.target.selectedIndex);
    this.customerSelectIndex = event.target.selectedIndex;
    console.log("customerSelectIndex ", this.customerSelectIndex);

    if (this.formLotteryArray.controls['checkCustomer'].value) {
      localStorage.setItem("checkCustomer", this.customerList[this.customerSelectIndex]?.value);
    } else {
      localStorage.setItem("checkCustomer", "")
    }




  }

  onCheckCustomerChange(event: any) {
    console.log('[onCheckCustomerChange] event: ', event.target.checked);
    if (event.target.checked) {
      console.log("isChecked true: ", this.customerList);
      console.log("isChecked true: customerSelectIndex => ", this.customerSelectIndex);
      console.log("isChecked true: ", this.customerList[this.customerSelectIndex]?.value);

      localStorage.setItem("checkCustomer", this.customerList[this.customerSelectIndex]?.value);
    } else {
      localStorage.setItem("checkCustomer", "")
    }
  }

  onInstallmentChange(event: any) {
    console.log('[onInstallmentChange] event: ', event.target.selectedIndex);
    this.installmentSelectIndex = event.target.selectedIndex - 1;
    console.log("installmentSelectIndex", this.installmentSelectIndex);

  }

  onSumPriceBills(){
    let tmpBills = [];
    this.billsPrice = 0;
    for (let i = 0; i < this.formLotteryArray.value.lotteryArray.length - 1; i++) {
      tmpBills.push({
        number: this.undefinedToNumber(this.formLotteryArray.value.lotteryArray[i].number),
        upper: this.undefinedToNumber(this.formLotteryArray.value.lotteryArray[i].upper),
        lower: this.undefinedToNumber(this.formLotteryArray.value.lotteryArray[i].lower),
        todd: this.undefinedToNumber(this.formLotteryArray.value.lotteryArray[i].todd)
      });

      console.log("billsPrice: ", this.billsPrice);
      this.billsPrice = this.billsPrice + parseInt(this.undefinedToNumber(this.formLotteryArray.value.lotteryArray[i].upper)) + parseInt(this.undefinedToNumber(this.formLotteryArray.value.lotteryArray[i].lower)) + parseInt(this.undefinedToNumber(this.formLotteryArray.value.lotteryArray[i].todd));
      console.log("billsPrice: ", this.billsPrice);

      console.log("tmpBills: ", tmpBills);
    }
  }

  // Modal Installment
  onSubmitModalInstallment() {
    console.log("onSubmitModalInstallment formModalInstallment", this.formModalInstallment.value);
    const uuid = md5(this.formModalInstallment.value.installment_date);
    set(ref(this.db, 'installment/' + uuid), {
      id: uuid,
      installment_date: this.formModalInstallment.value.installment_date,
      create_at: Date.now()
    }).then(() => {
      // Data saved successfully!
      console.log('Data saved successfully!',);
      this.fetchInstallmentList();
    }).catch((error) => {
      // The write failed...
      console.log('error', error);
    });
  }

}