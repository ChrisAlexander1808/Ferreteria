import { Component, OnInit } from '@angular/core';
import { Proveedor } from '../../core/models/proveedor.model';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { ProveedorService } from '../../core/services/proveedor.service';
declare var $:any;

@Component({
  selector: 'app-proveedores',
  standalone: false,
  templateUrl: './proveedores.html',
  styleUrl: './proveedores.scss',
})
export class Proveedores implements OnInit{

    canRead = false;
    canCreate = false;
    canUpdate = false;
    canDelete = false;

    load_data: boolean = true;
    load_update: boolean = true;
    load_delete: boolean = true;
    load_proveedor: boolean = true;

    filtro_proveedor: string = '';
    page: number = 1;
    pageSize: number = 10;

    proveedores: Proveedor[] = [];
    proveedores_const: Proveedor[] = [];

    public createProveedor: any = {
      nombre: '',
      direccion: '',
      telefono: '',
      correo: '',
      nit: '',
    };

    public updateProveedor: any = {
      id: null,
      nombre: '',
      direccion: '',
      telefono: '',
      correo: '',
      nit: '',
    };
    constructor(
      private auth: AuthService,
      private router: Router,
      private proveedorService: ProveedorService
    ){}

    ngOnInit(): void {
        this.canRead = this.auth.hasPermission('PROVEEDOR_READ');
        this.canCreate = this.auth.hasPermission('PROVEEDOR_CREATE');
        this.canUpdate = this.auth.hasPermission('PROVEEDOR_UPDATE');
        this.canDelete = this.auth.hasPermission('PROVEEDOR_DELETE');

        if (!this.canRead) {
          this.router.navigate(['/dashboard']);
          return;
        }

        this.init_proveedores();
    }

  init_proveedores() {
    this.load_data = true;
    this.proveedorService.getAllProveedores().subscribe({
      next: (response) => {
        // backend: { data: [...] }
        this.proveedores = response.data || [];
        this.proveedores_const = [...this.proveedores];
        this.load_data = false;
      },
      error: (err) => {
        console.error('Error al obtener proveedores', err);
        this.load_data = false;
        $.notify('Error al obtener proveedores', {
          type: 'danger',
          spacing: 10,
          timer: 2000,
          placement: { from: 'top', align: 'right' },
          delay: 1000,
          animate: { enter: 'animated bounce', exit: 'animated bounce' },
        });
      },
    });
  }

  filtrar() {
    if (!this.filtro_proveedor) {
      this.proveedores = [...this.proveedores_const];
      return;
    }

    const term = this.filtro_proveedor.toLowerCase().trim();

    this.proveedores = this.proveedores_const.filter((item) => {
      const nombre = (item.nombre || '').toLowerCase();
      const nit = (item.nit || '').toLowerCase();
      return nombre.includes(term) || nit.includes(term);
    });
  }

  openCreateModal() {
    this.createProveedor = {
      nombre: '',
      direccion: '',
      telefono: '',
      correo: '',
      nit: '',
    };

    this.load_proveedor = true;
    $('#modalCreateProveedor').modal('show');
  }

  save_create_proveedor() {
    if (!this.canCreate) return;

    // Validaciones básicas
    if (!this.createProveedor.nombre) {
      $.notify('Ingrese el nombre del proveedor', {
        type: 'danger',
        spacing: 10,
        timer: 2000,
        placement: { from: 'top', align: 'right' },
        delay: 1000,
        animate: { enter: 'animated bounce', exit: 'animated bounce' },
      });
      return;
    }

    if (!this.createProveedor.nit) {
      $.notify('Ingrese el NIT del proveedor (use CF si no tiene)', {
        type: 'danger',
        spacing: 10,
        timer: 2000,
        placement: { from: 'top', align: 'right' },
        delay: 1000,
        animate: { enter: 'animated bounce', exit: 'animated bounce' },
      });
      return;
    }

    this.load_proveedor = false;

    this.proveedorService.createProveedor(this.createProveedor).subscribe({
      next: (response) => {
        if (!response || !response.data) {
          $.notify(response?.message || 'No se pudo crear el proveedor', {
            type: 'danger',
            spacing: 10,
            timer: 2000,
            placement: { from: 'top', align: 'right' },
            delay: 1000,
            animate: { enter: 'animated bounce', exit: 'animated bounce' },
          });
          this.load_proveedor = true;
          return;
        }

        $.notify('Proveedor creado correctamente', {
          type: 'success',
          spacing: 10,
          timer: 2000,
          placement: { from: 'top', align: 'right' },
          delay: 1000,
          animate: { enter: 'animated bounce', exit: 'animated bounce' },
        });

        $('#modalCreateProveedor').modal('hide');
        this.init_proveedores();
        this.load_proveedor = true;
      },
      error: (err) => {
        console.error('Error al crear proveedor', err);
        $.notify(err?.error?.message || 'Error al crear proveedor', {
          type: 'danger',
          spacing: 10,
          timer: 2000,
          placement: { from: 'top', align: 'right' },
          delay: 1000,
          animate: { enter: 'animated bounce', exit: 'animated bounce' },
        });
        this.load_proveedor = true;
      },
    });
  }

