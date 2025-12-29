import { Component, OnInit, runInInjectionContext } from '@angular/core';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models/user.model';
declare var $:any;

@Component({
  selector: 'app-index-user',
  standalone: false,
  templateUrl: './index-user.html',
  styleUrl: './index-user.scss',
})
export class IndexUser implements OnInit {

  load_data: boolean = true;
  load_estado: boolean = true;
  filtro_user : string = '';
  page : number = 1;
  pageSize : number = 10;
  usuarios : User[] = [];
  usuarios_const : User[] = [];

  constructor(
    private usuarioService:UserService
  ){}

  ngOnInit(): void {
    this.init_usuarios();
  }

  init_usuarios(){
    this.load_data = true;
    this.usuarioService.getAlluser().subscribe(
      response=>{
        this.usuarios = response.data;
        this.usuarios_const = this.usuarios;
        this.load_data = false;
      }
    )
  }

  filtrar(){
    if (!this.filtro_user) {
      this.usuarios = [...this.usuarios_const]; 
      return;
    }

    var term = new RegExp(this.filtro_user, 'i');
    this.usuarios = this.usuarios_const.filter(item => term.test(item.nombre));
  }

  set_state(id:any){
      this.load_estado = true;
      this.usuarioService.deleteUser(id).subscribe(
        response=>{
          this.load_estado = false;
          $('#desactivar-'+id).modal('hide');
          this.init_usuarios();
        }
      );
    }
}
