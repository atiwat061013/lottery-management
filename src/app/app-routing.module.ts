import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MenuComponent } from './menu/menu.component';
import { BillsComponent } from './pages/bills/bills.component';
import { ContectComponent } from './pages/contect/contect.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { LotteryDataComponent } from './pages/lottery-data/lottery-data.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: '',
    component: MenuComponent,
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent
      },
      {
        path: 'bills',
        component: BillsComponent
      },
      {
        path: 'lotterydata',
        component: LotteryDataComponent
      },
      {
        path: 'contect',
        component: ContectComponent
      },
    ],
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
