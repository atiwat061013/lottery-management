import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddLineTokenComponent } from '../modals/add-line-token/add-line-token.component';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {
  namePage: any;
  sidebar: boolean = true;
  menuList = [
    {
      title: 'ภาพรวม',
      url: 'dashboard',
      icon: 'swap',
      child: [],
    },
    {
      title: 'รวมบิล',
      url: 'bills',
      icon: 'swap',
      child: [],
    },
    {
      title: 'รายละเอียดการขาย',
      url: 'lotterydata',
      icon: 'swap',
      child: [],
    },
    {
      title: 'รายชื่อลูกค้า',
      url: 'contect',
      icon: 'swap',
      child: [],
    },
    {
      title: 'สุ่มเลข',
      url: 'reandomNumber',
      icon: 'swap',
      child: [],
    },
  ];

  constructor(
    private router: Router,
    public modalService: NgbModal
    ) {
    console.log(this.router.url);
  }

  ngOnInit(): void {
    let path = this.router.url.split('/')[1];
    console.log(path);
    if (path == 'lotterydata') {
      this.namePage = 'รายละเอียดการขาย';
    }else if(path == 'dashboard'){
      this.namePage = 'Dashboard';
    }else if(path == 'contect'){
      this.namePage = 'รายชื่อลูกค้า';
    }else if(path == 'bills'){
      this.namePage = 'รวมบิล';
    }else if(path == 'reandomNumber'){
      this.namePage = 'สุ่มเลข';
    }
  }

  chahgeTitleName(path: string){
    let pathName = path.toLocaleLowerCase()
    if (pathName == 'รายละเอียดการขาย') {
      this.namePage = 'รายละเอียดการขาย';
    }else if(pathName == 'ภาพรวม'){
      this.namePage = 'ภาพรวม';
    }else if(pathName == 'รายชื่อลูกค้า'){
      this.namePage = 'รายชื่อลูกค้า';
    }else if(pathName == 'รวมบิล'){
      this.namePage = 'รวมบิล';
    }else if(pathName == 'reandomNumber'){
      this.namePage = 'สุ่มเลข';
    }
  }

  toggleMenu() {
    this.sidebar = !this.sidebar;
  }

  signout() {
    console.log("[signout]");
    window.localStorage.clear();
    this.router.navigateByUrl('login');
  }

  addLineToken() {
    console.log("[addLineToken]");
    const modalRef = this.modalService.open(AddLineTokenComponent ,{ centered: true });
    // modalRef.componentInstance.installmentList = this.installmentList[this.installmentSelectIndex];
  }

}
