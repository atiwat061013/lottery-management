import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent implements OnInit {
  @Input() public text: any;

  constructor(
    public activeModal: NgbActiveModal
  ) { }

  ngOnInit(): void {
    console.log("[ConfirmDialogComponent]");
    console.log("[ngOnInit] text=> ", this.text);
    
  }

  onConfirm() {
    console.log("[ConfirmDialogComponent] [onConfirm]");
    this.activeModal.close("confirm");
  }

  onCancel() {
    console.log("[ConfirmDialogComponent] [onCancel]");
    this.activeModal.close("cancel");
  }

}
