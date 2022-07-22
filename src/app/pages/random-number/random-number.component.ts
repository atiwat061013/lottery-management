import { Component, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-random-number',
  templateUrl: './random-number.component.html',
  styleUrls: ['./random-number.component.scss'],
})
export class RandomNumberComponent implements OnInit {
  @ViewChild(DatatableComponent) tableRandom!: DatatableComponent;

  customerList: any = [];
  tempcustomerList: any = [];
  isLoadingtableRandom: boolean = false;

  numRandom: any;

  formRandom: FormGroup | any;

  //datatable
  rowLimit: any;
  limitValue: any;
  LIMITS: any;

  constructor(private formBuilder: FormBuilder) {
    this.rowLimit = 100;
    this.LIMITS = [
      { value: 10 },
      { value: 50 },
      { value: 100 },
      { value: 500 },
      { value: 1000 },
    ];

    this.formRandom = this.formBuilder.group({
      name: new FormControl('', [Validators.required]),
      count: new FormControl('', [Validators.required]),
    });
  }

  ngOnInit(): void {
    console.log('[ngOnInit] customer ', this.customerList);
  }

  onSubmitRandom() {
    console.log('[onSubmitRandom] ', this.formRandom.value.name);

    let tmpCustomer: any[] =
      this.customerList == undefined ? [] : this.customerList;
    for (let i = 0; i < this.formRandom.value.count; i++) {
      tmpCustomer.push({
        name: this.formRandom.value.name,
      });
    }

    this.customerList = [...tmpCustomer];
    this.tempcustomerList = this.customerList;
    console.log('[onSubmitRandom] customerList ', this.customerList);
    this.formRandom.reset();
  }

  async onRandom() {
    console.log('[onRandom]', this.customerList);

    const result = this.randomUniqueNum(
      parseInt(this.numRandom),
      parseInt(this.numRandom)
    );
    console.log('[onRandom] result=> ', result);

    const temRandom: any = await this.customerList;
    for (let i = 0; i < temRandom.length; i++) {
      if (result[i].toString().length == 1) {
        temRandom[i].random_number = '0'.concat('0').concat(result[i].toString());
      } else if (result[i].toString().length == 2) {
        temRandom[i].random_number = '0'.concat(result[i].toString());
      } else {
        temRandom[i].random_number = result[i].toString();
      }
    }

    this.customerList = [...temRandom];
    this.tempcustomerList = this.customerList;

    console.log('[onSubmitRandom] customerList ', this.customerList);
  }

  randomUniqueNum(range: any, outputCount: any) {
    let arr = [];
    for (let i = 0; i < range; i++) {
      arr.push(i);
    }

    let result = [];
    for (let i = 1; i <= outputCount; i++) {
      const random = Math.floor(Math.random() * (range - i));

      result.push(arr[random]);
      arr[random] = arr[range - i];
    }

    return result;
  }

  limitEmp(value: any) {
    console.log('change limit: ', value);
    this.rowLimit = value;
  }

  async filterName(ev: any) {
    console.log(this.tempcustomerList);
    console.log(ev);
    const val = ev.target.value.toLowerCase();

    const temp = this.tempcustomerList.filter((item: any) => {
      return item?.name?.toLowerCase().indexOf(val) !== -1;
    });

    console.log(temp);

    this.customerList = [...temp];
  }

  exportToExcel() {
    if (
      this.customerList.length == 0 &&
      this.customerList[0]?.random_number == undefined &&
      this.customerList[0]?.name == undefined
    ) {
      console.log("[exportToExcel] undefined");
    }else {
    const dataWS = XLSX.utils.json_to_sheet(this.customerList);
    const wb = XLSX.utils.book_new();
    const filename = "random_number";
    XLSX.utils.book_append_sheet(wb, dataWS);
    XLSX.writeFile(wb, `${filename}.xlsx`);
    }
  }

  onReset(){
    this.customerList = [];
  }
}
