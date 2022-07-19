import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MenuComponent } from './menu/menu.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { LotteryDataComponent } from './pages/lottery-data/lottery-data.component';
import { ContectComponent } from './pages/contect/contect.component';

//firebase
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { environment } from 'src/environments/environment';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BillsComponent } from './pages/bills/bills.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

const app = initializeApp(environment.firebaseConfig);
// const app = initializeApp({
//   apiKey: "AIzaSyBjbzRq8GRGs6GCIvoaXKMbVm1Z3IO7Nzk",
//   authDomain: "lottery-management-aa429.firebaseapp.com",
//   databaseURL: "https://lottery-management-aa429-default-rtdb.asia-southeast1.firebasedatabase.app",
//   projectId: "lottery-management-aa429",
//   storageBucket: "lottery-management-aa429.appspot.com",
//   messagingSenderId: "971943506776",
//   appId: "1:971943506776:web:5b49f8e061d1036d636b2d",
//   measurementId: "G-ZWQPJ4W9HN"
// });
const analytics = getAnalytics(app);

@NgModule({
  declarations: [
    AppComponent,
    MenuComponent,
    DashboardComponent,
    LotteryDataComponent,
    ContectComponent,
    BillsComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    NgxDatatableModule,
    ReactiveFormsModule,
    BrowserAnimationsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
