import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { EmpresaService } from '../../../core/services/empresa.service';
import { RolService } from '../../../core/services/rol.service';
import { Empresa } from '../../../core/models/empresa.model';
import { Rol } from '../../../core/models/rol.model';
declare var $:any;

@Component({
  selector: 'app-create-user',
  standalone: false,
  templateUrl: './create-user.html',
  styleUrl: './create-user.scss',
})
export class CreateUser implements OnInit {

    btn_registrar: boolean = true;
    showPassword: boolean = false;
    roles: Rol[] = [];
    empresas: Empresa[] = [];
    public usuario : any = {
      rol_id: '',
      empresa_id:''
    }

    constructor(
      private userService:UserService,
      private empresaService:EmpresaService,
      private rolService:RolService,
      private router:Router
    ){}

    ngOnInit(): void {
      this.init_roles();
      this.init_empresas();
    }

    init_roles(){
      this.rolService.getAllRoles().subscribe(
        response=>{
          this.roles = response.data;
        }
      )
    }

    init_empresas(){
      this.empresaService.getAllEmpresas().subscribe(
        response=>{
          this.empresas = response.data.filter((e:any)=> e.estado === true );
        }
      )
    }

    togglePasswordVisibility(){
      this.showPassword = !this.showPassword;
    }

    save_user(){
      if (!this.usuario.nombre) {
        $.notify('Ingrese el nombre del usuario', { 
          type: 'danger',
          spacing: 10,                    
          timer: 2000,
          placement: {
              from: 'top', 
              align: 'right'
          },
          delay: 1000,
          animate: {
              enter: 'animated ' + 'bounce',
              exit: 'animated ' + 'bounce'
          }
        });
      }else if(!this.usuario.correo){
        $.notify('Ingrese el email del usuario', { 
          type: 'danger',
          spacing: 10,                    
          timer: 2000,
          placement: {
              from: 'top', 
              align: 'right'
          },
          delay: 1000,
          animate: {
              enter: 'animated ' + 'bounce',
              exit: 'animated ' + 'bounce'
          }
        });
      }else if(!this.usuario.contrasena){
        $.notify('Ingrese el password del usuario', { 
          type: 'danger',
          spacing: 10,                    
          timer: 2000,
          placement: {
              from: 'top', 
              align: 'right'
          },
          delay: 1000,
          animate: {
              enter: 'animated ' + 'bounce',
              exit: 'animated ' + 'bounce'
          }
        });
      }else if(!this.usuario.rol_id){
        $.notify('Seleccione el Rol que le asignara al usuario', { 
          type: 'danger',
          spacing: 10,                    
          timer: 2000,
          placement: {
              from: 'top', 
              align: 'right'
          },
          delay: 1000,
          animate: {
              enter: 'animated ' + 'bounce',
              exit: 'animated ' + 'bounce'
          }
        });
      }else if(!this.usuario.empresa_id){
        $.notify('Seleccione la empresa a donde pertenece el usuario', { 
          type: 'danger',
          spacing: 10,                    
          timer: 2000,
          placement: {
              from: 'top', 
              align: 'right'
          },
          delay: 1000,
          animate: {
              enter: 'animated ' + 'bounce',
              exit: 'animated ' + 'bounce'
          }
        });
      }else{        
        this.usuario.rol_id = Number(this.usuario.rol_id);
        this.usuario.empresa_id = Number(this.usuario.empresa_id);
        this.userService.createUser(this.usuario).subscribe({
          next: (response) => {
            // Backend: { message: 'Usuario creado exitosamente', data: nuevoUsuario }
            $.notify(response.message || 'Se registró el nuevo usuario', {
              type: 'success',
              spacing: 10,
              timer: 2000,
              placement: { from: 'top', align: 'right' },
              delay: 1000,
              animate: {
                enter: 'animated ' + 'bounce',
                exit: 'animated ' + 'bounce'
              }
            });

            this.btn_registrar = false;
            this.router.navigate(['/config/usuarios']);
          },
          error: (err) => {
            console.error('Error al crear usuario', err);

            const msg = err?.error?.message || 'Error al crear usuario';

            $.notify(msg, {
              type: 'danger',
              spacing: 10,
              timer: 2000,
              placement: { from: 'top', align: 'right' },
              delay: 1000,
              animate: {
                enter: 'animated ' + 'bounce',
                exit: 'animated ' + 'bounce'
              }
            });

            this.btn_registrar = false;
          }
         }
        )
      }
    }
}
