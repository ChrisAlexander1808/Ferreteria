import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CxcService } from '../../../core/services/cxc.service';
import { ClienteService } from '../../../core/services/cliente.service';
import { Cliente } from '../../../core/models/cliente.model';
import { MetodoPagoService } from '../../../core/services/metodo-pago.service'; // 🔹 NUEVO
import { PagoService } from '../../../core/services/pago.service';              // 🔹 NUEVO
import { MetodoPago } from '../../../core/models/metodo-pago.model';           // 🔹 NUEVO
declare var $: any;

export interface CuentaPorCobrar {
  id: number;
  venta_id: number;
  cliente_id: number;
  empresa_id: number;
  fecha_emision: string;
  fecha_vencimiento: string | null;
  monto_total: number;
  saldo_pendiente: number;
  estado: 'PENDIENTE' | 'PARCIAL' | 'PAGADA' | 'ANULADA' | 'VENCIDA';
  cliente?: Cliente;
  // venta?: any; // si la incluyes en el include del backend

  venta?: {
    id: number;
    fecha: string;
    numero_factura: string | null;
    tipo_venta: string;
    total: number | string;
  };

  // Si quieres, también lo que ya devuelve pagos_aplicados
  pagos_aplicados?: any[];
}

@Component({
  selector: 'app-index-cxc',
  standalone: false,
  templateUrl: './index-cxc.html',
  styleUrl: './index-cxc.scss',
})
export class IndexCxc implements OnInit {

  // Permisos
  canRead = false;
  canCreatePago = false; // para el botón "Aplicar pago"

  // Estado UI
  load_data: boolean = true;
  loadingPago = false; 
  filtro_cliente = '';
  filtro_fecha_desde: string = '';
  filtro_fecha_hasta: string = '';

  // Datos
  cxc_list: CuentaPorCobrar[] = [];
  cxc_const: CuentaPorCobrar[] = [];

  metodosPago: MetodoPago[] = [];
  cxcSeleccionadaParaPago: CuentaPorCobrar | null = null;

  pagoFecha: string = '';
  pagoMetodoId: number | null = null;
  pagoReferencia: string = '';
  pagoObservacion: string = '';
  pagoMonto: number = 0;

  // Clientes (para filtros)
  clientes: Cliente[] = [];
  filtro_cliente_id: number | null = null;

  // Filtros
  filtro_estado: string = 'TODOS'; // PENDIENTE | PARCIAL | PAGADA | ANULADA | VENCIDA | TODOS
  filtro_texto: string = '';

  // Paginación
  page: number = 1;
  pageSize: number = 10;

  detalleCxc: any = null;
  loadingDetalle = false;


  constructor(
    private auth: AuthService,
    private router: Router,
    private cxcService: CxcService,
    private clienteService: ClienteService,
    private metodoPagoService: MetodoPagoService, // 🔹
    private pagoService: PagoService 
  ) {}

  ngOnInit(): void {
    this.canRead = this.auth.hasPermission('CXC_READ');
    this.canCreatePago = this.auth.hasPermission('PAGOS_CREATE');

    if (!this.canRead) {
      this.router.navigate(['/dashboard']);
      return;
    }

    const hoy = new Date();
    this.pagoFecha = hoy.toISOString().substring(0, 10);

    this.cargarClientes();
    this.init_cxc();
    this.init_metodos_pago(); // 🔹
  }

  // 🔍 búsqueda por nombre o NIT en el ng-select
  clienteSearchFn = (term: string, item: Cliente) => {
    if (!term) return true;
    term = term.toLowerCase();
    const nombre = (item.nombre || '').toLowerCase();
    const nit = (item as any).nit ? String((item as any).nit).toLowerCase() : '';
    return nombre.includes(term) || nit.includes(term);
  };

  cargarClientes() {
    this.clienteService.getAllClientes().subscribe({
      next: (res) => {
        this.clientes = res.data || [];
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
      },
    });
  }

