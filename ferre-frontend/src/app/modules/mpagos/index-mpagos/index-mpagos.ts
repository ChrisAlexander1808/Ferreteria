import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { MetodoPagoService } from '../../../core/services/metodo-pago.service';
import { MetodoPago } from '../../../core/models/metodo-pago.model';
declare var $: any;

@Component({
  selector: 'app-index-mpagos',
  standalone: false,
  templateUrl: './index-mpagos.html',
  styleUrl: './index-mpagos.scss',
})
export class IndexMpagos implements OnInit {

      // Permisos
    canRead = false;
    canCreate = false;
    canUpdate = false;
    canDelete = false;

    // Estado UI
    load_data: boolean = true;
    load_create: boolean = true;
    load_update: boolean = true;
    load_delete: boolean = true;

    // Filtro y paginación
    filtro_metodo: string = '';
    page: number = 1;
    pageSize: number = 10;

    // Datos
    metodos: MetodoPago[] = [];
    metodos_const: MetodoPago[] = [];

    // Formularios
    createMetodo: any = {
      nombre: '',
      descripcion: '',
      activo: true,
    };

    updateMetodo: any = {
      id: null,
      nombre: '',
      descripcion: '',
      activo: true,
    };

    constructor(
      private auth: AuthService,
      private router: Router,
      private metodoPagoService: MetodoPagoService
    ){}

    ngOnInit(): void {
      // Permisos
    this.canRead   = this.auth.hasPermission('MPAGO_READ');
    this.canCreate = this.auth.hasPermission('MPAGO_CREATE');
    this.canUpdate = this.auth.hasPermission('MPAGO_UPDATE');
    this.canDelete = this.auth.hasPermission('MPAGO_DELETE');

    if (!this.canRead) {
      this.router.navigate(['/dashboard']);
      return;
    }

    this.init_metodos();
    }

  init_metodos() { 
    this.load_data = true; 
    this.metodoPagoService.getAllMetodosPago().subscribe({ 
      next: (res) => { 
        this.metodos = res.data || res || []; 
        this.metodos_const = [...this.metodos]; 
        this.load_data = false; 
      }, 
      error: (err) => { 
        console.error('Error al obtener métodos de pago', err); 
        this.load_data = false;
        $.notify('Error al obtener métodos de pago', { 
          type: 'danger', 
          spacing: 10, 
          timer: 2000, 
          placement: { from: 'top', align: 'right' }, 
          delay: 1000, 
          animate: { enter: 'animated bounce', exit: 'animated bounce' }, 
        }); 
        this.load_data = false; 
      }, 
    });
   }

  filtrar() {
    if (!this.filtro_metodo) {
      this.metodos = [...this.metodos_const];
      return;
    }

    const term = new RegExp(this.filtro_metodo, 'i');
    this.metodos = this.metodos_const.filter(
      (item) =>
        term.test(item.nombre || '') ||
        term.test(item.descripcion || '')
    );
  }

  // 👉 CREAR

  openCreateModal() {
    this.createMetodo = {
      nombre: '',
      descripcion: '',
      activo: true,
    };
    this.load_create = true;
    $('#modalCreateMetodo').modal('show');
  }

  save_create_metodo() {
    if (!this.createMetodo.nombre) {
      $.notify('Ingrese el nombre del método de pago', {
        type: 'danger',
        spacing: 10,
        timer: 2000,
        placement: { from: 'top', align: 'right' },
        delay: 1000,
        animate: { enter: 'animated bounce', exit: 'animated bounce' },
      });
      return;
    }

    this.load_create = false;

    this.metodoPagoService.createMetodoPago(this.createMetodo).subscribe({
      next: (res) => {
        $.notify('Método de pago creado correctamente', {
          type: 'success',
          spacing: 10,
          timer: 2000,
          placement: { from: 'top', align: 'right' },
          delay: 1000,
          animate: { enter: 'animated bounce', exit: 'animated bounce' },
        });

        $('#modalCreateMetodo').modal('hide');
        this.init_metodos();
        this.load_create = true;
      },
      error: (err) => {
        console.error('Error al crear método de pago', err);
        $.notify(
          err?.error?.message || 'Error al crear método de pago',
          {
            type: 'danger',
            spacing: 10,
            timer: 2000,
            placement: { from: 'top', align: 'right' },
            delay: 1000,
            animate: { enter: 'animated bounce', exit: 'animated bounce' },
          }
        );
        this.load_create = true;
      },
    });
  }

  // 👉 EDITAR

  openEditModal(id: number) {
    if (!this.canUpdate) return;

    this.load_update = true;
    $('#modalUpdateMetodo').modal('show');

    this.metodoPagoService.getByIdMetodoPago(id).subscribe({
      next: (res) => {
        const metodo = res.data || res;
        this.updateMetodo = {
          id: metodo.id,
          nombre: metodo.nombre,
          descripcion: metodo.descripcion,
          activo: metodo.activo,
        };
        this.load_update = true;
      },
      error: (err) => {
        console.error('Error al obtener método de pago', err);
        $.notify('Error al obtener método de pago', {
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

  actualizar_metodo() {
    if (!this.updateMetodo.nombre) {
      $.notify('Ingrese el nombre del método de pago', {
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

    const payload = {
      nombre: this.updateMetodo.nombre,
      descripcion: this.updateMetodo.descripcion,
      activo: this.updateMetodo.activo,
    };

    this.metodoPagoService.updateMetodoPago(this.updateMetodo.id, payload).subscribe({
      next: (res) => {
        $.notify('Método de pago actualizado correctamente', {
          type: 'success',
          spacing: 10,
          timer: 2000,
          placement: { from: 'top', align: 'right' },
          delay: 1000,
          animate: { enter: 'animated bounce', exit: 'animated bounce' },
        });

        $('#modalUpdateMetodo').modal('hide');
        this.init_metodos();
        this.load_update = true;
      },
      error: (err) => {
        console.error('Error al actualizar método de pago', err);
        $.notify(
          err?.error?.message || 'Error al actualizar método de pago',
          {
            type: 'danger',
            spacing: 10,
            timer: 2000,
            placement: { from: 'top', align: 'right' },
            delay: 1000,
            animate: { enter: 'animated bounce', exit: 'animated bounce' },
          }
        );
        this.load_update = true;
      },
    });
  }

  // 👉 ELIMINAR / DESHABILITAR

  eliminar_metodo(id: number) {
    if (!this.canDelete) return;

    this.load_delete = false;

    this.metodoPagoService.deleteMetodoPago(id).subscribe({
      next: (res) => {
        $.notify('Método de pago deshabilitado correctamente', {
          type: 'success',
          spacing: 10,
          timer: 2000,
          placement: { from: 'top', align: 'right' },
          delay: 1000,
          animate: { enter: 'animated bounce', exit: 'animated bounce' },
        });
        $('#delete-' + id).modal('hide');
        this.init_metodos();
        this.load_delete = true;
      },
      error: (err) => {
        console.error('Error al deshabilitar método de pago', err);
        $.notify(
          err?.error?.message || 'Error al deshabilitar método de pago',
          {
            type: 'danger',
            spacing: 10,
            timer: 2000,
            placement: { from: 'top', align: 'right' },
            delay: 1000,
            animate: { enter: 'animated bounce', exit: 'animated bounce' },
          }
        );
        $('#delete-' + id).modal('hide');
        this.load_delete = true;
      },
    });
  }
}
