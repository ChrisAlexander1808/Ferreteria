import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ProveedorService } from '../../../core/services/proveedor.service';
import { ProductoService } from '../../../core/services/producto.service';
import { CompraService } from '../../../core/services/compra.service';

import { Proveedor } from '../../../core/models/proveedor.model';
import { Producto } from '../../../core/models/producto.model';

declare var $: any;

type TipoCompra = 'CONTADO' | 'CREDITO';

interface DetalleLineaCompra {
  producto_id: number | null;
  cantidad: number | null;
  precio_unitario: number | null;
  subtotal: number;

  producto_nombre?: string;
  producto_codigo?: string;

  error?: string;
}

interface GastoLinea {
  descripcion: string;
  monto: number | null;
  error?: string;
}

@Component({
  selector: 'app-create-compra',
  standalone: false,
  templateUrl: './create-compra.html',
  styleUrl: './create-compra.scss',
})
export class CreateCompra  implements OnInit {
  canCreate = false;

  // Cabecera
  proveedores: Proveedor[] = [];
  productos: Producto[] = [];

  selectedProveedorId: number | null = null;
  fecha: string = '';
  fecha_vencimiento: string = '';
  tipo_compra: TipoCompra = 'CONTADO';
  numero_factura: string = '';
  observacion: string = '';

  // Detalle productos
  detalles: DetalleLineaCompra[] = [];

  // Gastos
  gastos: GastoLinea[] = [];

  // Estado UI
  loadingData: boolean = true;
  saving: boolean = false;

  constructor(
    private auth: AuthService,
    private router: Router,
    private proveedorService: ProveedorService,
    private productoService: ProductoService,
    private compraService: CompraService
  ) {}

  ngOnInit(): void {
    this.canCreate = this.auth.hasPermission('COMPRAS_CREATE');

    if (!this.canCreate) {
      this.router.navigate(['/dashboard']);
      return;
    }

    const hoy = new Date();
    this.fecha = hoy.toISOString().substring(0, 10);

    this.initData();
  }

  initData() {
    this.loadingData = true;

    let proveedoresLoaded = false;
    let productosLoaded = false;

    const checkFinish = () => {
      if (proveedoresLoaded && productosLoaded) {
        // Iniciar con una línea por defecto
        if (!this.detalles || this.detalles.length === 0) {
          this.addLineaDetalle();
        }
        this.loadingData = false;
      }
    };

    this.proveedorService.getAllProveedores().subscribe({
      next: (res) => {
        this.proveedores = res.data || res || [];
        proveedoresLoaded = true;
        checkFinish();
      },
      error: (err) => {
        console.error('Error al obtener proveedores', err);
        $.notify('Error al obtener proveedores', {
          type: 'danger',
          spacing: 10,
          timer: 2000,
          placement: { from: 'top', align: 'right' },
          delay: 1000,
          animate: { enter: 'animated bounce', exit: 'animated bounce' },
        });
        proveedoresLoaded = true;
        checkFinish();
      },
    });

    this.productoService.getAllProductos().subscribe({
      next: (res) => {
        this.productos = res.data || res || [];
        productosLoaded = true;
        checkFinish();
      },
      error: (err) => {
        console.error('Error al obtener productos', err);
        $.notify('Error al obtener productos', {
          type: 'danger',
          spacing: 10,
          timer: 2000,
          placement: { from: 'top', align: 'right' },
          delay: 1000,
          animate: { enter: 'animated bounce', exit: 'animated bounce' },
        });
        productosLoaded = true;
        checkFinish();
      },
    });
  }

  // 🔍 búsqueda por nombre/código de producto
  productoSearchFn = (term: string, item: Producto) => {
    if (!term) return true;
    term = term.toLowerCase();

    const nombre = (item.nombre || '').toLowerCase();
    const codigo = (item.codigo || '').toLowerCase();

    return nombre.includes(term) || codigo.includes(term);
  };