  // Cargar CxC desde el backend con filtros de cliente/estado
  init_cxc() {
    this.load_data = true;

    const params: any = {};
    if (this.filtro_cliente_id) {
      params.cliente_id = this.filtro_cliente_id;
    }
    if (this.filtro_estado && this.filtro_estado !== 'TODOS') {
      params.estado = this.filtro_estado;
    }

    this.cxcService.getAllCxc(params).subscribe({
      next: (res) => {
        const data = res.data || res || [];
        this.cxc_const = data;
        // Aplicar filtro de texto sobre la copia
        this.aplicarFiltroTexto();
        this.load_data = false;
      },
      error: (err) => {
        console.error('Error al obtener cuentas por cobrar', err);
        $.notify('Error al obtener cuentas por cobrar', {
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

  // Cuando cambia cliente o estado
  onChangeFiltros() {
    this.page = 1;
    this.init_cxc();
  }

  // Buscar por texto (cliente, NIT, id, venta_id)
  filtrarTexto() {
    this.page = 1;
    this.aplicarFiltroTexto();
  }

  private aplicarFiltroTexto() {
    if (!this.filtro_texto) {
      this.cxc_list = [...this.cxc_const];
      return;
    }

    const term = this.filtro_texto.toLowerCase();

    this.cxc_list = this.cxc_const.filter((c) => {
      const idStr = String(c.id || '').toLowerCase();
      const ventaStr = String(c.venta_id || '').toLowerCase();
      const clienteNombre = (c.cliente?.nombre || '').toLowerCase();
      const clienteNit = (c.cliente as any)?.nit
        ? String((c.cliente as any).nit).toLowerCase()
        : '';

      return (
        idStr.includes(term) ||
        ventaStr.includes(term) ||
        clienteNombre.includes(term) ||
        clienteNit.includes(term)
      );
    });
  }

  limpiarFiltros() {
    this.filtro_cliente_id = null;
    this.filtro_estado = 'TODOS';
    this.filtro_texto = '';
    this.page = 1;
    this.init_cxc();
  }

  // 📊 Resumenes
  get totalDocumentos(): number {
    return this.cxc_const.length;
  }

  get saldoPendienteTotal(): number {
    // sumamos solo PENDIENTE, PARCIAL y VENCIDA
    return this.cxc_const
      .filter((c) => ['PENDIENTE', 'PARCIAL', 'VENCIDA'].includes(c.estado))
      .reduce((acc, c) => acc + Number(c.saldo_pendiente || 0), 0);
  }

  get totalVencidas(): number {
    return this.cxc_const.filter((c) => c.estado === 'VENCIDA').length;
  }

  get totalPagadas(): number {
    return this.cxc_const.filter((c) => c.estado === 'PAGADA').length;
  }

  get saldoPendienteSeleccionado(): number {
  if (!this.cxcSeleccionadaParaPago) {
    return 0;
  }

  // Por si viene como string desde el backend
  const raw = (this.cxcSeleccionadaParaPago as any).saldo_pendiente;
  const num = Number(raw);
  return isNaN(num) ? 0 : num;
}

  // 👉 Navegar a detalle (si luego creas el componente)
  ver_detalle(cxc: CuentaPorCobrar) {
  this.loadingDetalle = true;
  this.detalleCxc = null;

  $('#detalleCxcModal').modal('show');

  this.cxcService.getCxcById(cxc.id).subscribe({
    next: (res) => {
      this.detalleCxc = res.data;
      this.loadingDetalle = false;
    },
    error: (err) => {
      console.error('Error al obtener detalle CxC', err);
      $.notify('Error al obtener detalle de la cuenta', {
        type: 'danger',
        spacing: 10,
        timer: 2000,
        placement: { from: 'top', align: 'right' },
        delay: 1000,
        animate: { enter: 'animated bounce', exit: 'animated bounce' },
      });
      this.loadingDetalle = false;
    },
  });
}


  // 👉 Abrir modal "Aplicar pago" (lo armamos en el siguiente paso)
    openAplicarPago(cxc: CuentaPorCobrar) {
      if (!this.canCreatePago) {
        $.notify('No tiene permiso para registrar pagos.', {
          type: 'danger',
          spacing: 10,
          timer: 2000,
          placement: { from: 'top', align: 'right' },
          delay: 1000,
          animate: { enter: 'animated bounce', exit: 'animated bounce' },
        });
        return;
      }

      // Aquí luego mostramos el modal y le pasamos la CxC seleccionada
      $.notify(`Aplicar pago a CxC #${cxc.id} (pendiente implementar modal)`, {
        type: 'info',
        spacing: 10,
        timer: 2000,
        placement: { from: 'top', align: 'right' },
        delay: 1000,
        animate: { enter: 'animated bounce', exit: 'animated bounce' },
      });
    }

    getNit(c: any): string {
    if (c && c.cliente) {
      const nit = (c.cliente as any).nit;
      if (nit && nit !== '') {
        return nit;
      }
    }
    return 'CF';
  }

   // 🔹 Cargar métodos de pago
  init_metodos_pago() {
    this.metodoPagoService.getAllMetodosPago().subscribe({
      next: (res) => {
        this.metodosPago = res.data || res || [];
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
      },
    });
  }


  // 🔹 Abrir modal de aplicar pago a UNA CxC
  abrir_modal_pago(cxc: CuentaPorCobrar) {
    if (!this.canCreatePago) {
      $.notify('No tiene permiso para aplicar pagos', {
        type: 'danger',
        spacing: 10,
        timer: 2000,
        placement: { from: 'top', align: 'right' },
        delay: 1000,
        animate: { enter: 'animated bounce', exit: 'animated bounce' },
      });
      return;
    }

    this.cxcSeleccionadaParaPago = cxc;

    // Valores por defecto
    const hoy = new Date();
    this.pagoFecha = hoy.toISOString().substring(0, 10);
    this.pagoMetodoId = null;
    this.pagoReferencia = '';
    this.pagoObservacion = `Pago aplicado a CxC #${cxc.id}`;
    this.pagoMonto = Number(cxc.saldo_pendiente || 0);

    $('#modalAplicarPago').modal('show');
  }

  // 🔹 Validar antes de enviar al backend
  validarPago(): boolean {
    if (!this.cxcSeleccionadaParaPago) {
      $.notify('No se encontró la cuenta seleccionada para pago', {
        type: 'danger',
        spacing: 10,
        timer: 2000,
        placement: { from: 'top', align: 'right' },
        delay: 1000,
        animate: { enter: 'animated bounce', exit: 'animated bounce' },
      });
      return false;
    }

    if (!this.pagoFecha) {
      $.notify('Seleccione la fecha del pago', {
        type: 'danger',
        spacing: 10,
        timer: 2000,
        placement: { from: 'top', align: 'right' },
        delay: 1000,
        animate: { enter: 'animated bounce', exit: 'animated bounce' },
      });
      return false;
    }

    if (!this.pagoMetodoId) {
      $.notify('Seleccione un método de pago', {
        type: 'danger',
        spacing: 10,
        timer: 2000,
        placement: { from: 'top', align: 'right' },
        delay: 1000,
        animate: { enter: 'animated bounce', exit: 'animated bounce' },
      });
      return false;
    }

    const saldo = Number(this.cxcSeleccionadaParaPago.saldo_pendiente || 0);
    const monto = Number(this.pagoMonto || 0);

    if (monto <= 0) {
      $.notify('El monto a pagar debe ser mayor a 0', {
        type: 'danger',
        spacing: 10,
        timer: 2000,
        placement: { from: 'top', align: 'right' },
        delay: 1000,
        animate: { enter: 'animated bounce', exit: 'animated bounce' },
      });
      return false;
    }

    if (monto > saldo) {
      $.notify(`El monto a pagar (${monto}) no puede ser mayor al saldo pendiente (${saldo})`, {
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

  // 🔹 Enviar pago al backend
  aplicarPago() {
    if (!this.validarPago()) return;
    if (!this.cxcSeleccionadaParaPago) return;

    const cxc = this.cxcSeleccionadaParaPago;
    const user = this.auth.getUser();
    const monto = Number(this.pagoMonto || 0);

    const payload = {
      origen: 'CXC',                         // muy importante para el backend
      cliente_id: cxc.cliente_id,           // CxC es de un cliente
      proveedor_id: null,
      tipo_documento: 'PAGO',
      metodo_pago_id: this.pagoMetodoId,
      fecha_pago: this.pagoFecha,
      monto_total: monto,
      observacion: this.pagoObservacion || null,
      referencia: this.pagoReferencia || null,
      detalles: [
        {
          cxc_id: cxc.id,
          monto_aplicado: monto,
        },
      ],
    };

    this.loadingPago = true;

    this.pagoService.createPago(payload).subscribe({
      next: (res) => {
        $.notify(res?.mensaje || 'Pago registrado correctamente', {
          type: 'success',
          spacing: 10,
          timer: 2000,
          placement: { from: 'top', align: 'right' },
          delay: 1000,
          animate: { enter: 'animated bounce', exit: 'animated bounce' },
        });

        $('#modalAplicarPago').modal('hide');
        this.loadingPago = false;
        this.cxcSeleccionadaParaPago = null;

        // Refrescar listado y si quieres, el detalle
        this.init_cxc();
      },
      error: (err) => {
        console.error('Error al registrar pago', err);
        $.notify(
          err?.error?.mensaje || 'Error al registrar el pago',
          {
            type: 'danger',
            spacing: 10,
            timer: 2000,
            placement: { from: 'top', align: 'right' },
            delay: 1000,
            animate: { enter: 'animated bounce', exit: 'animated bounce' },
          }
        );
        this.loadingPago = false;
      },
    });
  }
}