import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { VentaService } from '../../../core/services/venta.service';
import { Cliente } from '../../../core/models/cliente.model';
import { Producto } from '../../../core/models/producto.model';
import { MetodoPago } from '../../../core/models/metodo-pago.model';
import { ClienteService } from '../../../core/services/cliente.service';
import { ProductoService } from '../../../core/services/producto.service';
import { MetodoPagoService } from '../../../core/services/metodo-pago.service';
declare var $: any;

interface DetalleLinea {
  tipo_item: 'BIEN' | 'SERVICIO' | '';
  producto_id?: number | null;
  producto_nombre?: string;
  producto_stock?: number;
  descripcion?: string;
  cantidad: number | null;
  precio_unitario: number | null;
  subtotal: number;

  errorStock?: boolean;
  errorStockMsg?: string;
}

@Component({
  selector: 'app-create-venta',
  standalone: false,
  templateUrl: './create-venta.html',
  styleUrl: './create-venta.scss',
})
export class CreateVenta implements OnInit {
 
    canCreate = false;

    // Cabecera
    clientes: Cliente[] = [];
    selectedClienteId: number | null = null;
    fecha: string = '';
    observacion: string = '';

    // Tipo de venta / factura / método de pago
    selectedTipoVenta: 'CONTADO' | 'CREDITO' | '' = 'CONTADO';
    num_factura: string = '';
    metodosPago: MetodoPago[] = [];
    selectedMetodoPagoId: number | null = null;

    // Detalle
    detalles: DetalleLinea[] = [];

    // Catálogo de productos
    productos: Producto[] = [];

    // Estado UI
    loadingData: boolean = true;
    saving: boolean = false;
    // NUEVO:
    

    constructor(
      private auth: AuthService,
      private router: Router,
      private ventaService: VentaService,
      private clienteService: ClienteService,
      private productoService: ProductoService,
      private metodoPagoService: MetodoPagoService
    ){}

    ngOnInit(): void {
      this.canCreate = this.auth.hasPermission('VENTAS_CREATE');

      if (!this.canCreate) {
        this.router.navigate(['/dashboard']);
        return;
      }

      // Fecha por defecto: hoy (yyyy-MM-dd)
      const hoy = new Date();
      this.fecha = hoy.toISOString().substring(0, 10);

      this.cargarDataInicial();
    }

    setTipoVenta(tipo: 'CONTADO' | 'CREDITO') {
      this.selectedTipoVenta = tipo;
      this.onTipoVentaChange();
    }

     // 🔍 búsqueda por nombre o NIT
  clienteSearchFn = (term: string, item: Cliente) => {
    if (!term) return true;
    term = term.toLowerCase();

    const nombre = (item.nombre || '').toLowerCase();
    const nit = (item as any).nit ? String((item as any).nit).toLowerCase() : '';

    return nombre.includes(term) || nit.includes(term);
  };