  openEditModal(id: any) {
    this.load_update = true;
    $('#modalUpdateProveedor').modal('show');

    this.proveedorService.getByIdProveedor(id).subscribe({
      next: (response) => {
        this.updateProveedor = response.data;
        this.load_update = true;
      },
      error: (err) => {
        console.error('Error al obtener proveedor', err);
        $.notify('Error al obtener datos del proveedor', {
          type: 'danger',
          spacing: 10,
          timer: 2000,
          placement: { from: 'top', align: 'right' },
          delay: 1000,
          animate: { enter: 'animated bounce', exit: 'animated bounce' },
        });
        this.load_update = true;
      },
    });
  }

  actualizar() {
    if (!this.canUpdate) return;

    if (!this.updateProveedor.nombre) {
      $.notify('Ingrese el nombre del proveedor', {
        type: 'danger',
        spacing: 10,
        timer: 2000,
        placement: { from: 'top', align: 'right' },
        delay: 1000,
        animate: { enter: 'animated bounce', exit: 'animated bounce' },
      });
      return;
    }

    if (!this.updateProveedor.nit) {
      $.notify('Ingrese el NIT del proveedor', {
        type: 'danger',
        spacing: 10,
        timer: 2000,
        placement: { from: 'top', align: 'right' },
        delay: 1000,
        animate: { enter: 'animated bounce', exit: 'animated bounce' },
      });
      return;
    }

    this.load_update = false;

    const payload: any = {
      nombre: this.updateProveedor.nombre,
      direccion: this.updateProveedor.direccion,
      telefono: this.updateProveedor.telefono,
      correo: this.updateProveedor.correo,
      nit: this.updateProveedor.nit,
    };

    this.proveedorService.updateProveedor(this.updateProveedor.id, payload).subscribe({
      next: (response) => {
        $.notify('Se actualizó correctamente el proveedor', {
          type: 'success',
          spacing: 10,
          timer: 2000,
          placement: { from: 'top', align: 'right' },
          delay: 1000,
          animate: { enter: 'animated bounce', exit: 'animated bounce' },
        });

        $('#modalUpdateProveedor').modal('hide');
        this.init_proveedores();
        this.load_update = true;
      },
      error: (err) => {
        console.error('Error al actualizar proveedor', err);
        $.notify(err?.error?.message || 'Error al actualizar proveedor', {
          type: 'danger',
          spacing: 10,
          timer: 2000,
          placement: { from: 'top', align: 'right' },
          delay: 1000,
          animate: { enter: 'animated bounce', exit: 'animated bounce' },
        });
        this.load_update = true;
      },
    });
  }

  eliminar_proveedor(id: any) {
    this.load_delete = false;

    this.proveedorService.deleteProveedor(id).subscribe({
      next: (response) => {
        $.notify(response.message || 'Proveedor deshabilitado correctamente', {
          type: 'success',
          spacing: 10,
          timer: 2000,
          placement: { from: 'top', align: 'right' },
          delay: 1000,
          animate: { enter: 'animated bounce', exit: 'animated bounce' },
        });

        $('#delete-' + id).modal('hide');
        this.load_delete = true;
        this.init_proveedores();
      },
      error: (err) => {
        console.error('Error al deshabilitar proveedor', err);
        $.notify(err?.error?.message || 'Error al deshabilitar proveedor', {
          type: 'danger',
          spacing: 10,
          timer: 2000,
          placement: { from: 'top', align: 'right' },
          delay: 1000,
          animate: { enter: 'animated bounce', exit: 'animated bounce' },
        });
        $('#delete-' + id).modal('hide');
        this.load_delete = true;
      },
    });
  }

}
