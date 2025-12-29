import { Component, OnInit, ChangeDetectorRef, importProvidersFrom } from '@angular/core';
import { Router } from '@angular/router';
import { RolService } from '../../../core/services/rol.service';
import { PermisoService } from '../../../core/services/permiso.service';
import { ModuloService } from '../../../core/services/modulo.service';
import { Rol } from '../../../core/models/rol.model';
import { PermisoSeleccionado } from '../../../core/models/permiso-seleccionado.model';
import { forkJoin } from 'rxjs';
declare var $:any;

@Component({
  selector: 'app-create-rol',
  standalone: false,
  templateUrl: './create-rol.html',
  styleUrl: './create-rol.scss',
})
export class CreateRol implements OnInit {

   load_rol: boolean = true;
   modulos: any[] = [];
   permisos: any[] = [];
   public roles: any = {
      nombre:'',
      descripcion:'',
      permisosSeleccionados: [] as PermisoSeleccionado[]
    };

    constructor(
      private rolService:RolService,
      private moduloService:ModuloService,
      private permisoService:PermisoService,
      private cdr: ChangeDetectorRef,
      private router: Router
    ){}

    ngOnInit(): void {
      this.init_modulos();
      this.init_permisos();
    }

    init_modulos(){
      this.moduloService.getAllModulos().subscribe(
        response=>{
          this.modulos = response.data;
          this.cdr.detectChanges();
        }
      )
    }
    
    init_permisos(){
      this.permisoService.getAllPermisos().subscribe(
        response=>{
          this.permisos = response.data;
          this.cdr.detectChanges();
        }
      )
    }

    getPermisosByModulo(moduloId: number): any[]{
      return this.permisos.filter(p => p.modulo_id === moduloId);
    }

    onPermissionChange(event: Event, moduloId: number, permisoId: number) {
    const isChecked = (event.target as HTMLInputElement).checked;
  
    if (isChecked) {
      this.roles.permisosSeleccionados.push({ moduloId, permisoId });
    } else {
      const index = this.roles.permisosSeleccionados.findIndex(
        (p: PermisoSeleccionado) => p.moduloId === moduloId && p.permisoId === permisoId
      );
      if (index !== -1) {
        this.roles.permisosSeleccionados.splice(index, 1);
      }
    }
  }

  isPermissionSelected(moduloId: number, permisoId: number): boolean {
    return this.roles.permisosSeleccionados.some(
      (p: PermisoSeleccionado) => p.moduloId === moduloId && p.permisoId === permisoId
    );
  }

  save() {
    if (!this.roles.nombre) {
      $.notify('Ingrese el nombre del rol', {
        type: 'danger',
        spacing: 10,
        timer: 2000,
        placement: {
          from: 'top',
          align: 'right'
        },
        delay: 1000,
        animate: {
          enter: 'animated bounce',
          exit: 'animated bounce'
        }
      });
      return;
    } else if (!this.roles.descripcion) {
      $.notify('Ingrese una descripción del rol', {
        type: 'danger',
        spacing: 10,
        timer: 2000,
        placement: {
          from: 'top',
          align: 'right'
        },
        delay: 1000,
        animate: {
          enter: 'animated bounce',
          exit: 'animated bounce'
        }
      });
      return;
    } else if (this.roles.permisosSeleccionados.length === 0) {
      $.notify('Seleccione al menos un permiso', {
        type: 'danger',
        spacing: 10,
        timer: 2000,
        placement: {
          from: 'top',
          align: 'right'
        },
        delay: 1000,
        animate: {
          enter: 'animated bounce',
          exit: 'animated bounce'
        }
      });
      return;
    } else {
      this.load_rol = true;
      this.rolService.createRol(this.roles).subscribe(
        response => {
          console.log('Respuesta createRol:', response);
          if (response && response.data && response.data.id) {
            const rolId = response.data.id;
  
            const permisosRequests = this.roles.permisosSeleccionados.map((p: { permisoId: number }) => {
              return this.rolService.createRolpermiso({ rol_id: rolId, permiso_id: p.permisoId });
            });
  
            if (permisosRequests.length > 0) {
              forkJoin(permisosRequests).subscribe(
                () => {
                  $.notify('Se registró el nuevo rol con permisos asignados', {
                    type: 'success',
                    spacing: 10,
                    timer: 2000,
                    placement: { from: 'top', align: 'right' },
                    delay: 1000
                  });
                  this.router.navigate(['/config/roles']);
                  this.load_rol = false;
                },
                error => {
                  console.error('Error al asignar permisos', error);
                  $.notify('Error al asignar permisos', {
                    type: 'danger',
                    spacing: 10,
                    timer: 2000,
                    placement: { from: 'top', align: 'right' },
                    delay: 1000
                  });
                  this.load_rol = false;
                }
              );
            } else {
              this.load_rol = false;
              this.router.navigate(['/config/roles']);
            }
          }
        },
        error => {
          console.error('Error al crear el rol', error);
          $.notify('Error al crear el rol', {
            type: 'danger',
            spacing: 10,
            timer: 2000,
            placement: { from: 'top', align: 'right' },
            delay: 1000
          });
          this.load_rol = false;
        }
      );
    }
  }
}
