import { Component, OnInit } from '@angular/core';
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

  isLoadingtablebills: boolean = false;

  constructor() { }

  ngOnInit(): void {
    this.fetchBillsList();
  }

  fetchBillsList() {
    const starCountRef = query(ref(this.db, 'bills'), orderByChild('installment_date'), equalTo('2022-08-01'));
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

}
