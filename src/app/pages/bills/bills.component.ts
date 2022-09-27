import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { equalTo, getDatabase, onValue, orderByChild, query, ref, update } from 'firebase/database';
import { AddRewardLotteryComponent } from 'src/app/modals/add-reward-lottery/add-reward-lottery.component';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-bills',
  templateUrl: './bills.component.html',
  styleUrls: ['./bills.component.scss']
})
export class BillsComponent implements OnInit {
  @ViewChild(DatatableComponent) tableBills!: DatatableComponent;
  //Firebase
  db = getDatabase();
  billsList: any = [];

  formBills: FormGroup | any;

  isLoadingtablebills: boolean = false;
  installmentNow: any;
  lotteryAwardData: any = [];

  //datatable
  rowLimit: any;
  limitValue: any;
  LIMITS: any;

  installmentList: any = [];
  customerList: any;

  constructor(
    private formBuilder: FormBuilder,
    public modalService: NgbModal,
    private dataService: DataService) {
    this.rowLimit = 10;
    this.LIMITS = [
      { value: 10 },
      { value: 50 },
      { value: 100 },
      { value: 500 },
      { value: 1000 },
    ];

    this.formBills = this.formBuilder.group({
      installment: new FormControl('', [Validators.required]),
    });
  }

  ngAfterViewChecked() {
    setTimeout(() => { window.dispatchEvent(new Event('resize')); }, 250)
  }

  async ngOnInit(): Promise<void> {
    
    await this.fetchCustomerList();
    await this.fetchInstallmentList();

  }

  notifyToLine() {
    const baseUrl = `https://us-central1-node-line-notify.cloudfunctions.net/lottery/api/notify`;
    const payload = JSON.stringify({
      token: "1EEnTzVgjOTeKHz2NtwP8vsdNNXXHb4CUfvb21nSn8Q",
      message: "ทดสอบจากเว็บ\ndsadsadasdsad"
    })
    this.dataService.fetchData('POST', baseUrl, payload).then((res: any) => {
      console.log("res => ", res);

    });
  }

  getInstallmentAward() {
    console.log("[getInstallmentAward] ", this.installmentList);
    console.log("[getInstallmentAward] ", this.formBills.controls['installment'].value);

    const installmentSelect = this.installmentList.findIndex((item: any) => {
      return item?.label == this.formBills.controls['installment'].value
    });

    const installment = this.installmentList[installmentSelect].installment_date.split('-');

    console.log("[getInstallmentAward] ", installment);
    this.getLotteryAward(installment[2], installment[1], installment[0], this.installmentList[installmentSelect].id)

  }

  getLotteryAward(data: string, month: string, year: string, installmentId: string) {
    console.log("[getLotteryAward] installmentId ", installmentId);
    const baseUrl = `https://us-central1-node-line-notify.cloudfunctions.net/lottery/api/getlotteryaward`;
    const payload = JSON.stringify({
      date: data,
      month: month,
      year: year
    });
    this.dataService.fetchData('POST', baseUrl, payload).then(async (res: any) => {
      console.log("[getLotteryAward] award => ", res.response.data);
      this.lotteryAwardData = await res.response.data;

      const award = ["first", "last3f", "last3b", "last2"];
      const awards: any = {};
      console.log("[getLotteryAward] award => ", award);

      console.log("[getLotteryAward] lotteryAwardData => ", this.lotteryAwardData);
      for (let index = 0; index < award.length; index++) {
        console.log("award", "index -> " + award[index]);
        const tmp = [];
        for (let y = 0; y < this.lotteryAwardData[award[index]].number.length; y++) {
          console.log("awards", "value -> " + this.lotteryAwardData[award[index]].number[y].value);
          tmp.push({
            "round": this.lotteryAwardData[award[index]].number[y].round,
            "value": this.lotteryAwardData[award[index]].number[y].value
          });
        }
        awards[award[index]] = tmp;
        console.log("awards", "awards -> " + JSON.stringify(awards));
        console.log("awards", "awards -> " + awards);
      }

      update(ref(this.db, 'installment/' + installmentId), {
        award: awards,
        edit_at: Date.now()
      }).then(() => {
        // Data saved successfully!
        console.log('Data saved successfully!');
      }).catch((error) => {
        // The write failed...
        console.log('error', error);
      });

    });
  }

  onInstallmentChange(event: any) {
    console.log("even: ", event.target.selectedIndex);
    this.fetchBillsList(this.installmentList[event.target.selectedIndex].installment_date);
    this.installmentNow = this.installmentList[event.target.selectedIndex];
    console.log("[fetchInstallmentList]", this.installmentNow);

  }

