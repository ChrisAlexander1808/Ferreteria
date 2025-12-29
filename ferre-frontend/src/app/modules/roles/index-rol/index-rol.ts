import { Component, OnInit } from '@angular/core';
import { Rol } from '../../../core/models/rol.model';
import { RolService } from '../../../core/services/rol.service';
declare var $:any;

@Component({
  selector: 'app-index-rol',
  standalone: false,
  templateUrl: './index-rol.html',
  styleUrl: './index-rol.scss',
})
export class IndexRol implements OnInit {

    load_data: boolean = true;
    filtro_rol : string = '';
    page : number = 1;
    pageSize : number = 10;
    roles : Rol[] = [];
    roles_const : Rol[] = [];
    public permisosRol:Array<any>=[];
    public rolSeleccionado : String | null = null;

    constructor(
      private rolService:RolService
    ){}

    ngOnInit(): void {
      this.init_roles();
    }

    init_roles(){
      this.load_data = true;
      this.rolService.getAllRoles().subscribe(
        response=>{
          this.roles = response.data;
          this.roles_const = this.roles;
          this.load_data = false;
        }
      )
    }

    filtrar(){
        // Si el campo de búsqueda está vacío, restauramos todos los módulos
        if (!this.filtro_rol) {
          this.roles = [...this.roles_const]; // Restablece la lista completa
          return;
        }

        // Si hay texto, aplicamos el filtro con expresión regular
        var term = new RegExp(this.filtro_rol, 'i');
        this.roles = this.roles_const.filter(item => term.test(item.nombre));
    }

    imprimir_rol(id_rol:number){
      this.rolService.getPermissionsByRoleId(id_rol).subscribe(
        response=>{
          this.permisosRol = response.data
           if (this.permisosRol.length > 0) {
            this.rolSeleccionado = this.permisosRol[0].Rol.nombre; // Guarda el nombre del rol
          } else {
            this.rolSeleccionado = 'Sin permisos';
          }
        }
      )
    }
}
