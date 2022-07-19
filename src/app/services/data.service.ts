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
}