  fetchBillsList(installment_date: string) {
    console.log("[fetchBillsList] installment_date --> ", installment_date);
    const starCountRef = query(ref(this.db, 'bills'), orderByChild('installment_date'), equalTo(installment_date));
    onValue(starCountRef, async (snapshot) => {
      const data = await snapshot.val();
      console.log("data", data);

      let tmpName: any = [];
      if (data != undefined) {
        Object.keys(data).forEach((key: any, index: number) => {
          tmpName.push({
            id: data[key].id,
            customer_name: data[key].customer_name,
            customer_id: data[key].customer_id,
            price: data[key].price,
            discount: data[key].discount,
            total_price: data[key].total_price,
            create_at: data[key].create_at,
            status: data[key].status,
            item_buy: data[key].item_buy,
            sum_bill: data[key].sum_bill,
            bank_account_number: data[key].bank_account_number,
            bank_account_name: data[key].bank_account_name,
            bank_account: data[key].bank_account
          });
        });
      }

      this.billsList = tmpName;
      console.log("[fetchBillsList] billsList => ", this.billsList);
    });
  }

  async fetchCustomerList() {
    const starCountRef = ref(this.db, 'customer/');
    onValue(starCountRef, async (snapshot) => {
      const data = await snapshot.val();
      console.log("data", data);

      let tmpName: any = [];
      Object.keys(data).forEach((key: any, index: number) => {
        tmpName.push({
          id: data[key].id,
          name: data[key].name,
          phone: data[key].phone,
          discount: data[key].discount,
          create_at: data[key].create_at,
          bank_account_number: data[key].bank_account_number,
          bank_account_name: data[key].bank_account_name,
          bank_account: data[key].bank_account,
          pay_rate_run_upper: data[key].pay_rate_run_upper,
          pay_rate_run_lower: data[key].pay_rate_run_lower,
          pay_rate_two_number: data[key].pay_rate_two_number,
          pay_rate_three_straight: data[key].pay_rate_three_straight,
          pay_rate_three_todd: data[key].pay_rate_three_todd,
          pay_rate_three_lower: data[key].pay_rate_three_lower,
        });
      });

      this.customerList = await tmpName;
    });
  }

