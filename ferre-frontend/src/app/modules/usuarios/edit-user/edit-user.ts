import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { RolService } from '../../../core/services/rol.service';
import { EmpresaService } from '../../../core/services/empresa.service';
import { Rol } from '../../../core/models/rol.model';
import { Empresa } from '../../../core/models/empresa.model';
declare var $:any;

@Component({
  selector: 'app-edit-user',
  standalone: false,
  templateUrl: './edit-user.html',
  styleUrl: './edit-user.scss',
})
export class EditUser implements OnInit {

    roles: Rol[] = [];
    empresas: Empresa[] = [];
    public usuario: any = {
      nombre: '',
      correo: '',
      contrasena: '',
      empresa_id: '',
      rol_id: ''
    };
    showPassword: boolean = false;
    public load_user: boolean = true;
    public btn_guardar: boolean = true;
    private id: number = 0;

    constructor(
      private router:Router,
      private route: ActivatedRoute,
      private usuarioService:UserService,
      private rolService:RolService,
      private empresaService:EmpresaService
    ){}

    ngOnInit(): void {
      this.id = Number(this.route.snapshot.paramMap.get('id'));
      this.init_roles();
      this.init_empresas();
      this.init_usuario();
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

     init_usuario() {
    this.usuarioService.getById(this.id).subscribe(
      (response: any) => {
        this.usuario = response.data;
        // No queremos mostrar el hash en el input de contraseña
        this.usuario.contrasena = '';

        this.load_user = false;
      },
      (error) => {
        console.error(error);
        $.notify('No se pudo cargar la información del usuario', {
          type: 'danger',
          spacing: 10,
          timer: 2000,
          placement: { from: 'top', align: 'right' },
          delay: 1000,
          animate: {
            enter: 'animated bounce',
            exit: 'animated bounce'
          }
        });
        this.router.navigate(['/config/usuarios']);
      }
    );
  }

  save_user() {
    if (!this.usuario.nombre) {
      $.notify('Ingrese el nombre del usuario', {
        type: 'danger',
        spacing: 10,
        timer: 2000,
        placement: { from: 'top', align: 'right' },
        delay: 1000,
        animate: { enter: 'animated bounce', exit: 'animated bounce' }
      });
      return;
    } else if (!this.usuario.correo) {
      $.notify('Ingrese el email del usuario', {
        type: 'danger',
        spacing: 10,
        timer: 2000,
        placement: { from: 'top', align: 'right' },
        delay: 1000,
        animate: { enter: 'animated bounce', exit: 'animated bounce' }
      });
      return;
    } else if (!this.usuario.empresa_id) {
      $.notify('Seleccione la empresa a donde pertenece el usuario', {
        type: 'danger',
        spacing: 10,
        timer: 2000,
        placement: { from: 'top', align: 'right' },
        delay: 1000,
        animate: { enter: 'animated bounce', exit: 'animated bounce' }
      });
      return;
    }

    this.btn_guardar = true;

    // Armamos payload solo con lo editable
    const payload: any = {
      nombre: this.usuario.nombre,
      correo: this.usuario.correo,
      empresa_id: this.usuario.empresa_id,
      // rol_id no se toca (lo maneja el backend y no lo estamos cambiando)
    };

    // Si digitó una nueva contraseña, la mandamos; si no, no
    if (this.usuario.contrasena && this.usuario.contrasena.trim() !== '') {
      payload.contrasena = this.usuario.contrasena;
    }

    this.usuarioService.updateUser(this.id, payload).subscribe(
      (response: any) => {
        $.notify(response.message || 'Usuario actualizado exitosamente', {
          type: 'success',
          spacing: 10,
          timer: 2000,
          placement: { from: 'top', align: 'right' },
          delay: 1000,
          animate: { enter: 'animated bounce', exit: 'animated bounce' }
        });

        this.btn_guardar = false;
        this.router.navigate(['/config/usuarios']);
      },
      (error) => {
        console.error('Error al actualizar usuario', error);
        $.notify(error?.error?.message || 'Error al actualizar usuario', {
          type: 'danger',
          spacing: 10,
          timer: 2000,
          placement: { from: 'top', align: 'right' },
          delay: 1000,
          animate: { enter: 'animated bounce', exit: 'animated bounce' }
        });
        this.btn_guardar = false;
      }
    );
  }
}
