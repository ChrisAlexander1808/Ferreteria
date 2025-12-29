import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { Producto, Categoria } from '../../core/models/producto.model';
import { ProductoService } from '../../core/services/producto.service';
import { CategoriaService } from '../../core/services/categoria.service';

declare var $: any;

@Component({
  selector: 'app-productos',
  standalone: false,
  templateUrl: './productos.html',
  styleUrl: './productos.scss',
})
export class Productos implements OnInit {

    canRead = false;
    canCreate = false;
    canUpdate = false;
    canDelete = false;

    // Estados
    load_data = true;
    load_producto = true;
    load_update = true;
    load_delete = true;

    // Filtro y paginación
    filtro_producto: string = '';
    page: number = 1;
    pageSize: number = 10;

    // Datos
    productos: Producto[] = [];
    productos_const: Producto[] = [];
    categorias: Categoria[] = [];

    private codigoTimer: any = null;
    generandoCodigo: boolean = false;

    // Formularios
    public createProducto: any = {
      nombre: '',
      codigo: '',
      descripcion: '',
      precio_compra: 0,
      precio_venta: 0,
      stock_actual: 0,
      unidad_medida: '',
      categoria_id: '',
    };

    public updateProducto: any = {
      id: null,
      nombre: '',
      codigo: '',
      descripcion: '',
      precio_compra: 0,
      precio_venta: 0,
      stock_actual: 0,
      unidad_medida: '',
      categoria_id: '',
    };

    constructor(
      private auth: AuthService,
      private router: Router,
      private productoService: ProductoService,
      private categoriaService: CategoriaService
    ){}

    ngOnInit(): void {
      this.canRead = this.auth.hasPermission('PRODUCTO_READ');
      this.canCreate = this.auth.hasPermission('PRODUCTO_CREATE');
      this.canUpdate = this.auth.hasPermission('PRODUCTO_UPDATE');
      this.canDelete = this.auth.hasPermission('PRODUCTO_DELETE');

      if (!this.canRead) {
        this.router.navigate(['/dashboard']);
        return;
      }

      this.init_categorias();
      this.init_productos();
    }

    init_categorias() {
    this.categoriaService.getAllCategorias().subscribe({
      next: (resp) => {
        this.categorias = resp.data || resp; // por si tu endpoint devuelve solo array
      },
      error: (err) => {
        console.error('Error al obtener categorías', err);
      },
    });
  }

