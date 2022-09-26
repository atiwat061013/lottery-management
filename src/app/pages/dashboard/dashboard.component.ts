import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { equalTo, getDatabase, onValue, orderByChild, query, ref, update } from 'firebase/database';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  db = getDatabase();

  formInstallment: FormGroup | any

  installmentList: any = [];
  installmentNow: any;
  billsList: any = [];
  total_price: number = 0;
  reward: number = 0;

  constructor(
    private formBuilder: FormBuilder,
    private dataService: DataService
  ) { }

  ngOnInit(): void {
    this.formInstallment = this.formBuilder.group({
      installment: new FormControl('', [Validators.required]),
    });

    this.fetchInstallmentList();
  }

  onInstallmentChange(event: any) {
    console.log("even: ", event.target.selectedIndex);
    this.total_price = 0;
    this.reward = 0;
    this.fetchBillsList(this.installmentList[event.target.selectedIndex].installment_date);
    this.installmentNow = this.installmentList[event.target.selectedIndex];
    console.log("[fetchInstallmentList]", this.installmentNow);
  }

  async fetchInstallmentList() {
    const starCountRef = query(ref(this.db, 'installment'), orderByChild('create_at'));
    onValue(starCountRef, async (snapshot) => {
      const data = await snapshot.val();
      console.log("data", data);

      let tmpInstallment: any = [];
      tmpInstallment.push({
        label: 'รวมงวด',
        value: '',
        id: '',
        installment_date: 'รวมงวด'
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
            unlimited_pay_half: data[key].unlimited_pay_half,
          });
          tmpInstallment.sort((a: any, b: any) => {
            return a.create_at - b.create_at;
          });
        });
      }

      this.installmentList = await tmpInstallment;

      console.log("[fetchInstallmentList] data", this.installmentList);
      console.log("[fetchInstallmentList]", this.installmentList);



      this.formInstallment.controls['installment'].setValue(this.installmentList[this.installmentList.length - 1].value);
      this.installmentNow = this.installmentList[this.installmentList.length - 1];
      console.log("[fetchInstallmentList]", this.installmentNow);
      this.fetchBillsList(this.installmentNow.installment_date);

    });
  }

  fetchBillsList(installment_date: string) {
    if (installment_date == "รวมงวด") {
      const starCountRef = ref(this.db, 'bills/');
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
            this.total_price += data[key]?.total_price
            this.reward += data[key].sum_bill?.reward == undefined ? 0 : data[key].sum_bill?.reward
          });
        }

        this.billsList = tmpName;
        console.log("[fetchBillsList] total_price => ", this.total_price);
        console.log("[fetchBillsList] reward => ", this.reward);
        console.log("[fetchBillsList] billsList => ", this.billsList);
      });
    } else {
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
            this.total_price += data[key]?.total_price
            this.reward += data[key].sum_bill?.reward == undefined ? 0 : data[key].sum_bill?.reward
          });
        }

        this.billsList = tmpName;
        console.log("[fetchBillsList] billsList => ", this.billsList);
      });
    }

  }

  notifyToLine() {
    const baseUrl = `https://us-central1-node-line-notify.cloudfunctions.net/lottery/api/notify`;
    const payload = JSON.stringify({
      token: "HdqFyJFYYDQWQHf9DZwDTtxlRn2FrHAy4KK3Kv170iI",
      message: "แจ้งยอดเงินคงเหลือ\nรายได้ทั้งหมด: " + this.total_price + "\nรายจ่าย: " + this.reward + "\nกำไรขาดทุน: " + (this.total_price - this.reward)
    })
    this.dataService.fetchData('POST', baseUrl, payload).then((res: any) => {
      console.log("res => ", res);

    });
  }

}
