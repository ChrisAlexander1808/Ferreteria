import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { RolService } from '../../../core/services/rol.service';
import { PermisoService } from '../../../core/services/permiso.service';
import { ModuloService } from '../../../core/services/modulo.service';
import { PermisoSeleccionado } from '../../../core/models/permiso-seleccionado.model';
import { forkJoin } from 'rxjs';
declare var $: any;

@Component({
  selector: 'app-edit-rol',
  standalone: false,
  templateUrl: './edit-rol.html',
  styleUrl: './edit-rol.scss',
})
export class EditRol implements OnInit {

      rolId!: number;

      load_rol: boolean = true;
      modulos: any[] = [];
      permisos: any[] = [];

      // mismo shape que en CreateRol
      public rol: any = {
        nombre: '',
        descripcion: '',
        permisosSeleccionados: [] as PermisoSeleccionado[],
      };

    constructor(
      private rolService: RolService,
      private moduloService: ModuloService,
      private permisoService: PermisoService,
      private cdr: ChangeDetectorRef,
      private router: Router,
      private route: ActivatedRoute
    ){}

    ngOnInit(): void {
      this.rolId = Number(this.route.snapshot.paramMap.get('id'));
    if (!this.rolId) {
      $.notify('Rol inválido', {
        type: 'danger',
        spacing: 10,
        timer: 2000,
        placement: { from: 'top', align: 'right' },
        delay: 1000,
      });
      this.router.navigate(['/config/roles']);
      return;
    }

    this.cargarDataInicial();
    }

    cargarDataInicial() {
    this.load_rol = true;

    forkJoin({
      modulos: this.moduloService.getAllModulos(),
      permisos: this.permisoService.getAllPermisos(),
      rol: this.rolService.getByIdRol(this.rolId),             // <- nuevo endpoint
      permisosRol: this.rolService.getPermissionsByRoleId(this.rolId) // <- ya lo usas en index para imprimir permisos
    }).subscribe({
      next: (result: any) => {
        this.modulos = result.modulos.data || [];
        this.permisos = result.permisos.data || [];

        const rolData = result.rol.data;
        this.rol.nombre = rolData.nombre;
        this.rol.descripcion = rolData.descripcion;

        const permisosRol = result.permisosRol.data || [];

        // Construimos permisosSeleccionados a partir de RolPermiso + Permiso
        this.rol.permisosSeleccionados = permisosRol.map((rp: any) => ({
          moduloId: rp.Permiso.modulo_id, // el módulo al que pertenece el permiso
          permisoId: rp.Permiso.id,       // id del permiso
        }));

        this.load_rol = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar datos del rol', err);
        $.notify('Error al cargar datos del rol', {
          type: 'danger',
          spacing: 10,
          timer: 2000,
          placement: { from: 'top', align: 'right' },
          delay: 1000,
        });
        this.load_rol = false;
        this.router.navigate(['/config/roles']);
      },
    });
  }

  getPermisosByModulo(moduloId: number): any[] {
    return this.permisos.filter((p) => p.modulo_id === moduloId);
  }

  onPermissionChange(event: Event, moduloId: number, permisoId: number) {
    const isChecked = (event.target as HTMLInputElement).checked;

    if (isChecked) {
      this.rol.permisosSeleccionados.push({ moduloId, permisoId });
    } else {
      const index = this.rol.permisosSeleccionados.findIndex(
        (p: PermisoSeleccionado) =>
          p.moduloId === moduloId && p.permisoId === permisoId
      );
      if (index !== -1) {
        this.rol.permisosSeleccionados.splice(index, 1);
      }
    }
  }

  isPermissionSelected(moduloId: number, permisoId: number): boolean {
    return this.rol.permisosSeleccionados.some(
      (p: PermisoSeleccionado) =>
        p.moduloId === moduloId && p.permisoId === permisoId
    );
  }

  save() {
    if (!this.rol.nombre) {
      $.notify('Ingrese el nombre del rol', {
        type: 'danger',
        spacing: 10,
        timer: 2000,
        placement: { from: 'top', align: 'right' },
        delay: 1000,
      });
      return;
    }

    if (!this.rol.descripcion) {
      $.notify('Ingrese una descripción del rol', {
        type: 'danger',
        spacing: 10,
        timer: 2000,
        placement: { from: 'top', align: 'right' },
        delay: 1000,
      });
      return;
    }

    if (this.rol.permisosSeleccionados.length === 0) {
      $.notify('Seleccione al menos un permiso', {
        type: 'danger',
        spacing: 10,
        timer: 2000,
        placement: { from: 'top', align: 'right' },
        delay: 1000,
      });
      return;
    }

    this.load_rol = true;

    const payload = {
      nombre: this.rol.nombre,
      descripcion: this.rol.descripcion,
      permisosSeleccionados: this.rol.permisosSeleccionados,
    };

    this.rolService.updateRolWithPerms(this.rolId, payload).subscribe({
      next: (response) => {
        $.notify('Rol actualizado correctamente', {
          type: 'success',
          spacing: 10,
          timer: 2000,
          placement: { from: 'top', align: 'right' },
          delay: 1000,
        });
        this.load_rol = false;
        this.router.navigate(['/config/roles']);
      },
      error: (err) => {
        console.error('Error al actualizar el rol', err);
        $.notify(
          err?.error?.message || 'Error al actualizar el rol',
          {
            type: 'danger',
            spacing: 10,
            timer: 2000,
            placement: { from: 'top', align: 'right' },
            delay: 1000,
          }
        );
        this.load_rol = false;
      },
    });
  }

  cancelar() {
    this.router.navigate(['/config/roles']);
  }
}
