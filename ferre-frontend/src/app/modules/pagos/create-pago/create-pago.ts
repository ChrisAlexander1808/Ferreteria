import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ClienteService } from '../../../core/services/cliente.service';
import { ProveedorService } from '../../../core/services/proveedor.service';
import { CxcService } from '../../../core/services/cxc.service';
import { CxpService } from '../../../core/services/cxp.service';
import { MetodoPagoService } from '../../../core/services/metodo-pago.service';
import { PagoService } from '../../../core/services/pago.service';

import { Cliente } from '../../../core/models/cliente.model';
import { Proveedor } from '../../../core/models/proveedor.model';
import { MetodoPago } from '../../../core/models/metodo-pago.model';
declare var $: any;

type OrigenPago = 'CXC' | 'CXP';

interface DocumentoPendiente {
  id: number;
  venta_id?: number | null;
  compra_id?: number | null;
  doc: string;
  fecha_emision: string;
  fecha_vencimiento?: string | null;
  estado: string;
  monto_total: number;
  saldo_pendiente: number;
}

interface LineaPago {
  doc_id: number | null;
  docLabel: string;

  fecha_emision?: string;
  fecha_vencimiento?: string | null;
  estado?: string;
  monto_total?: number;
  saldo_pendiente?: number;

  monto_aplicado: number | null;

  errorMonto?: boolean;
  errorMsg?: string;
}

@Component({
  selector: 'app-create-pago',
  standalone: false,
  templateUrl: './create-pago.html',
  styleUrl: './create-pago.scss',
})
export class CreatePago implements OnInit {
  canCreate = false;

  // Origen del pago
  origen: OrigenPago = 'CXC';

  // Cliente / Proveedor
  clientes: Cliente[] = [];
  proveedores: Proveedor[] = [];
  selectedClienteId: number | null = null;
  selectedProveedorId: number | null = null;

  // Cabecera de pago
  pagoMontoTotal: number | null = null;
  fecha_pago: string = '';
  referencia: string = '';
  observacion: string = '';

  metodosPago: MetodoPago[] = [];
  selectedMetodoPagoId: number | null = null;

  // Documentos pendientes (según origen + entidad)
  docsDisponibles: DocumentoPendiente[] = [];

  // Detalle que el usuario arma manualmente
  lineas: LineaPago[] = [];

  // Estado UI
  loadingData: boolean = true;
  loadingDocs: boolean = false;
  saving: boolean = false;

  constructor(
    private auth: AuthService,
    private router: Router,
    private clienteService: ClienteService,
    private proveedorService: ProveedorService,
    private cxcService: CxcService,
    private cxpService: CxpService,
    private metodoPagoService: MetodoPagoService,
    private pagoService: PagoService
  ) {}

  ngOnInit(): void {
    this.canCreate = this.auth.hasPermission('PAGOS_CREATE');

    if (!this.canCreate) {
      this.router.navigate(['/dashboard']);
      return;
    }

    const hoy = new Date();
    this.fecha_pago = hoy.toISOString().substring(0, 10);

    this.cargarDataInicial();
  }

  // 🔍 búsqueda por nombre/NIT cliente
  clienteSearchFn = (term: string, item: Cliente) => {
    if (!term) return true;
    term = term.toLowerCase();

    const nombre = (item.nombre || '').toLowerCase();
    const nit = (item as any).nit ? String((item as any).nit).toLowerCase() : '';

    return nombre.includes(term) || nit.includes(term);
  };

  // 🔍 búsqueda por nombre/NIT proveedor
  proveedorSearchFn = (term: string, item: Proveedor) => {
    if (!term) return true;
    term = term.toLowerCase();

    const nombre = (item.nombre || '').toLowerCase();
    const nit = (item as any).nit ? String((item as any).nit).toLowerCase() : '';

    return nombre.includes(term) || nit.includes(term);
  };

