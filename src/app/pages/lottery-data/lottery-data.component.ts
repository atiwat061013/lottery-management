import { AfterViewInit, Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { getDatabase, ref, child, get, set, onValue, push, update, query, orderByChild, limitToLast, equalTo, orderByValue, remove } from "firebase/database";
import { Subscription } from 'rxjs';
import * as md5 from 'md5';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddInstallmentComponent } from 'src/app/modals/add-installment/add-installment.component';
import { LimitedNumberComponent } from 'src/app/modals/limited-number/limited-number.component';
import { ConfirmDialogComponent } from 'src/app/modals/confirm-dialog/confirm-dialog.component';

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
    customer: [{ type: 'required', message: 'กรุณาเลือกลูกค้า' }],
    installment: [{ type: 'required', message: 'กรุณาเลือกงวด' }],
  };

  formLotteryArray: FormGroup | any;

  lotteryArray: FormArray | any;
  customerList: any = [];
  customerSelectIndex: any;

  installmentList: any = [];
  installmentSelectIndex: any;
  installmentSelect: any = [];

  billsArray: any = [];
  billsPrice: number = 0;
  billsRunNumberPrice: number = 0;
  discountForCustomer: number = 0;
  discountHtml: string = "";

  //data table
  isLoadingtableBills: boolean = true;
  billsByNameList: any = [];

  showViewbills: boolean = false;
  billsByNameInView: any = [];


  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    public modalService: NgbModal) { }

  async ngOnInit(): Promise<any> {

    this.formLotteryArray = this.formBuilder.group({
      lotteryArray: this.formBuilder.array([this.createItem()]),
      customer: new FormControl('', [Validators.required]),
      checkCustomer: new FormControl(false),
      checkInstallment: new FormControl(false),
      installment: new FormControl('', [Validators.required]),
      price: new FormControl('', [Validators.required]),
      discount: new FormControl('', [Validators.required]),
      total_price: new FormControl('', [Validators.required]),
    });

    this.fetchCustomerList();
    this.fetchInstallmentList();


  }

  ngAfterViewChecked() {
    setTimeout(() => { window.dispatchEvent(new Event('resize')); }, 250)
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


  fetchCustomerList() {
    const starCountRef = ref(this.db, 'customer/');
    onValue(starCountRef, async (snapshot: any) => {
      const data = await snapshot.val();
      console.log("data", data);

      let tmpName: any = [];
      tmpName.push({
        label: 'เลือก',
        name: '',
        id: '',
        discount: 0,
        phone: ''
      });

      Object.keys(data).forEach(async (key: any, index: number) => {
        tmpName.push({
          label: data[key].name,
          name: data[key].name,
          id: data[key].id,
          discount: data[key].discount,
          phone: data[key].phone,
        });
      });

      this.customerList = await tmpName;
      console.log("[fetchCustomerList]", this.customerList);


      let checkCustomerIndex = await this.customerList.findIndex((ele: any) => ele.name == localStorage.getItem("checkCustomer"));
      console.log("[fetchCustomerList]", "checkCustomer => " + checkCustomerIndex);
      this.formLotteryArray.controls['customer'].setValue(this.customerList[checkCustomerIndex].name);
      this.formLotteryArray.controls['checkCustomer'].setValue(this.customerList[checkCustomerIndex].name);
      this.discountForCustomer = parseInt(this.customerList[checkCustomerIndex].discount);
      this.discountHtml = this.discountForCustomer.toString();
      // this.formLotteryArray.controls['discount'].setValue(parseInt(this.customerList[checkCustomerIndex].discount));

      this.customerSelectIndex = await checkCustomerIndex;
      this.qurryBills();

    });
  }

  fetchInstallmentList() {
    const starCountRef = query(ref(this.db, 'installment'), orderByChild('create_at'));
    onValue(starCountRef, async (snapshot) => {
      const data = await snapshot.val();
      console.log("[fetchInstallmentList] data", data);

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
            installment_date: data[key].installment_date,
            create_at: data[key].create_at,
            limited_pay_half: data[key].limited_pay_half,
            limited_not_accept: data[key].limited_not_accept,
          });
          tmpInstallment.sort((a: any, b: any) => {
            return a.create_at - b.create_at;
          });
        });
      }

      this.installmentList = tmpInstallment;

      console.log("[fetchInstallmentList]", this.installmentList);
      if (localStorage.getItem("checkInstallment") == "") {
        //set last installment
        this.formLotteryArray.controls['installment'].setValue(this.installmentList[this.installmentList.length - 1].value)
        this.installmentSelectIndex = this.installmentList.length - 1
      } else {
        let checkInstallmentIndex = await this.installmentList.findIndex((ele: any) => ele.value == localStorage.getItem("checkInstallment"));
        console.log("[fetchInstallmentList]", "checkInstallment => " + checkInstallmentIndex);
        console.log("[fetchInstallmentList] vvvvvvvv", this.installmentList[checkInstallmentIndex]?.value);
        this.formLotteryArray.controls['installment'].setValue(this.installmentList[checkInstallmentIndex]?.value == undefined ? "" : this.installmentList[checkInstallmentIndex]?.value);
        this.formLotteryArray.controls['checkInstallment'].setValue(this.installmentList[checkInstallmentIndex]?.value);
        this.installmentSelectIndex = await checkInstallmentIndex;
      }
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

  removeItem(idx: number): void {
    console.log("[removeItem] lotteryArray.length", this.formLotteryArray.value.lotteryArray.length);
    if (this.formLotteryArray.value.lotteryArray.length > 1) {
      (this.formLotteryArray.controls['lotteryArray'] as FormArray).removeAt(idx);
    }
    this.onSumPriceBills();
  }

  async addItem() {
    this.lotteryArray = this.formLotteryArray.controls['lotteryArray'] as FormArray;
    this.lotteryArray.push(this.createItem());
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
    console.log("[onKeyupLowerEnter] formLotteryArray", this.formLotteryArray.get("lotteryArray").at(index).get("number").value.length);
    if (this.formLotteryArray.get("lotteryArray").at(index).get("number").value.length == 3) {
      this.toddField.last.nativeElement.focus();
    } else {
      this.addItem();
    }
  }

  onChangeNumber(event: any, index: number) {
    console.log('[onChangeNumber] event: ', event.target.value);
    if (event.target.value.length == 1 || event.target.value.length == 2 || event.target.value.length == 0) {
      this.formLotteryArray.get("lotteryArray").at(index).get("todd").disable();
    } else {
      this.formLotteryArray.get("lotteryArray").at(index).get("todd").enable();
    }
    this.onSumPriceBills();
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

            this.lotteryArray = this.formLotteryArray.controls['lotteryArray'] as FormArray;
            let upperPrice = this.formLotteryArray.get("lotteryArray").at(index).get("upper").value;
            for (let i = 0; i < uniqueChars.length; i++) {
              if (this.formLotteryArray.get("lotteryArray").at(index).get("number").value != uniqueChars[i]) {
                this.lotteryArray.push(this.formBuilder.group({
                  number: new FormControl({ value: uniqueChars[i], disabled: false }),
                  upper: new FormControl(upperPrice),
                  lower: new FormControl(''),
                  todd: new FormControl({ value: '', disabled: false })
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


            this.lotteryArray = this.formLotteryArray.controls['lotteryArray'] as FormArray;
            let upperPrice = this.formLotteryArray.get("lotteryArray").at(index).get("upper").value;
            for (let i = 0; i < sixSwap.length; i++) {
              this.lotteryArray.push(this.formBuilder.group({
                number: new FormControl({ value: sixSwap[i], disabled: false }),
                upper: new FormControl(upperPrice),
                lower: new FormControl(''),
                todd: new FormControl({ value: '', disabled: false })
              }));
            }
          }

          this.addItem();

        }

      }
    } else if (this.formLotteryArray.get("lotteryArray").at(index).get("number").value.length == 2) {
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

          this.lotteryArray = this.formLotteryArray.controls['lotteryArray'] as FormArray;
          this.lotteryArray.push(this.formBuilder.group({
            number: new FormControl({ value: swapNumber, disabled: false }),
            upper: new FormControl(upperPrice),
            lower: new FormControl(''),
            todd: new FormControl({ value: '', disabled: true })
          }));

          this.addItem();
        }

      }
    } else if (this.formLotteryArray.get("lotteryArray").at(index).get("number").value.length == 1) {
      if (event.key == "+") {
        this.formLotteryArray.get("lotteryArray").at(index).get("upper").setValue(numberUpper.substring(0, numberUpper.length - 1));
      }
    }
    this.onSumPriceBills();
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

            this.lotteryArray = this.formLotteryArray.controls['lotteryArray'] as FormArray;
            let lowerPrice = this.formLotteryArray.get("lotteryArray").at(index).get("lower").value;
            let upperPrice = this.formLotteryArray.get("lotteryArray").at(index).get("upper").value;
            for (let i = 0; i < uniqueChars.length; i++) {
              if (this.formLotteryArray.get("lotteryArray").at(index).get("number").value != uniqueChars[i]) {
                this.lotteryArray.push(this.formBuilder.group({
                  number: new FormControl({ value: uniqueChars[i], disabled: false }),
                  upper: new FormControl(upperPrice),
                  lower: new FormControl(lowerPrice),
                  todd: new FormControl({ value: '', disabled: false })
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
            this.lotteryArray = this.formLotteryArray.controls['lotteryArray'] as FormArray;
            for (let i = 0; i < sixSwap.length; i++) {
              this.lotteryArray.push(this.formBuilder.group({
                number: new FormControl({ value: sixSwap[i], disabled: false }),
                upper: new FormControl(upperPrice),
                lower: new FormControl(lowerPrice),
                todd: new FormControl({ value: '', disabled: false })
              }));
            }
            this.addItem();
          }

        }
      }
    } else if (this.formLotteryArray.get("lotteryArray").at(index).get("number").value.length == 2) {
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

          this.lotteryArray = this.formLotteryArray.controls['lotteryArray'] as FormArray;
          this.lotteryArray.push(this.formBuilder.group({
            number: new FormControl({ value: swapNumber, disabled: false }),
            upper: new FormControl(upperPrice),
            lower: new FormControl(lowerPrice),
            todd: new FormControl({ value: '', disabled: true })
          }));

          this.addItem();
        }
      }
    } else if (this.formLotteryArray.get("lotteryArray").at(index).get("number").value.length == 1) {
      if (event.key == "+") {
        this.formLotteryArray.get("lotteryArray").at(index).get("lower").setValue(numberLower.substring(0, numberLower.length - 1));
      }
    }
    this.onSumPriceBills();

  }

  onSubmit() {
    this.formLotteryArray.markAllAsTouched();
    console.log("[onSubmit] length => ", this.formLotteryArray.value.lotteryArray.length);
    console.log("[onSubmit] price => ", this.formLotteryArray.value);
    if (this.formLotteryArray.value.lotteryArray.length > 1) {
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
        customer_name: this.customerList[this.customerSelectIndex].name,
        customer_id: this.customerList[this.customerSelectIndex].id,
        installment_date: this.installmentList[this.installmentSelectIndex].installment_date,
        installment_id: this.installmentList[this.installmentSelectIndex].id,
        price: this.formLotteryArray.value.price,
        discount: this.formLotteryArray.value.discount,
        total_price: this.formLotteryArray.value.total_price,
        create_at: Date.now(),
        status: "รอผล",
        item_buy: this.billsArray,
      }).then((res: any) => {
        // Data saved successfully!
        console.log('Data saved successfully! res=> ', res);
        this.lotteryArray.clear();
        this.addItem();

      }).catch((error) => {
        // The write failed...
        console.log('error', error);
      });
    }else {
      // this.formLotteryArray.invalid
    }
  }

  onEdit() {
    console.log("[onEdit] billsByNameInView=> ", this.billsByNameInView);
    let tmpBills = [];
    for (let i = 0; i < this.formLotteryArray.value.lotteryArray.length - 1; i++) {
      tmpBills.push({
        number: this.undefinedToNumber(this.formLotteryArray.value.lotteryArray[i].number),
        upper: this.undefinedToNumber(this.formLotteryArray.value.lotteryArray[i].upper),
        lower: this.undefinedToNumber(this.formLotteryArray.value.lotteryArray[i].lower),
        todd: this.undefinedToNumber(this.formLotteryArray.value.lotteryArray[i].todd)
      });
    }
    this.billsArray = tmpBills;
    console.log("[onSubmit] billsArray", this.billsArray);
    update(ref(this.db, 'bills/' + this.billsByNameInView.id), {
      item_buy: this.billsArray,
      price: this.formLotteryArray.value.price,
      discount: this.formLotteryArray.value.discount,
      total_price: this.formLotteryArray.value.total_price,
      edit_at: Date.now()
    }).then(() => {
      // Data saved successfully!
      console.log('Data saved successfully!');
      this.showViewbills = false;
      this.lotteryArray.clear();
      this.addItem();
    }).catch((error) => {
      // The write failed...
      this.showViewbills = false;
      console.log('error', error);
    });

  }

  onDelete() {
    console.log("[onDelete]");
    const modalConfirmRef = this.modalService.open(ConfirmDialogComponent, { centered: true });
    modalConfirmRef.componentInstance.text = {
      header: "ต้องการลบข้อมูล",
      message: "ต้องการลบบิลใช่หรือไม่"
    }
    modalConfirmRef.result.then((result) => {
      console.log("result: ", result);
      if (result == "confirm") {
        remove(ref(this.db, 'bills/' + this.billsByNameInView.id)).then(() => {
          console.log('Data remove successfully!');
          this.showViewbills = false;
          this.lotteryArray.clear();
          this.addItem();
        }).catch((err: any) => {
          this.showViewbills = false;
          console.log('err', err);
        })
      }
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
    const mostViewedPosts = query(ref(this.db, 'bills'), orderByChild("customer_name"), equalTo(this.customerList[this.customerSelectIndex].name));
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

  onViewbills(index: any) {
    console.log("[onViewbills] index => ", index);
    console.log("[onViewbills] billsByNameList => ", this.billsByNameList[index]);
    console.log("[onViewbills] billsByNameList item_buy => ", this.billsByNameList[index].item_buy);
    this.billsByNameInView = this.billsByNameList[index];
    this.showViewbills = true;

    if (this.lotteryArray?.length != undefined) {
      this.lotteryArray.clear();
    }

    let itemBuy = this.billsByNameList[index].item_buy;

    this.lotteryArray = this.formLotteryArray.controls['lotteryArray'] as FormArray;
    (this.formLotteryArray.controls['lotteryArray'] as FormArray).removeAt(0);

    for (let i = 0; i < itemBuy.length; i++) {
      console.log("[onViewbills] index => ", itemBuy[i].lower);
      this.lotteryArray.push(this.formBuilder.group({
        number: new FormControl(itemBuy[i].number),
        upper: new FormControl(itemBuy[i].upper),
        lower: new FormControl(itemBuy[i].lower),
        todd: new FormControl(itemBuy[i].todd),
      }));
    }
    this.addItem();

  }

  onCustomerChange(event: any) {
    console.log('[onCustomerChange] event: ', event.target.selectedIndex);
    this.customerSelectIndex = event.target.selectedIndex;
    console.log("customerSelectIndex ", this.customerSelectIndex);
    this.discountForCustomer = parseInt(this.customerList[this.customerSelectIndex].discount);
    this.discountHtml = this.discountForCustomer.toString();

    this.qurryBills()
    this.onSumPriceBills();
    if (this.formLotteryArray.controls['checkCustomer'].value) {
      localStorage.setItem("checkCustomer", this.customerList[this.customerSelectIndex]?.name);
    } else {
      localStorage.setItem("checkCustomer", "")
    }
  }

  onInstallmentChange(event: any) {
    console.log('[onInstallmentChange] event: ', event.target.selectedIndex);
    this.installmentSelectIndex = event.target.selectedIndex;
    console.log("installmentSelectIndex", this.installmentSelectIndex);
    this.qurryBills();
    if (this.formLotteryArray.controls['checkInstallment'].value) {
      localStorage.setItem("checkInstallment", this.installmentList[this.installmentSelectIndex]?.value);
    } else {
      localStorage.setItem("checkInstallment", "")
    }
  }

  onCheckCustomerChange(event: any) {
    console.log('[onCheckCustomerChange] event: ', event.target.checked);
    if (event.target.checked) {
      console.log("isChecked true: ", this.customerList);
      console.log("isChecked true: customerSelectIndex => ", this.customerSelectIndex);
      console.log("isChecked true: ", this.customerList[this.customerSelectIndex]?.name);

      localStorage.setItem("checkCustomer", this.customerList[this.customerSelectIndex]?.name);
    } else {
      localStorage.setItem("checkCustomer", "")
    }
  }

  onCheckInstallmentChange(event: any) {
    console.log('[onCheckInstallmentChange] event: ', event.target.checked);
    if (event.target.checked) {
      console.log("isChecked true: ", this.installmentList);
      console.log("isChecked true: customerSelectIndex => ", this.installmentSelectIndex);
      console.log("isChecked true: ", this.installmentList[this.installmentSelectIndex]?.value);

      localStorage.setItem("checkInstallment", this.installmentList[this.installmentSelectIndex]?.value);
    } else {
      localStorage.setItem("checkInstallment", "")
    }
  }



  onSumPriceBills() {
    let discount: number = 0;
    let priceAll: number = 0;
    let tmpBills = [];
    let tmpRunNumberBills = [];
    this.billsPrice = 0;
    this.billsRunNumberPrice = 0;
    for (let i = 0; i < this.formLotteryArray.value.lotteryArray.length - 1; i++) {
      if (this.formLotteryArray.value.lotteryArray[i].number.length == 1) {
        tmpRunNumberBills.push({
          number: this.undefinedToNumber(this.formLotteryArray.value.lotteryArray[i].number),
          upper: this.undefinedToNumber(this.formLotteryArray.value.lotteryArray[i].upper),
          lower: this.undefinedToNumber(this.formLotteryArray.value.lotteryArray[i].lower),
          todd: this.undefinedToNumber(this.formLotteryArray.value.lotteryArray[i].todd)
        })
      } else {
        tmpBills.push({
          number: this.undefinedToNumber(this.formLotteryArray.value.lotteryArray[i].number),
          upper: this.undefinedToNumber(this.formLotteryArray.value.lotteryArray[i].upper),
          lower: this.undefinedToNumber(this.formLotteryArray.value.lotteryArray[i].lower),
          todd: this.undefinedToNumber(this.formLotteryArray.value.lotteryArray[i].todd)
        });
      }
    }

    for (let r = 0; r < tmpRunNumberBills.length; r++) {
      this.billsRunNumberPrice = this.billsRunNumberPrice + parseInt(this.undefinedToNumber(tmpRunNumberBills[r]?.upper)) + parseInt(this.undefinedToNumber(tmpRunNumberBills[r]?.lower));
    }

    for (let n = 0; n < tmpBills.length; n++) {
      this.billsPrice = this.billsPrice + parseInt(this.undefinedToNumber(tmpBills[n]?.upper)) + parseInt(this.undefinedToNumber(tmpBills[n]?.lower)) + parseInt(this.undefinedToNumber(tmpBills[n]?.todd));

    }

    console.log("tmpBills: ", tmpBills);
    console.log("tmpRunNumberBills: ", tmpRunNumberBills);

    console.log("billsPrice: ", this.billsPrice);
    console.log("billsRunNumberPrice: ", this.billsRunNumberPrice);

    console.log("[onSumPriceBills] discountForCustomer", this.discountForCustomer);

    priceAll = this.billsPrice + this.billsRunNumberPrice;
    console.log("[onSumPriceBills] priceAll", priceAll);

    
    if(priceAll >= 100){
      discount = (this.billsPrice * this.discountForCustomer) / 100;
    }


    this.formLotteryArray.controls['price'].setValue(priceAll);
    this.formLotteryArray.controls['discount'].setValue(discount);
    this.formLotteryArray.controls['total_price'].setValue(priceAll - discount);
    this.discountHtml = "ส่วนลด " + this.discountForCustomer + "\n" + "test";
  }

  onNavigateToContect() {
    console.log("[onNavigateToContect]");
    this.router.navigateByUrl('/contect');
  }

  // Modal Installment
  onAddInstallment() {
    console.log("[onAddInstallment]");
    const modalRef = this.modalService.open(AddInstallmentComponent, { centered: true });
    modalRef.result.then((result) => {
      console.log("result: ", result);
      if (result == "success") {
        this.fetchInstallmentList();
      }
    });
  }

  onRemoveInstallment() {
    console.log("[onDelete]");
    const modalConfirmRef = this.modalService.open(ConfirmDialogComponent, { centered: true });
    modalConfirmRef.componentInstance.text = {
      header: "ต้องการลบข้อมูล",
      message: "ต้องการลบงวดใช่หรือไม่ บิลทั้งหมดจะไม่มีงวด อาจเกิดปัญหาได้"
    }
    modalConfirmRef.result.then((result) => {
      console.log("result: ", result);
      if (result == "confirm") {
        console.log("[onRemoveInstallment]");
        console.log(this.installmentList[this.installmentSelectIndex].id);
        remove(ref(this.db, 'installment/' + this.installmentList[this.installmentSelectIndex].id)).then(() => {
          console.log('[onRemoveInstallment] Data remove successfully!');
        }).catch((err: any) => {
          console.log('[onRemoveInstallment] err --> ', err);
        })
      }
    });
  }


  // Modal onUnlimited
  openModallimitedNumber() {
    console.log("[onUnlimitedPayHalf]", this.installmentList[this.installmentSelectIndex]);
    this.installmentSelect = this.installmentList[this.installmentSelectIndex].limited_pay_half;
    const modalRef = this.modalService.open(LimitedNumberComponent, { fullscreen: true });
    modalRef.componentInstance.installmentList = this.installmentList[this.installmentSelectIndex];
  }

}
