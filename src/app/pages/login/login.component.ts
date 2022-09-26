import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
// firebase
import { getDatabase, ref, child, get, set } from 'firebase/database';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  auth = getAuth();
  db = getDatabase();

  formLogin: FormGroup | any;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
  ) {
    this.formLogin = this.formBuilder.group({
      email: new FormControl('', [Validators.required, Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,3}$')]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)])
    });
  }

  ngOnInit() {

  }

  login() {
    console.log("[login]", this.formLogin.value);
    signInWithEmailAndPassword(
      this.auth,
      this.formLogin?.value?.email,
      this.formLogin?.value?.password
    )
      .then(async (userCredential: any) => {
        // Signed in
        const user = await userCredential.user;
        console.log('user', user);
        localStorage.setItem("uid", user.uid)
        this.router.navigateByUrl('/dashboard');
        // ...
      })
      .catch(async (error) => {
        const errorCode = await error.code;
        const errorMessage = error.message;
        console.log(
          '[catch] signInWithEmailAndPassword',
          'errorCode => ' + errorCode + ' errorMessage => ' + errorMessage
        );
        // ..
      });
  }

}
