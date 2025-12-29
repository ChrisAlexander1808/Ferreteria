import { Component, OnInit } from '@angular/core';
declare var KTLayoutAside : any;

@Component({
  selector: 'app-top',
  standalone: false,
  templateUrl: './top.html',
  styleUrl: './top.scss',
})
export class Top implements OnInit {

    public user:any={};

    constructor(){
      let str_usr : any = localStorage.getItem('auth_user');
      this.user = JSON.parse(str_usr);
    }

    ngOnInit(): void {
      setTimeout(() => {
      KTLayoutAside.init('kt_aside');
    }, 50);
    }

    logout(){
       localStorage.clear();
       window.location.reload();
    }

    getInitials(nombre: string): string {
      const parts = nombre.split(' ');
      const initials = parts.map(part => part.charAt(0).toUpperCase()).join('');
      return initials;
    }
}