  // 🔍 búsqueda por nombre/NIT de proveedor
  proveedorSearchFn = (term: string, item: Proveedor) => {
    if (!term) return true;
    term = term.toLowerCase();

    const nombre = (item.nombre || '').toLowerCase();
    const nit = (item as any).nit ? String((item as any).nit).toLowerCase() : '';

    return nombre.includes(term) || nit.includes(term);
  };

  setTipoCompra(tipo: TipoCompra) {
    this.tipo_compra = tipo;
  }

  // DETALLE =================================================================

  addLineaDetalle() {
    this.detalles.push({
      producto_id: null,
      cantidad: null,
      precio_unitario: null,
      subtotal: 0,
      error: '',
    });
  }

  removeLineaDetalle(index: number) {
    this.detalles.splice(index, 1);
    if (this.detalles.length === 0) {
      this.addLineaDetalle();
    }
  }

  onProductoChange(linea: DetalleLineaCompra) {
    linea.error = '';

    if (!linea.producto_id) {
      linea.producto_nombre = '';
      linea.producto_codigo = '';
      linea.precio_unitario = null;
      linea.subtotal = 0;
      return;
    }

    const prod = this.productos.find((p) => p.id === linea.producto_id);
    if (!prod) return;

    linea.producto_nombre = prod.nombre;
    linea.producto_codigo = prod.codigo;

    // Sugerir precio de compra como precio_unitario si viene
    const precioCompra = (prod as any).precio_compra
      ? Number((prod as any).precio_compra)
      : 0;
    if (precioCompra > 0 && (linea.precio_unitario == null || linea.precio_unitario === 0)) {
      linea.precio_unitario = precioCompra;
    }

    this.onCantidadOrPrecioChange(linea);
  }

  onCantidadOrPrecioChange(linea: DetalleLineaCompra) {
    linea.error = '';

    const cantidad = Number(linea.cantidad) || 0;
    const precio = Number(linea.precio_unitario) || 0;

    if (linea.producto_id && cantidad <= 0) {
      linea.error = 'La cantidad debe ser mayor a 0.';
      linea.subtotal = 0;
      return;
    }

    if (linea.producto_id && precio < 0) {
      linea.error = 'El precio no puede ser negativo.';
      linea.subtotal = 0;
      return;
    }

    linea.subtotal = cantidad * precio;
  }

  // GASTOS =================================================================

  addGasto() {
    this.gastos.push({
      descripcion: '',
      monto: null,
      error: '',
    });
  }

  removeGasto(index: number) {
    this.gastos.splice(index, 1);
  }

  onGastoChange(g: GastoLinea) {
    g.error = '';

    const monto = Number(g.monto) || 0;
    if (monto < 0) {
      g.error = 'El monto no puede ser negativo.';
      g.monto = 0;
    }
  }

  // TOTALES =================================================================

  get totalProductos(): number {
    return this.detalles.reduce(
      (acc, d) => acc + (Number(d.subtotal) || 0),
      0
    );
  }

  get totalGastos(): number {
    return this.gastos.reduce(
      (acc, g) => acc + (Number(g.monto) || 0),
      0
    );
  }

  get totalCompra(): number {
    return this.totalProductos + this.totalGastos;
  }

  // VALIDAR & GUARDAR =======================================================