  async fetchInstallmentList() {
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
            installment_date: data[key].installment_date,
            create_at: data[key].create_at,
            award: data[key].award,
            limited_pay_half: data[key].limited_pay_half,
          });
          tmpInstallment.sort((a: any, b: any) => {
            return a.create_at - b.create_at;
          });
        });
      }

      this.installmentList = await tmpInstallment;

      console.log("[fetchInstallmentList] data", this.installmentList);
      console.log("[fetchInstallmentList]", this.installmentList);



      //set last installment
      // this.formBills.controls['installment'].setValue(this.installmentList[this.installmentList.length - 1].value);
      this.installmentNow = this.installmentList[this.installmentList.length - 1];
      console.log("[fetchInstallmentList]", this.installmentNow);
      // this.fetchBillsList(this.installmentNow.installment_date);

    });
  }

  onCheckReward() {
    console.log("[onCheckReward]", this.billsList);
    let sum_bill: any;
    for (let b = 0; b < this.billsList.length; b++) {
      // console.log("[onCheckReward] bill -->"+ b, this.billsList[b]);
      const customer = this.customerList.find((data: any) => {
        return data.id == this.billsList[b].customer_id;
      });

      let bill_win: any = [];
      let reward: number = 0;
      for (let i = 0; i < this.billsList[b].item_buy.length; i++) {



        if (this.billsList[b].item_buy[i].number.length == 1) {
          //run number
          if (
            this.billsList[b].item_buy[i].number == this.installmentNow?.award?.last2[0] && this.billsList[b].item_buy[i].lower != 0 ||
            this.billsList[b].item_buy[i].number == this.installmentNow?.award?.last2[1] && this.billsList[b].item_buy[i].lower != 0
          ) {
            let won: number = this.billsList[b].item_buy[i].lower * customer.pay_rate_run_lower;
            bill_win.push({
              number: this.billsList[b].item_buy[i].number,
              price: this.billsList[b].item_buy[i].lower,
              type: "เลขวิ่งล่าง",
              reward: won
            });
            reward += won;
          }

          if (
            this.billsList[b].item_buy[i].number == this.installmentNow?.award?.first.substr(3, 6)[0] && this.billsList[b].item_buy[i].upper != 0 ||
            this.billsList[b].item_buy[i].number == this.installmentNow?.award?.first.substr(3, 6)[1] && this.billsList[b].item_buy[i].upper != 0 ||
            this.billsList[b].item_buy[i].number == this.installmentNow?.award?.first.substr(3, 6)[2] && this.billsList[b].item_buy[i].upper != 0
          ) {
            let won: number = this.billsList[b].item_buy[i].upper * customer.pay_rate_run_upper;
            bill_win.push({
              number: this.billsList[b].item_buy[i].number,
              price: this.billsList[b].item_buy[i].upper,
              type: "เลขวิ่งบน",
              reward: won
            });
            reward += won;
          }
        } else if (this.billsList[b].item_buy[i].number.length == 2) {
          //two number lower
          if (this.billsList[b].item_buy[i].number == this.installmentNow?.award?.last2) {
              if (this.checkHaftPay(this.billsList[b].item_buy[i].number)) {
                let won: number = (this.billsList[b].item_buy[i].lower / 2) * customer.pay_rate_two_number;
                bill_win.push({
                  number: this.billsList[b].item_buy[i].number,
                  price: this.billsList[b].item_buy[i].lower,
                  type: "เลข2ตัวล่างจ่ายครึ่ง",
                  reward: won
                });
                reward += won;
              } else {
                let won: number = this.billsList[b].item_buy[i].lower * customer.pay_rate_two_number;
                bill_win.push({
                  number: this.billsList[b].item_buy[i].number,
                  price: this.billsList[b].item_buy[i].lower,
                  type: "เลข2ตัวล่างจ่ายครึ่ง",
                  reward: won
                });
                reward += won;
              }
          }
          //two number upper
          if (this.billsList[b].item_buy[i].number == this.installmentNow?.award?.first.substr(4, 6)) {
              if (this.checkHaftPay(this.billsList[b].item_buy[i].number)) {
                let won: number = (this.billsList[b].item_buy[i].upper / 2) * customer.pay_rate_two_number;
                bill_win.push({
                  number: this.billsList[b].item_buy[i].number,
                  price: this.billsList[b].item_buy[i].upper,
                  type: "เลข2ตัวบนจ่ายครึ่ง",
                  reward: won
                });
                reward += won;
              } else {
                let won: number = this.billsList[b].item_buy[i].upper * customer.pay_rate_two_number;
                bill_win.push({
                  number: this.billsList[b].item_buy[i].number,
                  price: this.billsList[b].item_buy[i].upper,
                  type: "เลข2ตัวบน",
                  reward: won
                });
                reward += won;
              }

          }
        } else if (this.billsList[b].item_buy[i].number.length == 3) {
          //three number
          if (this.billsList[b].item_buy[i].number == this.installmentNow?.award?.first.substr(3, 6)) {
              if (this.checkHaftPay(this.billsList[b].item_buy[i].number)) {
                let won: number = (this.billsList[b].item_buy[i].upper / 2) * customer.pay_rate_three_straight;
                bill_win.push({
                  number: this.billsList[b].item_buy[i].number,
                  price: this.billsList[b].item_buy[i].upper,
                  type: "3ตัวตรงจ่ายครึ่ง",
                  reward: won
                });
                reward += won;
              } else {
                let won: number = this.billsList[b].item_buy[i].upper * customer.pay_rate_three_straight;
                bill_win.push({
                  number: this.billsList[b].item_buy[i].number,
                  price: this.billsList[b].item_buy[i].upper,
                  type: "3ตัวตรง",
                  reward: won
                });
                reward += won;
              }


          } else if (this.billsList[b].item_buy[i].number == this.installmentNow?.award?.last3f1 ||
            this.billsList[b].item_buy[i].number == this.installmentNow?.award?.last3f2 ||
            this.billsList[b].item_buy[i].number == this.installmentNow?.award?.last3b1 ||
            this.billsList[b].item_buy[i].number == this.installmentNow?.award?.last3b2) {
            if (this.billsList[b].item_buy[i].upper != 0) {
                if (this.checkHaftPay(this.billsList[b].item_buy[i].number)) {
                  let won: number = (this.billsList[b].item_buy[i].upper / 2) * customer.pay_rate_three_lower;
                  bill_win.push({
                    number: this.billsList[b].item_buy[i].number,
                    price: this.billsList[b].item_buy[i].upper,
                    type: "3ตัวล่างจ่ายครึ่ง",
                    reward: won
                  });
                  reward += won;
                } else {
                  let won: number = this.billsList[b].item_buy[i].upper * customer.pay_rate_three_lower;
                  bill_win.push({
                    number: this.billsList[b].item_buy[i].number,
                    price: this.billsList[b].item_buy[i].upper,
                    type: "3ตัวล่าง",
                    reward: won
                  });
                  reward += won;
                }

            }
          } else {
            let numLength1 = this.installmentNow?.award?.first.substr(3, 6)[0];
            let numLength2 = this.installmentNow?.award?.first.substr(3, 6)[1];
            let numLength3 = this.installmentNow?.award?.first.substr(3, 6)[2];

            let threeSwapNumber1 = numLength1.concat(numLength2).concat(numLength3);
            let threeSwapNumber2 = numLength2.concat(numLength1).concat(numLength3);
            let threeSwapNumber3 = numLength3.concat(numLength2).concat(numLength1);
            let threeSwapNumber4 = numLength1.concat(numLength3).concat(numLength2);
            let threeSwapNumber5 = numLength2.concat(numLength3).concat(numLength1);
            let threeSwapNumber6 = numLength3.concat(numLength1).concat(numLength2);
            if (this.billsList[b].item_buy[i].number == threeSwapNumber1 ||
              this.billsList[b].item_buy[i].number == threeSwapNumber2 ||
              this.billsList[b].item_buy[i].number == threeSwapNumber3 ||
              this.billsList[b].item_buy[i].number == threeSwapNumber4 ||
              this.billsList[b].item_buy[i].number == threeSwapNumber5 ||
              this.billsList[b].item_buy[i].number == threeSwapNumber6
            ) {
              if (this.billsList[b].item_buy[i].todd != 0) {
                  if (this.checkHaftPay(this.billsList[b].item_buy[i].number)) {
                    let won: number = (this.billsList[b].item_buy[i].todd / 2) * customer.pay_rate_three_todd;
                    bill_win.push({
                      number: this.billsList[b].item_buy[i].number,
                      price: this.billsList[b].item_buy[i].todd,
                      type: "3ตัวโต๊สจ่ายครึ่ง",
                      reward: won
                    });
                    reward += won;
                  } else {
                    let won: number = this.billsList[b].item_buy[i].todd * customer.pay_rate_three_todd;
                    bill_win.push({
                      number: this.billsList[b].item_buy[i].number,
                      price: this.billsList[b].item_buy[i].todd,
                      type: "3ตัวโต๊ส",
                      reward: won
                    });
                    reward += won;
                  }

              }
            }
          }
        }

        if (i == this.billsList[b].item_buy.length - 1) {
          console.log("last");

          sum_bill = {
            bill_win,
            reward: reward
          }

        }



      }
      console.log("[billsList]", this.billsList[b])
      console.log("[bill_win]", bill_win.length)

      if (bill_win.length == 0) {
        update(ref(this.db, 'bills/' + this.billsList[b].id), {
          edit_at: Date.now(),
          status: "ไม่ถูกรางวัล"
        }).then(() => {
          // Data saved successfully!
          console.log('Data saved successfully!');
        }).catch((error) => {
          // The write failed...
          console.log('error', error);
        });
      } else {
        console.log("[update] result --> ", sum_bill);
        console.log("[update] bill_win --> ", bill_win);
        update(ref(this.db, 'bills/' + this.billsList[b].id), {
          edit_at: Date.now(),
          sum_bill,
          status: "ถูกรางวัล"
        }).then(() => {
          // Data saved successfully!
          console.log('Data saved successfully!');
        }).catch((error) => {
          // The write failed...
          console.log('error', error);
        });
      }

    }
    // console.log("[result]", result)
  }

  checkHaftPay(number: any): boolean {
    const limited_pay_half = this.installmentNow.limited_pay_half
    let istrue: boolean = false;
    limited_pay_half.find((limited_num: any) => {
      if(number == limited_num){
        console.log("[checkHaftPay] true");
        istrue = true
      }else {
        console.log("[checkHaftPay] false");
        istrue = false
      }
    });

    return istrue;
  }

  openModal() {
    const installmentSelect = this.installmentList.findIndex((item: any) => {
      return item?.label == this.formBills.controls['installment'].value
    });

    const modalRef = this.modalService.open(AddRewardLotteryComponent);
    modalRef.componentInstance.installment = {
      id: this.installmentList[installmentSelect].id,
    };
    modalRef.result.then((result) => {
      if (result) {
        console.log(result);
      }
    });
    // modalRef.componentInstance.passEntry.subscribe((receivedEntry) => {
    //   console.log(receivedEntry);
    // })
  }

  limitEmp(value: any) {
    console.log('change limit: ', value);
    this.rowLimit = value;
  }

  // limitEmp(event: any) {
  //   console.log('change limit: ', event.target.selectedIndex);
  //   this.rowLimit = this.LIMITS[event.target.selectedIndex].value;
  // }

}
