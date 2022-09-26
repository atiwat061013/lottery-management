import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService {

  constructor(
    public router: Router,
  ) { }

  public canActivate(): boolean {
    let token:string = localStorage.getItem("uid")||'';
    try {
        if(!token) {
            this.router.navigate(["login"]);
            return false;
        }
      return true;
    } catch (err) {
      console.log(err);
      this.router.navigate(["login"]);
      return false;
    }
  }

}