  init_productos() {
    this.load_data = true;
    this.productoService.getAllProductos().subscribe({
      next: (response) => {
        this.productos = response.data;
        this.productos_const = this.productos;
        this.load_data = false;
      },
      error: (err) => {
        console.error('Error al obtener productos', err);
        this.load_data = false;
        $.notify('Error al obtener productos', {
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
    if (!this.filtro_producto) {
      this.productos = [...this.productos_const];
      return;
    }

    const term = new RegExp(this.filtro_producto, 'i');

    this.productos = this.productos_const.filter(
      (item) =>
        term.test(item.nombre) ||
        term.test(item.codigo) ||
        term.test(item.categoria?.nombre || '')
    );
  }

  // ---------- CREAR ----------
  openCreateModal() {
    this.createProducto = {
      nombre: '',
      codigo: '',
      descripcion: '',
      precio_compra: 0,
      precio_venta: 0,
      stock_actual: 0,
      unidad_medida: '',
      categoria_id: '',
    };

    this.load_producto = true;
    $('#modalCreateProducto').modal('show');

    setTimeout(() => {
      this.onCategoriaOrNombreChange();
    }, 0);
  }

  save_create_producto() {
    if (!this.createProducto.nombre) {
      $.notify('Ingrese el nombre del producto', {
        type: 'danger',
        spacing: 10,
        timer: 2000,
        placement: { from: 'top', align: 'right' },
        delay: 1000,
        animate: { enter: 'animated bounce', exit: 'animated bounce' },
      });
      return;
    }

    if (!this.createProducto.codigo) {
      $.notify('Ingrese el código del producto', {
        type: 'danger',
        spacing: 10,
        timer: 2000,
        placement: { from: 'top', align: 'right' },
        delay: 1000,
        animate: { enter: 'animated bounce', exit: 'animated bounce' },
      });
      return;
    }

    if (!this.createProducto.categoria_id) {
      $.notify('Seleccione la categoría del producto', {
        type: 'danger',
        spacing: 10,
        timer: 2000,
        placement: { from: 'top', align: 'right' },
        delay: 1000,
        animate: { enter: 'animated bounce', exit: 'animated bounce' },
      });
      return;
    }

    // Normalizar numéricos
    const payload: any = {
      nombre: this.createProducto.nombre,
      codigo: this.createProducto.codigo,
      descripcion: this.createProducto.descripcion,
      precio_compra: Number(this.createProducto.precio_compra) || 0,
      precio_venta: Number(this.createProducto.precio_venta) || 0,
      stock_actual: Number(this.createProducto.stock_actual) || 0,
      unidad_medida: this.createProducto.unidad_medida,
      categoria_id: this.createProducto.categoria_id,
    };

    this.load_producto = false;

    this.productoService.createProducto(payload).subscribe({
      next: (response) => {
        if (!response || !response.data) {
          $.notify(response?.message || 'No se pudo crear el producto', {
            type: 'danger',
            spacing: 10,
            timer: 2000,
            placement: { from: 'top', align: 'right' },
            delay: 1000,
            animate: { enter: 'animated bounce', exit: 'animated bounce' },
          });
          this.load_producto = true;
          return;
        }

        $.notify('Producto creado correctamente', {
          type: 'success',
          spacing: 10,
          timer: 2000,
          placement: { from: 'top', align: 'right' },
          delay: 1000,
          animate: { enter: 'animated bounce', exit: 'animated bounce' },
        });

        $('#modalCreateProducto').modal('hide');
        this.init_productos();
        this.load_producto = true;
      },
      error: (err) => {
        console.error('Error al crear producto', err);
        $.notify(err?.error?.message || 'Error al crear producto', {
          type: 'danger',
          spacing: 10,
          timer: 2000,
          placement: { from: 'top', align: 'right' },
          delay: 1000,
          animate: { enter: 'animated bounce', exit: 'animated bounce' },
        });
        this.load_producto = true;
      },
    });
  }

  // ---------- EDITAR ----------
  openEditModal(id: any) {
    this.load_update = true;
    $('#modalUpdateProducto').modal('show');

    this.productoService.getByIdProducto(id).subscribe({
      next: (response) => {
        const prod = response.data;
        this.updateProducto = {
          id: prod.id,
          nombre: prod.nombre,
          codigo: prod.codigo,
          descripcion: prod.descripcion,
          precio_compra: prod.precio_compra,
          precio_venta: prod.precio_venta,
          stock_actual: prod.stock_actual,
          unidad_medida: prod.unidad_medida,
          categoria_id: prod.categoria_id || prod.categoria?.id || '',
        };

        this.load_update = true;
      },
      error: (err) => {
        console.error('Error al obtener producto', err);
        $.notify('Error al obtener datos del producto', {
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
    this.load_update = false;

    const payload: any = {
      nombre: this.updateProducto.nombre,
      codigo: this.updateProducto.codigo,
      descripcion: this.updateProducto.descripcion,
      precio_compra: Number(this.updateProducto.precio_compra) || 0,
      precio_venta: Number(this.updateProducto.precio_venta) || 0,
      stock_actual: Number(this.updateProducto.stock_actual) || 0,
      unidad_medida: this.updateProducto.unidad_medida,
      categoria_id: this.updateProducto.categoria_id,
    };

    this.productoService
      .updateProducto(this.updateProducto.id, payload)
      .subscribe({
        next: (response) => {
          $.notify('Se actualizó correctamente el producto', {
            type: 'success',
            spacing: 10,
            timer: 2000,
            placement: { from: 'top', align: 'right' },
            delay: 1000,
            animate: { enter: 'animated bounce', exit: 'animated bounce' },
          });

          $('#modalUpdateProducto').modal('hide');
          this.init_productos();
          this.load_update = true;
        },
        error: (err) => {
          console.error('Error al actualizar producto', err);
          $.notify(
            err?.error?.message || 'Error al actualizar el producto',
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

  // ---------- ELIMINAR ----------
  eliminar_producto(id: any) {
    this.load_delete = true;

    this.productoService.deleteProducto(id).subscribe({
      next: (response) => {
        if (
          response.message &&
          response.message === 'Producto deshabilitado correctamente'
        ) {
          $.notify('Se deshabilitó el producto correctamente', {
            type: 'success',
            spacing: 10,
            timer: 2000,
            placement: { from: 'top', align: 'right' },
            delay: 1000,
            animate: { enter: 'animated bounce', exit: 'animated bounce' },
          });
        } else {
          $.notify(
            response.message || 'Error al eliminar el producto',
            {
              type: 'danger',
              spacing: 10,
              timer: 2000,
              placement: { from: 'top', align: 'right' },
              delay: 1000,
              animate: { enter: 'animated bounce', exit: 'animated bounce' },
            }
          );
        }

        $('#delete-' + id).modal('hide');
        this.load_delete = false;
        this.init_productos();
      },
      error: (err) => {
        console.error('Error al eliminar producto', err);
        $.notify(
          err?.error?.message || 'Error al eliminar el producto',
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
        this.load_delete = false;
      },
    });
  }

    verKardex(item: Producto) {
      this.router.navigate(['/inventario/kardex', item.id]);
    }

    private limpiarCodigoTexto(txt: string): string {
      return (txt || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // quita tildes
        .replace(/[^a-zA-Z0-9\s]/g, '') // quita símbolos
        .trim()
        .toUpperCase();
    }

    private take3(txt: string): string {
      const clean = this.limpiarCodigoTexto(txt).replace(/\s+/g, '');
      return (clean + 'XXX').substring(0, 3); // asegura 3 chars
    }

    private nextCorrelativoLocal(prefix: string): number {
      // busca en productos_const el último correlativo del prefijo
      // Formato: CATNAM###  (ej: FERLAM100)
      const re = new RegExp(`^${prefix}(\\d{3,})$`); // 3 o más dígitos

      let max = 99; // para que el primero sea 100
      for (const p of this.productos_const || []) {
        const code = (p as any).codigo ? String((p as any).codigo).toUpperCase() : '';
        const m = code.match(re);
        if (m && m[1]) {
          const num = Number(m[1]);
          if (!isNaN(num) && num > max) max = num;
        }
      }
      return max + 1;
    }

    onCategoriaOrNombreChange(): void {
    const catId = this.createProducto.categoria_id;
    const nombre = (this.createProducto.nombre || '').trim();

    // Si falta algo, limpia
    if (!catId || !nombre) {
      this.createProducto.codigo = '';
      return;
    }

    // (Opcional) Evitar llamadas si el nombre es muy corto
    if (nombre.length < 3) {
      this.createProducto.codigo = '';
      return;
    }

    // Debounce: espera 350ms desde la última tecla/cambio
    if (this.codigoTimer) clearTimeout(this.codigoTimer);

    this.codigoTimer = setTimeout(() => {
      this.generandoCodigo = true;

      this.productoService.getNextCodigo(Number(catId), nombre).subscribe({
        next: (res) => {
          // tu backend devuelve: { data: { codigo: "ABCDEF100" } }
          this.createProducto.codigo = res?.data?.codigo || '';
          this.generandoCodigo = false;
        },
        error: (err) => {
          console.error('Error generando código', err);
          this.createProducto.codigo = '';
          this.generandoCodigo = false;

          // si quieres notificar:
          // $.notify('Error al generar código de producto', { ... });
        },
      });
    }, 350);
  }
}