  validar(): boolean {
    if (!this.selectedProveedorId) {
      $.notify('Seleccione el proveedor.', {
        type: 'danger',
        spacing: 10,
        timer: 2000,
        placement: { from: 'top', align: 'right' },
        delay: 1000,
        animate: { enter: 'animated bounce', exit: 'animated bounce' },
      });
      return false;
    }

    if (!this.fecha) {
      $.notify('Seleccione la fecha de la compra.', {
        type: 'danger',
        spacing: 10,
        timer: 2000,
        placement: { from: 'top', align: 'right' },
        delay: 1000,
        animate: { enter: 'animated bounce', exit: 'animated bounce' },
      });
      return false;
    }

    if (this.tipo_compra === 'CREDITO' && !this.fecha_vencimiento) {
      $.notify('Seleccione la fecha de vencimiento para la compra al crédito.', {
        type: 'danger',
        spacing: 10,
        timer: 2000,
        placement: { from: 'top', align: 'right' },
        delay: 1000,
        animate: { enter: 'animated bounce', exit: 'animated bounce' },
      });
      return false;
    }

    // Detalles válidos
    const detallesValidos = this.detalles.filter(
      (d) =>
        d.producto_id &&
        Number(d.cantidad) > 0 &&
        Number(d.precio_unitario) >= 0
    );

    if (detallesValidos.length === 0) {
      $.notify('Agregue al menos un producto a la compra.', {
        type: 'danger',
        spacing: 10,
        timer: 2000,
        placement: { from: 'top', align: 'right' },
        delay: 1000,
        animate: { enter: 'animated bounce', exit: 'animated bounce' },
      });
      return false;
    }

    // Errores en detalle
    for (let i = 0; i < this.detalles.length; i++) {
      const d = this.detalles[i];
      if (d.error) {
        $.notify(`La línea de producto #${i + 1} tiene errores.`, {
          type: 'danger',
          spacing: 10,
          timer: 2000,
          placement: { from: 'top', align: 'right' },
          delay: 1000,
          animate: { enter: 'animated bounce', exit: 'animated bounce' },
        });
        return false;
      }
    }

    // Errores en gastos
    for (let i = 0; i < this.gastos.length; i++) {
      const g = this.gastos[i];
      if (g.error) {
        $.notify(`La línea de gasto #${i + 1} tiene errores.`, {
          type: 'danger',
          spacing: 10,
          timer: 2000,
          placement: { from: 'top', align: 'right' },
          delay: 1000,
          animate: { enter: 'animated bounce', exit: 'animated bounce' },
        });
        return false;
      }
    }

    if (this.totalCompra <= 0) {
      $.notify('El total de la compra debe ser mayor a 0.', {
        type: 'danger',
        spacing: 10,
        timer: 2000,
        placement: { from: 'top', align: 'right' },
        delay: 1000,
        animate: { enter: 'animated bounce', exit: 'animated bounce' },
      });
      return false;
    }

    return true;
  }

  guardarCompra() {
    if (!this.validar()) return;

    const detallesPayload = this.detalles
      .filter(
        (d) =>
          d.producto_id &&
          Number(d.cantidad) > 0 &&
          Number(d.precio_unitario) >= 0
      )
      .map((d) => ({
        producto_id: d.producto_id,
        cantidad: Number(d.cantidad),
        precio_unitario: Number(d.precio_unitario),
      }));

    const gastosPayload = this.gastos
      .filter((g) => g.descripcion && Number(g.monto) > 0)
      .map((g) => ({
        descripcion: g.descripcion,
        monto: Number(g.monto),
      }));

    const payload: any = {
      proveedor_id: this.selectedProveedorId,
      fecha: this.fecha,
      tipo_compra: this.tipo_compra,
      numero_factura: this.numero_factura || null,
      observacion: this.observacion || null,
      detalles: detallesPayload,
      gastos: gastosPayload,
      fecha_vencimiento: this.tipo_compra === 'CREDITO' ? this.fecha_vencimiento: null,
    };

    this.saving = true;

    this.compraService.createCompra(payload).subscribe({
      next: (res) => {
        $.notify(res?.message || 'Compra registrada correctamente.', {
          type: 'success',
          spacing: 10,
          timer: 2000,
          placement: { from: 'top', align: 'right' },
          delay: 1000,
          animate: { enter: 'animated bounce', exit: 'animated bounce' },
        });

        this.saving = false;
        this.router.navigate(['/compras']);
      },
      error: (err) => {
        console.error('Error al registrar compra', err);
        $.notify(
          err?.error?.message || err?.error?.mensaje || 'Error al registrar la compra',
          {
            type: 'danger',
            spacing: 10,
            timer: 2000,
            placement: { from: 'top', align: 'right' },
            delay: 1000,
            animate: { enter: 'animated bounce', exit: 'animated bounce' },
          }
        );
        this.saving = false;
      },
    });
  }

  cancelar() {
    this.router.navigate(['/compras']);
  }
}