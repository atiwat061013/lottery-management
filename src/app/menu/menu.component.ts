import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

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
      title: 'Dashboard',
      url: 'dashboard',
      icon: 'swap',
      child: [],
    },
    {
      title: 'Bills',
      url: 'bills',
      icon: 'swap',
      child: [],
    },
    {
      title: 'LotteryData',
      url: 'lotterydata',
      icon: 'swap',
      child: [],
    },
    {
      title: 'Contect',
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

  constructor(private router: Router) {
    console.log(this.router.url);
  }

  ngOnInit(): void {
    let path = this.router.url.split('/')[1];
    console.log(path);
    if (path == 'lotterydata') {
      this.namePage = 'LotteryData';
    }else if(path == 'dashboard'){
      this.namePage = 'Dashboard';
    }else if(path == 'contect'){
      this.namePage = 'Contect';
    }else if(path == 'bills'){
      this.namePage = 'Bills';
    }else if(path == 'reandomNumber'){
      this.namePage = 'สุ่มเลข';
    }
  }

  chahgeTitleName(path: string){
    let pathName = path.toLocaleLowerCase()
    if (pathName == 'lotterydata') {
      this.namePage = 'LotteryData';
    }else if(pathName == 'dashboard'){
      this.namePage = 'Dashboard';
    }else if(pathName == 'contect'){
      this.namePage = 'Contect';
    }else if(pathName == 'bills'){
      this.namePage = 'Bills';
    }else if(pathName == 'reandomNumber'){
      this.namePage = 'สุ่มเลข';
    }
  }

  toggleMenu() {
    this.sidebar = !this.sidebar;
  }

  signout() {
    // this.dataService.forceLogout();
  }

}
