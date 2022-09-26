import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MenuComponent } from './menu/menu.component';
import { BillsComponent } from './pages/bills/bills.component';
import { ContectComponent } from './pages/contect/contect.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { LoginComponent } from './pages/login/login.component';
import { LotteryDataComponent } from './pages/lottery-data/lottery-data.component';
import { RandomNumberComponent } from './pages/random-number/random-number.component';
import { AuthGuardService as AuthGuard } from './services/auth-guard.service';

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
        component: DashboardComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'bills',
        component: BillsComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'lotterydata',
        component: LotteryDataComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'contect',
        component: ContectComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'reandomNumber',
        component: RandomNumberComponent
      },
    ],
  },
  {
    path: "login",
    component: LoginComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
