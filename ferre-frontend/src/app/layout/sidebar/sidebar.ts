import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from '../../core/services/storage.service';

@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar implements OnInit {

    modulos: string[] = [];

   constructor(
    private storage: StorageService, 
    private router: Router
    ){}

   ngOnInit(): void {
     const u = this.storage.getUser();
     this.modulos = u?.modulos || [];
   }

   go(path: string) {
    this.router.navigate([path]);
  }

  
}
