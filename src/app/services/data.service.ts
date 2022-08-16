import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private router: Router) {}

  async fetchData(method: any, url: any, data: any) {
    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    // myHeaders.append('Access-Control-Allow-Origin', '*');
    // myHeaders.append('Access-Control-Allow-Methods', 'POST');
    // myHeaders.append('Access-Control-Allow-Headers', 'Content-Type');

    let requestOptions: any = {
      method: method,
      headers: myHeaders,
      body: data,
      redirect: 'follow',
    };

    return fetch(url, requestOptions).then((response) => response.json());
  }

  async sendLineNotify() {
    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/x-www-form-urlencoded');
    myHeaders.append('bearer', 'HdqFyJFYYDQWQHf9DZwDTtxlRn2FrHAy4KK3Kv170iI');
    myHeaders.append('Access-Control-Allow-Origin', '*');
    myHeaders.append('Access-Control-Allow-Methods', 'POST');
    myHeaders.append('Access-Control-Allow-Headers', 'Content-Type');

    let requestOptions: any = {
      method: 'POST',
      headers: myHeaders,
      form: {
        message: 'ทดสอบ', //ข้อความที่จะส่ง
      },
      redirect: 'follow',
    };

    return fetch('https://notify-api.line.me/api/notify', requestOptions).then((response) => response.json());
  }

}
