import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { equalTo, getDatabase, onValue, orderByChild, query, ref } from 'firebase/database';

@Component({
  selector: 'app-bills',
  templateUrl: './bills.component.html',
  styleUrls: ['./bills.component.scss']
})
export class BillsComponent implements OnInit {
  //Firebase
  db = getDatabase();
  billsList: any = [];

  formBills: FormGroup | any;

  isLoadingtablebills: boolean = false;

  installmentList: any = [
    {
      "label": "เลือกงวดที่ต้องการ",
      "value": "",
      "id": "",
      "installment_date": ""
    },
    {
      "label": "งวดประจำวันที่ 2022-08-01",
      "value": "งวดประจำวันที่ 2022-08-01",
      "id": "fde2f89c3ab81ca97fe3a6d77adbd352",
      "installment_date": "2022-08-01"
    }
  ]

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.formBills = this.formBuilder.group({
      installment: new FormControl('', [Validators.required]),
    });

    this.fetchInstallmentList();

    this.fetchBillsList(this.installmentList[this.installmentList.length - 1].installment_date);
  }

  onInstallmentChange(even: any){
    console.log("even: ", even);
    

  }

  fetchBillsList(installment_date: string) {
    const starCountRef = query(ref(this.db, 'bills'), orderByChild('installment_date'), equalTo(installment_date));
    onValue(starCountRef, async (snapshot) => {
      const data = await snapshot.val();
      console.log("data", data);

      let tmpName: any = [];
      Object.keys(data).forEach((key: any, index: number) => {
        tmpName.push({
          id: data[key].id,
          customer_name: data[key].customer_name,
          price: data[key].price,
          discount: data[key].discount,
          total_price: data[key].total_price,
          create_at: data[key].create_at,
          bank_account_number: data[key].bank_account_number,
          bank_account_name: data[key].bank_account_name,
          bank_account: data[key].bank_account
        });
      });

      this.billsList = tmpName;
      console.log("[fetchBillsList] billsList => ", this.billsList);
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
      this.formBills.controls['installment'].setValue(this.installmentList[this.installmentList.length - 1].value)
      // this.installmentSelectIndex = this.installmentList.length - 1


    });
  }

}