  // Cargar clientes, productos y métodos de pago
  cargarDataInicial() {
    this.loadingData = true;

    let clientesLoaded = false;
    let productosLoaded = false;
    let metodosLoaded = false;

    const checkFinish = () => {
      if (clientesLoaded && productosLoaded && metodosLoaded) {
        this.loadingData = false;
        if (this.detalles.length === 0) {
          this.addLinea();
        }
      }
    };

    // Clientes
    this.clienteService.getAllClientes().subscribe({
      next: (res) => {
        this.clientes = res.data || [];
        clientesLoaded = true;
        checkFinish();
      },
      error: (err) => {
        console.error('Error al obtener clientes', err);
        $.notify('Error al obtener clientes', {
          type: 'danger',
          spacing: 10,
          timer: 2000,
          placement: { from: 'top', align: 'right' },
          delay: 1000,
          animate: { enter: 'animated bounce', exit: 'animated bounce' },
        });
        clientesLoaded = true;
        checkFinish();
      },
    });

    // Productos
    this.productoService.getAllProductos().subscribe({
      next: (res) => {
        this.productos = res.data || [];
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

    // Métodos de pago
    this.metodoPagoService.getAllMetodosPago().subscribe({
      next: (res) => {
        this.metodosPago = res.data || res || [];
        metodosLoaded = true;
        checkFinish();
      },
      error: (err) => {
        console.error('Error al obtener métodos de pago', err);
        $.notify('Error al obtener métodos de pago', {
          type: 'danger',
          spacing: 10,
          timer: 2000,
          placement: { from: 'top', align: 'right' },
          delay: 1000,
          animate: { enter: 'animated bounce', exit: 'animated bounce' },
        });
        metodosLoaded = true;
        checkFinish();
      },
    });
  }

  // 👉 Total calculado
  get total(): number {
    return this.detalles.reduce((acc, d) => acc + (Number(d.subtotal) || 0), 0);
  }

  // 👉 Agregar línea
  addLinea() {
    this.detalles.push({
      tipo_item: '',
      producto_id: null,
      producto_nombre: '',
      producto_stock: 0,
      descripcion: '',
      cantidad: null,
      precio_unitario: null,
      subtotal: 0,
      errorStock: false,
      errorStockMsg: ''
    });
  }

  // 👉 Quitar línea
  removeLinea(index: number) {
    this.detalles.splice(index, 1);
  }

  // Tipo de venta cambio
  onTipoVentaChange() {
    if (this.selectedTipoVenta !== 'CONTADO') {
      this.selectedMetodoPagoId = null;
    }
  }

  // Cambio de tipo_item
  onTipoChange(linea: DetalleLinea) {
    if (linea.tipo_item === 'BIEN') {
      linea.descripcion = '';
    } else if (linea.tipo_item === 'SERVICIO') {
      linea.producto_id = null;
      linea.producto_nombre = '';
      linea.producto_stock = 0;
    }
    this.recalcularSubtotal(linea);
  }

  // Cambio de producto en una línea
  onProductoChange(linea: DetalleLinea) {
    if (!linea.producto_id) {
      linea.producto_nombre = '';
      linea.producto_stock = 0;
      return;
    }

    const prod = this.productos.find((p) => p.id === Number(linea.producto_id));
    if (prod) {
      linea.producto_nombre = prod.nombre;
      linea.producto_stock = prod.stock_actual;
      if (!linea.precio_unitario || linea.precio_unitario <= 0) {
        linea.precio_unitario = prod.precio_venta;
      }
    }
    this.recalcularSubtotal(linea);
  }

  // Cambio en cantidad o precio
  onCantidadOrPrecioChange(linea: DetalleLinea) {
    linea.errorStock = false;
    linea.errorStockMsg = '';

    if (linea.tipo_item === 'BIEN' && linea.producto_stock != null) {
      const cant = Number(linea.cantidad) || 0;

      if (cant > linea.producto_stock) {
        linea.errorStock = true;
        linea.errorStockMsg = 'La cantidad excede el stock disponible.';
        linea.cantidad = linea.producto_stock;
      }
    }

    this.recalcularSubtotal(linea);
  }

  // Recalcular subtotal de una línea
  recalcularSubtotal(linea: DetalleLinea) {
    const cant = Number(linea.cantidad) || 0;
    const precio = Number(linea.precio_unitario) || 0;
    linea.subtotal = cant * precio;
  }

  // 👉 Validar antes de guardar
  validar(): boolean {
    if (!this.selectedClienteId) {
      $.notify('Seleccione el cliente de la venta', {
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
      $.notify('Seleccione la fecha de la venta', {
        type: 'danger',
        spacing: 10,
        timer: 2000,
        placement: { from: 'top', align: 'right' },
        delay: 1000,
        animate: { enter: 'animated bounce', exit: 'animated bounce' },
      });
      return false;
    }

    if (!this.selectedTipoVenta) {
      $.notify('Seleccione el tipo de venta (Contado / Crédito)', {
        type: 'danger',
        spacing: 10,
        timer: 2000,
        placement: { from: 'top', align: 'right' },
        delay: 1000,
        animate: { enter: 'animated bounce', exit: 'animated bounce' },
      });
      return false;
    }

    if (this.selectedTipoVenta === 'CONTADO' && !this.selectedMetodoPagoId) {
      $.notify('Seleccione el método de pago para la venta de contado', {
        type: 'danger',
        spacing: 10,
        timer: 2000,
        placement: { from: 'top', align: 'right' },
        delay: 1000,
        animate: { enter: 'animated bounce', exit: 'animated bounce' },
      });
      return false;
    }

    if (!this.detalles || this.detalles.length === 0) {
      $.notify('Debe ingresar al menos una línea en el detalle', {
        type: 'danger',
        spacing: 10,
        timer: 2000,
        placement: { from: 'top', align: 'right' },
        delay: 1000,
        animate: { enter: 'animated bounce', exit: 'animated bounce' },
      });
      return false;
    }

    // Validar líneas
    for (let i = 0; i < this.detalles.length; i++) {
      const d = this.detalles[i];
      const idx = i + 1;

      if (d.errorStock) {
        $.notify(`La línea ${idx} tiene una cantidad mayor al stock disponible.`, {
          type: 'danger',
          spacing: 10,
          timer: 2000,
          placement: { from: 'top', align: 'right' },
          delay: 1000,
          animate: { enter: 'animated bounce', exit: 'animated bounce' },
        });
        return false;
      }

      if (!d.tipo_item) {
        $.notify(`Seleccione el tipo (BIEN/SERVICIO) en la línea ${idx}`, {
          type: 'danger',
          spacing: 10,
          timer: 2000,
          placement: { from: 'top', align: 'right' },
          delay: 1000,
          animate: { enter: 'animated bounce', exit: 'animated bounce' },
        });
        return false;
      }

      if (d.tipo_item === 'BIEN') {
        if (!d.producto_id) {
          $.notify(`Seleccione un producto en la línea ${idx}`, {
            type: 'danger',
            spacing: 10,
            timer: 2000,
            placement: { from: 'top', align: 'right' },
            delay: 1000,
            animate: { enter: 'animated bounce', exit: 'animated bounce' },
          });
          return false;
        }
        const cant = Number(d.cantidad) || 0;
        if (d.producto_stock != null && cant > d.producto_stock) {
          $.notify(
            `La cantidad en la línea ${idx} supera el stock disponible (${d.producto_stock}).`,
            {
              type: 'danger',
              spacing: 10,
              timer: 2000,
              placement: { from: 'top', align: 'right' },
              delay: 1000,
              animate: { enter: 'animated bounce', exit: 'animated bounce' },
            }
          );
          return false;
        }
      }

      if (d.tipo_item === 'SERVICIO') {
        if (!d.descripcion || d.descripcion.trim().length === 0) {
          $.notify(`Ingrese la descripción del servicio en la línea ${idx}`, {
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

      const cant = Number(d.cantidad) || 0;
      const precio = Number(d.precio_unitario) || 0;

      if (cant <= 0) {
        $.notify(`La cantidad en la línea ${idx} debe ser mayor a 0`, {
          type: 'danger',
          spacing: 10,
          timer: 2000,
          placement: { from: 'top', align: 'right' },
          delay: 1000,
          animate: { enter: 'animated bounce', exit: 'animated bounce' },
        });
        return false;
      }

      if (precio <= 0) {
        $.notify(`El precio en la línea ${idx} debe ser mayor a 0`, {
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

    if (this.total <= 0) {
      $.notify('El total de la venta debe ser mayor a 0', {
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

  // 👉 Guardar venta
  guardarVenta() {
    if (!this.validar()) return;

    const user = this.auth.getUser();

    const payload: any = {
      cliente_id: this.selectedClienteId,
      empresa_id: user?.empresa_id,
      fecha: this.fecha,
      observacion: this.observacion || null,
      tipo_venta: this.selectedTipoVenta,
      num_factura: this.num_factura || null,
      metodo_pago_id: this.selectedTipoVenta === 'CONTADO' ? this.selectedMetodoPagoId : null,
      detalles: this.detalles.map((d) => ({
        tipo_item: d.tipo_item,
        producto_id: d.tipo_item === 'BIEN' ? d.producto_id : null,
        descripcion: d.tipo_item === 'SERVICIO' ? d.descripcion : null,
        cantidad: Number(d.cantidad),
        precio_unitario: Number(d.precio_unitario),
        subtotal: Number(d.subtotal),
      })),
    };

    this.saving = true;

    this.ventaService.createVenta(payload).subscribe({
      next: (response) => {
        $.notify(response?.mensaje || 'Venta registrada correctamente', {
          type: 'success',
          spacing: 10,
          timer: 2000,
          placement: { from: 'top', align: 'right' },
          delay: 1000,
          animate: { enter: 'animated bounce', exit: 'animated bounce' },
        });

        this.saving = false;
        this.router.navigate(['/ventas']);
      },
      error: (err) => {
        console.error('Error al registrar venta', err);
        $.notify(
          err?.error?.mensaje || 'Error al registrar la venta',
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

  // 👉 Cancelar / volver
  cancelar() {
    this.router.navigate(['/ventas']);
  }
}