  cargarDataInicial() {
    this.loadingData = true;

    let clientesLoaded = false;
    let proveedoresLoaded = false;
    let metodosLoaded = false;

    const checkFinish = () => {
      if (clientesLoaded && proveedoresLoaded && metodosLoaded) {
        this.loadingData = false;
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

    // Proveedores
    this.proveedorService.getAllProveedores().subscribe({
      next: (res) => {
        this.proveedores = res.data || [];
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

  // Cambiar origen CXC/CXP
  setOrigen(origen: OrigenPago) {
    if (this.origen === origen) return;

    this.origen = origen;

    // Reset entidad y documentos
    this.selectedClienteId = null;
    this.selectedProveedorId = null;
    this.docsDisponibles = [];
    this.lineas = [];
  }

  // Cuando cambia cliente/proveedor
  onEntidadChange() {
    this.docsDisponibles = [];
    this.lineas = [];

    const entidadId =
      this.origen === 'CXC' ? this.selectedClienteId : this.selectedProveedorId;

    if (!entidadId) return;

    this.loadingDocs = true;

    if (this.origen === 'CXC') {
      const params: any = {
        cliente_id: entidadId,
      };
      
      this.cxcService.getAllCxc(params).subscribe({
        next: (res) => {
          const data = res.data || [];

          const filtrados = data.filter((cxc: any) => {
          const saldo = Number(cxc.saldo_pendiente) || 0;
          return saldo > 0.01 && cxc.estado !== 'ANULADA';
        });

          this.docsDisponibles = filtrados.map((cxc: any) => ({
            id: cxc.id,
            venta_id: cxc.venta?.id ?? cxc.venta_id ?? null,  // 👈 para mostrar
            compra_id: null, 
            doc: cxc.venta?.numero_factura
              ? cxc.venta.numero_factura
              : `VEN-${cxc.venta_id}`,
            fecha_emision: cxc.fecha_emision,
            fecha_vencimiento: cxc.fecha_vencimiento || null,
            estado: cxc.estado,
            monto_total: Number(cxc.monto_total),
            saldo_pendiente: Number(cxc.saldo_pendiente),
          }));
          this.loadingDocs = false;
        },
        error: (err) => {
          console.error('Error al obtener CxC del cliente', err);
          $.notify('Error al obtener cuentas por cobrar del cliente', {
            type: 'danger',
            spacing: 10,
            timer: 2000,
            placement: { from: 'top', align: 'right' },
            delay: 1000,
            animate: { enter: 'animated bounce', exit: 'animated bounce' },
          });
          this.loadingDocs = false;
        },
      });
    } else {
      // CXP
      const params: any = {
        proveedor_id: entidadId,
      };

      this.cxpService.getAllCXP(params).subscribe({
        next: (res) => {
          const data = res.data || [];

          const filtrados = data.filter((cxc: any) => {
          const saldo = Number(cxc.saldo_pendiente) || 0;
          return saldo > 0.01 && cxc.estado !== 'ANULADA';
        });

          this.docsDisponibles = filtrados.map((cxp: any) => ({
            id: cxp.id,
            venta_id: null,                                  // no aplica en CxP
            compra_id: cxp.compra?.id ?? cxp.compra_id ?? null,
            doc: cxp.compra?.numero_factura
              ? cxp.compra.numero_factura
              : `COMP-${cxp.compra_id}`,
            fecha_emision: cxp.fecha_emision,
            fecha_vencimiento: cxp.fecha_vencimiento || null,
            estado: cxp.estado,
            monto_total: Number(cxp.monto_total),
            saldo_pendiente: Number(cxp.saldo_pendiente),
          }));
          this.loadingDocs = false;
        },
        error: (err) => {
          console.error('Error al obtener CxP del proveedor', err);
          $.notify('Error al obtener cuentas por pagar del proveedor', {
            type: 'danger',
            spacing: 10,
            timer: 2000,
            placement: { from: 'top', align: 'right' },
            delay: 1000,
            animate: { enter: 'animated bounce', exit: 'animated bounce' },
          });
          this.loadingDocs = false;
        },
      });
    }
  }

  // Documentos disponibles para una línea, evitando duplicados
  getDocsDisponiblesParaLinea(linea: LineaPago): DocumentoPendiente[] {
    const usados = this.lineas
      .filter((l) => l !== linea && l.doc_id != null)
      .map((l) => l.doc_id);

    return this.docsDisponibles.filter(
      (d) => !usados.includes(d.id) || d.id === linea.doc_id
    );
  }

  // Agregar línea manualmente
  addLinea() {
    if (!this.origenEntidadSeleccionadaValida()) {
      $.notify('Seleccione primero el cliente o proveedor.', {
        type: 'warning',
        spacing: 10,
        timer: 2000,
        placement: { from: 'top', align: 'right' },
        delay: 1000,
        animate: { enter: 'animated bounce', exit: 'animated bounce' },
      });
      return;
    }

    if (!this.docsDisponibles || this.docsDisponibles.length === 0) {
      $.notify('La entidad seleccionada no tiene documentos pendientes.', {
        type: 'warning',
        spacing: 10,
        timer: 2000,
        placement: { from: 'top', align: 'right' },
        delay: 1000,
        animate: { enter: 'animated bounce', exit: 'animated bounce' },
      });
      return;
    }

    this.lineas.push({
      doc_id: null,
      docLabel: '',
      fecha_emision: undefined,
      fecha_vencimiento: undefined,
      estado: undefined,
      monto_total: undefined,
      saldo_pendiente: undefined,
      monto_aplicado: null,
      errorMonto: false,
      errorMsg: '',
    });
  }

  removeLinea(index: number) {
    this.lineas.splice(index, 1);
  }

  // Cuando seleccionan un documento en una línea
  onDocumentoChange(linea: LineaPago) {
    if (!linea.doc_id) {
      linea.docLabel = '';
      linea.fecha_emision = undefined;
      linea.fecha_vencimiento = undefined;
      linea.estado = undefined;
      linea.monto_total = undefined;
      linea.saldo_pendiente = undefined;
      linea.monto_aplicado = null;
      linea.errorMonto = false;
      linea.errorMsg = '';
      return;
    }

    const doc = this.docsDisponibles.find((d) => d.id === linea.doc_id);
    if (!doc) return;

    linea.docLabel = doc.doc;
    linea.fecha_emision = doc.fecha_emision;
    linea.fecha_vencimiento = doc.fecha_vencimiento;
    linea.estado = doc.estado;
    linea.monto_total = doc.monto_total;
    linea.saldo_pendiente = doc.saldo_pendiente;

    // Sugerir por defecto el saldo completo
    linea.monto_aplicado = doc.saldo_pendiente;
    this.onMontoChange(linea);
  }

  // Cambio en monto aplicado
  onMontoChange(linea: LineaPago) {
    const saldo = Number(linea.saldo_pendiente) || 0;
    let monto = Number(linea.monto_aplicado) || 0;

    linea.errorMonto = false;
    linea.errorMsg = '';

    if (monto < 0) {
      linea.errorMonto = true;
      linea.errorMsg = 'El monto no puede ser negativo.';
      linea.monto_aplicado = 0;
      return;
    }

    if (monto > saldo) {
      linea.errorMonto = true;
      linea.errorMsg = `No puede exceder el saldo pendiente (${saldo}).`;
      linea.monto_aplicado = saldo;
      return;
    }

    // Validación contra monto total de pago (no exceder)
    const totalAplicadoSinEsta = this.lineas.reduce((acc, l) => {
      if (l === linea) return acc;
      return acc + (Number(l.monto_aplicado) || 0);
    }, 0);

    const totalConEsta = totalAplicadoSinEsta + monto;
    const pagoTotal = Number(this.pagoMontoTotal) || 0;

    if (pagoTotal > 0 && totalConEsta > pagoTotal + 0.01) {
      linea.errorMonto = true;
      linea.errorMsg = `La suma de montos aplicados excede el monto total del pago (${pagoTotal}).`;
      linea.monto_aplicado = Number(linea.monto_aplicado) || 0;
      return;
    }

    // Todo bien
    linea.monto_aplicado = monto;
  }

  // Total aplicado
  get totalAplicado(): number {
    return this.lineas.reduce(
      (acc, l) => acc + (Number(l.monto_aplicado) || 0),
      0
    );
  }

  get diffTotalPago(): number {
    const pagoTotal = Number(this.pagoMontoTotal) || 0;
    return Math.abs(this.totalAplicado - pagoTotal);
  }

  private origenEntidadSeleccionadaValida(): boolean {
    if (this.origen === 'CXC') {
      return !!this.selectedClienteId;
    } else {
      return !!this.selectedProveedorId;
    }
  }

  // 👉 Validar antes de guardar
  validar(): boolean {
    if (!this.origen) {
      $.notify('Seleccione el origen del pago (CxC o CxP).', {
        type: 'danger',
        spacing: 10,
        timer: 2000,
        placement: { from: 'top', align: 'right' },
        delay: 1000,
        animate: { enter: 'animated bounce', exit: 'animated bounce' },
      });
      return false;
    }

    if (!this.origenEntidadSeleccionadaValida()) {
      $.notify(
        this.origen === 'CXC'
          ? 'Seleccione el cliente del pago.'
          : 'Seleccione el proveedor del pago.',
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

    if (!this.fecha_pago) {
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

    if (!this.selectedMetodoPagoId) {
      $.notify('Seleccione el método de pago', {
        type: 'danger',
        spacing: 10,
        timer: 2000,
        placement: { from: 'top', align: 'right' },
        delay: 1000,
        animate: { enter: 'animated bounce', exit: 'animated bounce' },
      });
      return false;
    }

    const pagoTotal = Number(this.pagoMontoTotal) || 0;
    if (pagoTotal <= 0) {
      $.notify('Ingrese el monto total del pago (mayor a 0).', {
        type: 'danger',
        spacing: 10,
        timer: 2000,
        placement: { from: 'top', align: 'right' },
        delay: 1000,
        animate: { enter: 'animated bounce', exit: 'animated bounce' },
      });
      return false;
    }

    if (!this.lineas || this.lineas.length === 0) {
      $.notify('Agregue al menos una factura/documento al detalle.', {
        type: 'danger',
        spacing: 10,
        timer: 2000,
        placement: { from: 'top', align: 'right' },
        delay: 1000,
        animate: { enter: 'animated bounce', exit: 'animated bounce' },
      });
      return false;
    }

    const lineasConDocYMonto = this.lineas.filter(
      (l) => l.doc_id && Number(l.monto_aplicado) > 0
    );

    if (lineasConDocYMonto.length === 0) {
      $.notify('Debe seleccionar documentos y montos aplicados mayores a 0.', {
        type: 'danger',
        spacing: 10,
        timer: 2000,
        placement: { from: 'top', align: 'right' },
        delay: 1000,
        animate: { enter: 'animated bounce', exit: 'animated bounce' },
      });
      return false;
    }

    for (let i = 0; i < this.lineas.length; i++) {
      const l = this.lineas[i];
      if (l.errorMonto) {
        $.notify(`La línea ${i + 1} tiene errores de monto.`, {
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

    const totalAplicado = this.totalAplicado;
    if (totalAplicado <= 0) {
      $.notify('El total aplicado debe ser mayor a 0.', {
        type: 'danger',
        spacing: 10,
        timer: 2000,
        placement: { from: 'top', align: 'right' },
        delay: 1000,
        animate: { enter: 'animated bounce', exit: 'animated bounce' },
      });
      return false;
    }

    const diff = Math.abs(totalAplicado - pagoTotal);
    if (diff > 0.01) {
      $.notify(
        `La suma de montos aplicados (${totalAplicado.toFixed(
          2
        )}) debe ser igual al monto total del pago (${pagoTotal.toFixed(2)}).`,
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

    return true;
  }

  guardarPago() {
    if (!this.validar()) return;

    const origen = this.origen;
    const cliente_id = origen === 'CXC' ? this.selectedClienteId : null;
    const proveedor_id = origen === 'CXP' ? this.selectedProveedorId : null;

    const detalles = this.lineas
      .filter((l) => l.doc_id && Number(l.monto_aplicado) > 0)
      .map((l) => ({
        cxc_id: origen === 'CXC' ? l.doc_id : null,
        cxp_id: origen === 'CXP' ? l.doc_id : null,
        monto_aplicado: Number(l.monto_aplicado),
      }));

    const totalAplicado = this.totalAplicado;

    const payload: any = {
      origen,
      cliente_id,
      proveedor_id,
      tipo_documento: 'PAGO',
      metodo_pago_id: this.selectedMetodoPagoId,
      fecha_pago: this.fecha_pago,
      monto_total: totalAplicado, // coincide con suma de detalles
      observacion: this.observacion || null,
      referencia: this.referencia || null,
      detalles,
    };

    this.saving = true;

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

        this.saving = false;
        this.router.navigate(['/pagos']);
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
        this.saving = false;
      },
    });
  }

  cancelar() {
    this.router.navigate(['/pagos']);
  }
}
