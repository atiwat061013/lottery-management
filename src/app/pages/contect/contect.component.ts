import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { getDatabase, ref, child, get, set, push, onValue, update } from "firebase/database";
import * as md5 from 'md5';
@Component({
  selector: 'app-contect',
  templateUrl: './contect.component.html',
  styleUrls: ['./contect.component.scss']
})
export class ContectComponent implements OnInit {

  @ViewChild('createContectModalClose', { static: true }) createContectModalClose:
    | ElementRef<HTMLElement>
    | any;

  formContect: FormGroup | any;
  //Firebase
  db = getDatabase();

  customerList: any = [];
  indexViewCustomer: any;

  isLoadingtableCustomer: boolean = false;
  editMode: boolean = false;


  validation_messages = {
    name: [{ type: 'required', message: 'กรุณากรอกชื่อลูกค้า' }],
    phone: [{ type: 'required', message: 'Phone is required.' }],
    bank_account: [{ type: 'required', message: 'bank is required.' }],
    bank_account_name: [{ type: 'required', message: 'bank is required.' }],
    bank_account_number: [{ type: 'required', message: 'bank is required.' }],
    discount: [{ type: 'required', message: 'กรุณากรอกส่วนลด' }],
    pay_rate_run_upper: [{ type: 'required', message: 'กรุณากรอกอัตราจ่าย' }],
    pay_rate_run_lower: [{ type: 'required', message: 'กรุณากรอกอัตราจ่าย' }],
    pay_rate_two_number: [{ type: 'required', message: 'กรุณากรอกอัตราจ่าย' }],
    pay_rate_three_straight: [{ type: 'required', message: 'กรุณากรอกอัตราจ่าย' }],
    pay_rate_three_todd: [{ type: 'required', message: 'กรุณากรอกอัตราจ่าย' }],
    pay_rate_three_lower: [{ type: 'required', message: 'กรุณากรอกอัตราจ่าย' }],
  };
  bankAccountList = [
    { value: '', label: 'กรุณาเลือก' },
    { value: 'SCB|ธนาคารไทยพาณิชย์', label: 'ธนาคารไทยพาณิชย์' },
    { value: 'BBL|ธนาคารกรุงเทพ', label: 'ธนาคารกรุงเทพ' },
    { value: 'KBANK|ธนาคารกสิกรไทย', label: 'ธนาคารกสิกรไทย' }
  ];


  constructor(private formBuilder: FormBuilder) {
    this.formContect = this.formBuilder.group({
      name: new FormControl('', [Validators.required]),
      phone: new FormControl(''),
      bank_account: new FormControl(''),
      bank_account_name: new FormControl(''),
      bank_account_number: new FormControl(''),
      discount: new FormControl('', [Validators.required]),
      pay_rate_run_upper: new FormControl('', [Validators.required]),
      pay_rate_run_lower: new FormControl('', [Validators.required]),
      pay_rate_two_number: new FormControl('', [Validators.required]),
      pay_rate_three_straight: new FormControl('', [Validators.required]),
      pay_rate_three_todd: new FormControl('', [Validators.required]),
      pay_rate_three_lower: new FormControl('', [Validators.required]),
    });
  }

  ngOnInit(): void {
    this.fetchCustomerList();
  }

  fetchCustomerList() {
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

      this.customerList = tmpName;
      console.log(this.customerList);
    });
  }

  onViewCustomer(index: number) {
    console.log("[onViewCustomer] index => ", index);
    this.editMode = true;
    this.indexViewCustomer = index;
    this.formContect = this.formBuilder.group({
      name: new FormControl(this.customerList[index].name, [Validators.required]),
      phone: new FormControl(this.customerList[index].phone),
      bank_account: new FormControl(this.customerList[index].bank_account),
      bank_account_name: new FormControl(this.customerList[index].bank_account_name),
      bank_account_number: new FormControl(this.customerList[index].bank_account_number),
      discount: new FormControl(this.customerList[index].discount, [Validators.required]),
      pay_rate_run_upper: new FormControl(this.customerList[index].pay_rate_run_upper, [Validators.required]),
      pay_rate_run_lower: new FormControl(this.customerList[index].pay_rate_run_lower, [Validators.required]),
      pay_rate_two_number: new FormControl(this.customerList[index].pay_rate_two_number, [Validators.required]),
      pay_rate_three_straight: new FormControl(this.customerList[index].pay_rate_three_straight, [Validators.required]),
      pay_rate_three_todd: new FormControl(this.customerList[index].pay_rate_three_todd, [Validators.required]),
      pay_rate_three_lower: new FormControl(this.customerList[index].pay_rate_three_lower, [Validators.required]),
    });
  }

  onEditContect() {
    console.log("[onEditContect]", this.formContect.value);
    update(ref(this.db, 'customer/' + this.customerList[this.indexViewCustomer].id), {
      name: this.formContect.value.name,
      phone: this.formContect.value.phone,
      bank_account: this.formContect.value.bank_account,
      bank_account_name: this.formContect.value.bank_account_name,
      bank_account_number: this.formContect.value.bank_account_number,
      discount: parseInt(this.formContect.value.discount),
      pay_rate_run_upper: parseInt(this.formContect.value.pay_rate_run_upper),
      pay_rate_run_lower: parseInt(this.formContect.value.pay_rate_run_lower),
      pay_rate_two_number: parseInt(this.formContect.value.pay_rate_two_number),
      pay_rate_three_straight: parseInt(this.formContect.value.pay_rate_three_straight),
      pay_rate_three_todd: parseInt(this.formContect.value.pay_rate_three_todd),
      pay_rate_three_lower: parseInt(this.formContect.value.pay_rate_three_lower),
      edit_at: Date.now()
    }).then(() => {
      // Data saved successfully!
      console.log('Data saved successfully!');
      this.createContectModalClose?.nativeElement?.click();
      this.formContect.reset();
    }).catch((error) => {
      // The write failed...
      console.log('error', error);
    });
  }

  onSubmitContect() {
    console.log("[onSubmitContect]", this.formContect.value);
    const uuid = md5(this.formContect.value.name + this.formContect.value.bank_account_number);
    const newPostKey = push(child(ref(this.db), 'customer')).key;
    set(ref(this.db, 'customer/' + newPostKey), {
      id: newPostKey,
      name: this.formContect.value.name,
      phone: this.formContect.value.phone,
      bank_account: this.formContect.value.bank_account,
      bank_account_name: this.formContect.value.bank_account_name,
      bank_account_number: this.formContect.value.bank_account_number,
      discount: parseInt(this.formContect.value.discount),
      pay_rate_run_upper: parseInt(this.formContect.value.pay_rate_run_upper),
      pay_rate_run_lower: parseInt(this.formContect.value.pay_rate_run_lower),
      pay_rate_two_number: parseInt(this.formContect.value.pay_rate_two_number),
      pay_rate_three_straight: parseInt(this.formContect.value.pay_rate_three_straight),
      pay_rate_three_todd: parseInt(this.formContect.value.pay_rate_three_todd),
      pay_rate_three_lower: parseInt(this.formContect.value.pay_rate_three_lower),
      create_at: Date.now()
    }).then(() => {
      // Data saved successfully!
      console.log('Data saved successfully!');
      this.createContectModalClose?.nativeElement?.click();
      this.formContect.reset();

    }).catch((error) => {
      // The write failed...
      console.log('error', error);
    });
  }



}
