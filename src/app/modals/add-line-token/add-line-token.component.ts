import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { equalTo, getDatabase, onValue, orderByChild, query, ref, set } from 'firebase/database';

@Component({
  selector: 'app-add-line-token',
  templateUrl: './add-line-token.component.html',
  styleUrls: ['./add-line-token.component.scss']
})
export class AddLineTokenComponent implements OnInit {

  db = getDatabase();

  formModalLineToken: FormGroup | any;

  uid: any;
  userData: any = [];

  validation_messages = {
    token: [{ type: 'required', message: 'Name is required.' }]
  };


  constructor(
    private formBuilder: FormBuilder,
    public activeModal: NgbActiveModal) {
      this.uid = localStorage.getItem("uid");
      this.fetchUsers();

      this.formModalLineToken = this.formBuilder.group({
        token: new FormControl('', [Validators.required]),
      });
    }

  ngOnInit(): void {
    
  }

  onSubmitModalLineToken() {
    set(ref(this.db, 'users/' + this.uid), {
      id: this.uid,
      line_token: this.formModalLineToken.value.token,
      create_at: Date.now()
    }).then(() => {
      // Data saved successfully!
      console.log('Data saved successfully!');

    }).catch((error) => {
      // The write failed...
      console.log('error', error);
    });
  }

  fetchUsers() {
    console.log("[fetchUsers] uid => ", this.uid);
    const starCountRef = ref(this.db, 'users/' + this.uid);
    onValue(starCountRef, async (snapshot) => {
      const data = await snapshot.val();
      console.log("data", data);

      let tmpUser: any = [];
      if (data != undefined) {
        tmpUser = data
      }

      this.userData = tmpUser;

      console.log("[fetchInstallmentList] data", this.userData);
      console.log("[fetchInstallmentList]", this.userData);


      this.formModalLineToken.controls['token'].setValue(this.userData.line_token);
    });
  }

}
