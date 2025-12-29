import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { InventarioService } from '../../core/services/inventario.service';
import { ProductoService } from '../../core/services/producto.service';
import { MovimientoInventario, Producto } from '../../core/models/inventario.model';
declare var $:any;

@Component({
  selector: 'app-inventario',
  standalone: false,
  templateUrl: './inventario.html',
  styleUrl: './inventario.scss',
})
export class Inventario implements OnInit {

    // Permisos
    canRead = false;
    canCreate = false;

    // Estados
    load_data = true;
    load_movimiento = true;
    filtro_movimiento: string = '';

    // Paginación
    page: number = 1;
    pageSize: number = 10;

    // Datos
    movimientos: MovimientoInventario[] = [];
    movimientos_const: MovimientoInventario[] = [];
    productos: Producto[] = [];

    // Formulario crear movimiento
    public createMovimiento: any = {
      producto_id: '',
      tipo: '',
      cantidad: 0,
      motivo: '',
      referencia: '',
    };

    // Validaciones
    selectedProductStock: number = 0;

    constructor(
      private auth: AuthService,
      private router: Router,
      private inventarioService: InventarioService,
      private productoService: ProductoService
    ){}

    ngOnInit(): void {
      this.canRead   = this.auth.hasPermission('INVENTARIO_READ');
      this.canCreate = this.auth.hasPermission('INVENTARIO_MOVIMIENTOS_CREATE'); // revisá el nombre exacto del permiso

      if (!this.canRead) {
        this.router.navigate(['/dashboard']);
        return;
      }

      this.init_productos();
      this.init_movimientos();
     }

     onProductoChange() {
        const prod = this.productos.find(
          (p) => p.id == this.createMovimiento.producto_id
        );
        this.selectedProductStock = prod ? prod.stock_actual : 0;
    }

    validarCantidadSalida(): boolean {
      if (
        this.createMovimiento.tipo === 'SALIDA' &&
        Number(this.createMovimiento.cantidad) > this.selectedProductStock
      ) {
        return false;
      }
      return true;
    }

  init_productos() {
    this.productoService.getAllProductos().subscribe({
      next: (resp) => {
        console.log(resp.data);
        this.productos = resp.data || resp;
      },
      error: (err) => {
        console.error('Error al obtener productos para inventario', err);
      },
    });
  }

  init_movimientos() {
    this.load_data = true;

    this.inventarioService.getAllMovimientos().subscribe({
      next: (response) => {
        this.movimientos = response.data;
        this.movimientos_const = this.movimientos;
        this.load_data = false;
      },
      error: (err) => {
        console.error('Error al obtener movimientos de inventario', err);
        this.load_data = false;
        $.notify('Error al obtener movimientos de inventario', {
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
    if (!this.filtro_movimiento) {
      this.movimientos = [...this.movimientos_const];
      return;
    }

    const term = new RegExp(this.filtro_movimiento, 'i');

    this.movimientos = this.movimientos_const.filter((m) =>
      term.test(m.producto?.nombre || '') ||
      term.test(m.producto?.codigo || '') ||
      term.test(m.tipo || '') ||
      term.test(m.referencia || '') ||
      term.test(m.motivo || '')
    );
  }

  // ---------- CREAR MOVIMIENTO ----------
  openCreateModal() {
    this.createMovimiento = {
      producto_id: '',
      tipo: '',
      cantidad: 0,
      motivo: '',
      referencia: '',
    };

    this.load_movimiento = true;
    $('#modalCreateMovimiento').modal('show');
      setTimeout(()=>{
        $('.selectpicker').selectpicker('refresh');
      },150);
  }

  save_create_movimiento() {
    // Validaciones
    if (!this.createMovimiento.producto_id) {
      $.notify('Seleccione un producto', {
        type: 'danger',
        spacing: 10,
        timer: 2000,
        placement: { from: 'top', align: 'right' },
        delay: 1000,
        animate: { enter: 'animated bounce', exit: 'animated bounce' },
      });
      return;
    }

    if (!this.createMovimiento.tipo) {
      $.notify('Seleccione el tipo de movimiento', {
        type: 'danger',
        spacing: 10,
        timer: 2000,
        placement: { from: 'top', align: 'right' },
        delay: 1000,
        animate: { enter: 'animated bounce', exit: 'animated bounce' },
      });
      return;
    }

    if (!this.createMovimiento.cantidad || this.createMovimiento.cantidad <= 0) {
      $.notify('Ingrese una cantidad mayor a cero', {
        type: 'danger',
        spacing: 10,
        timer: 2000,
        placement: { from: 'top', align: 'right' },
        delay: 1000,
        animate: { enter: 'animated bounce', exit: 'animated bounce' },
      });
      return;
    }

    if (!this.validarCantidadSalida()) {
      $.notify('La cantidad de salida no puede ser mayor al stock disponible (' + this.selectedProductStock + ')', {
        type: 'danger',
        spacing: 10,
        timer: 2000,
        placement: { from: 'top', align: 'right' },
        delay: 1000,
        animate: { enter: 'animated bounce', exit: 'animated bounce' },
      });
      return;
    }

    const payload = {
      producto_id: this.createMovimiento.producto_id,
      tipo: this.createMovimiento.tipo,
      cantidad: Number(this.createMovimiento.cantidad),
      motivo: this.createMovimiento.motivo,
      referencia: this.createMovimiento.referencia,
    };

    this.load_movimiento = false;

    this.inventarioService.createMovimiento(payload).subscribe({
      next: (response) => {
        if (!response || !response.data) {
          $.notify(response?.message || 'No se pudo registrar el movimiento', {
            type: 'danger',
            spacing: 10,
            timer: 2000,
            placement: { from: 'top', align: 'right' },
            delay: 1000,
            animate: { enter: 'animated bounce', exit: 'animated bounce' },
          });
          this.load_movimiento = true;
          return;
        }

        $.notify('Movimiento registrado correctamente', {
          type: 'success',
          spacing: 10,
          timer: 2000,
          placement: { from: 'top', align: 'right' },
          delay: 1000,
          animate: { enter: 'animated bounce', exit: 'animated bounce' },
        });

        $('#modalCreateMovimiento').modal('hide');
        this.init_movimientos();
        this.load_movimiento = true;
      },
      error: (err) => {
        console.error('Error al registrar movimiento', err);
        $.notify(err?.error?.message || 'Error al registrar movimiento', {
          type: 'danger',
          spacing: 10,
          timer: 2000,
          placement: { from: 'top', align: 'right' },
          delay: 1000,
          animate: { enter: 'animated bounce', exit: 'animated bounce' },
        });
        this.load_movimiento = true;
      },
    });
  }


}
