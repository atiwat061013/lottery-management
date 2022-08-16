import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { getDatabase, ref, set } from 'firebase/database';
import * as md5 from 'md5';

@Component({
  selector: 'app-add-installment',
  templateUrl: './add-installment.component.html',
  styleUrls: ['./add-installment.component.scss']
})
export class AddInstallmentComponent implements OnInit {
  //Firebase
  db = getDatabase();
  formModalInstallment: FormGroup | any;

  validation_messages = {
    installment_date: [{ type: 'required', message: 'Name is required.' }],
    customer: [{ type: 'required', message: 'Name is required.' }],
    installment: [{ type: 'required', message: 'Name is required.' }],
  };

  constructor(private formBuilder: FormBuilder, public activeModal: NgbActiveModal) {
    this.formModalInstallment = this.formBuilder.group({
      installment_date: new FormControl('', [Validators.required]),
    });
  }

  ngOnInit(): void {
  }

  onSubmitModalInstallment() {
    console.log("onSubmitModalInstallment formModalInstallment", this.formModalInstallment.value);
    const uuid = md5(this.formModalInstallment.value.installment_date);
    set(ref(this.db, 'installment/' + uuid), {
      id: uuid,
      installment_date: this.formModalInstallment.value.installment_date,
      create_at: Date.now()
    }).then(() => {
      // Data saved successfully!
      console.log('Data saved successfully!',);
      // this.fetchInstallmentList();
      this.activeModal.close('success');
    }).catch((error) => {
      // The write failed...
      console.log('error', error);
    });
  }

}
