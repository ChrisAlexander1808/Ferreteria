import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { Pago, ResumenPagos } from '../../../core/models/pago.model';
import { PagoService } from '../../../core/services/pago.service';
declare var $: any;

@Component({
  selector: 'app-index-pago',
  standalone: false,
  templateUrl: './index-pago.html',
  styleUrl: './index-pago.scss',
})
export class IndexPago implements OnInit {
  // Permisos
  canRead = false;
  canCreate = false;
  canCancel = false;

  // Estado UI
  load_data = true;
  load_detalle = true;
  load_cancel = true;

  // Filtros
  filtro_origen: string = ''; // '', 'CXC', 'CXP', 'CC', 'CP'
  filtro_fecha_desde: string = '';
  filtro_fecha_hasta: string = '';
  filtro_texto: string = '';

  // Datos
  pagos: Pago[] = [];
  pagos_const: Pago[] = [];

  resumen: ResumenPagos = {
    CXC: { cantidad: 0, total: 0 },
    CXP: { cantidad: 0, total: 0 },
    CC: { cantidad: 0, total: 0 },
    CP: { cantidad: 0, total: 0 },
    global: { cantidad: 0, total: 0 },
  };

  // Detalle
  detallePago: Pago | null = null;

  constructor(
    private auth: AuthService,
    private router: Router,
    private pagoService: PagoService
  ) {}

  ngOnInit(): void {
    this.canRead = this.auth.hasPermission('PAGOS_VIEW');
    this.canCreate = this.auth.hasPermission('PAGOS_CREATE');
    this.canCancel = this.auth.hasPermission('PAGOS_CANCEL');

    if (!this.canRead) {
      this.router.navigate(['/dashboard']);
      return;
    }

    // Rango de fechas por defecto: últimos 30 días
    const hoy = new Date();
    const hace30 = new Date();
    hace30.setDate(hace30.getDate() - 30);

    this.filtro_fecha_hasta = hoy.toISOString().substring(0, 10);
    this.filtro_fecha_desde = hace30.toISOString().substring(0, 10);

    this.init_pagos();
  }

  // Cargar pagos según filtros
  init_pagos() {
    this.load_data = true;

    const filtros: any = {
      origen: this.filtro_origen || undefined,
      fecha_desde: this.filtro_fecha_desde || undefined,
      fecha_hasta: this.filtro_fecha_hasta || undefined,
    };

    this.pagoService.getAllPagos(filtros).subscribe({
      next: (res) => {
        this.pagos = res.data || [];
        this.pagos_const = [...this.pagos];
        this.resumen = res.resumen || this.resumen;
        this.aplicarFiltroTexto();
        this.load_data = false;
      },
      error: (err) => {
        console.error('Error al obtener pagos', err);
        $.notify('Error al obtener pagos', {
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

  // Limpiar filtros
  limpiar_filtros() {
    this.filtro_origen = '';
    this.filtro_texto = '';

    const hoy = new Date();
    const hace30 = new Date();
    hace30.setDate(hace30.getDate() - 30);
    this.filtro_fecha_hasta = hoy.toISOString().substring(0, 10);
    this.filtro_fecha_desde = hace30.toISOString().substring(0, 10);

    this.init_pagos();
  }

  // Filtro de texto en memoria
  aplicarFiltroTexto() {
    if (!this.filtro_texto) {
      this.pagos = [...this.pagos_const];
      return;
    }

    const term = new RegExp(this.filtro_texto, 'i');

    this.pagos = this.pagos_const.filter((p) => {
      const origen = p.origen || '';
      const metodo = p.metodo_pago?.nombre || '';
      const ref = p.referencia || '';
      const obs = p.observacion || '';
      // Podrías incluir cliente/proveedor si los incluyes en el backend
      return (
        term.test(origen) ||
        term.test(metodo) ||
        term.test(ref) ||
        term.test(obs)
      );
    });
  }

  // Abrir modal de detalle
  ver_detalle(pago: Pago) {
    this.load_detalle = true;
    this.detallePago = null;
    $('#detallePagoModal').modal('show');

    this.pagoService.getPagoById(pago.id).subscribe({
      next: (res) => {
        this.detallePago = res.data;
        this.load_detalle = false;
      },
      error: (err) => {
        console.error('Error al obtener detalle pago', err);
        $.notify('Error al obtener detalle del pago', {
          type: 'danger',
          spacing: 10,
          timer: 2000,
          placement: { from: 'top', align: 'right' },
          delay: 1000,
          animate: { enter: 'animated bounce', exit: 'animated bounce' },
        });
        this.load_detalle = false;
      },
    });
  }

  // Anular pago
  open_modal_anular(pago: Pago) {
    if (!this.canCancel) return;
    $('#anularPago-' + pago.id).modal('show');
  }

  anular_pago(pago: Pago) {
    if (!this.canCancel) return;

    this.load_cancel = false;

    this.pagoService.anularPago(pago.id).subscribe({
      next: (res) => {
        $.notify(res?.mensaje || 'Pago anulado correctamente', {
          type: 'success',
          spacing: 10,
          timer: 2000,
          placement: { from: 'top', align: 'right' },
          delay: 1000,
          animate: { enter: 'animated bounce', exit: 'animated bounce' },
        });

        $('#anularPago-' + pago.id).modal('hide');
        this.init_pagos();
        this.load_cancel = true;
      },
      error: (err) => {
        console.error('Error al anular pago', err);
        $.notify(
          err?.error?.mensaje || 'Error al anular pago',
          {
            type: 'danger',
            spacing: 10,
            timer: 2000,
            placement: { from: 'top', align: 'right' },
            delay: 1000,
            animate: { enter: 'animated bounce', exit: 'animated bounce' },
          }
        );
        this.load_cancel = true;
      },
    });
  }

  // Helper para badge de estado
  getEstadoBadgeClass(estado: string): string {
    if (estado === 'ANULADO') {
      return 'badge badge-danger';
    }
    return 'badge badge-success';
  }

  // Helper para badge de origen
  getOrigenBadgeClass(origen: string): string {
    switch (origen) {
      case 'CXC':
        return 'badge badge-primary';
      case 'CXP':
        return 'badge badge-warning';
      case 'CC':
        return 'badge badge-info';
      case 'CP':
        return 'badge badge-secondary';
      default:
        return 'badge badge-light';
    }
  }
}