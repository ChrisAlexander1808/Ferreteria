import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { Compra, EstadoCompra } from '../../../core/models/compra.model';
import { CompraService } from '../../../core/services/compra.service';
import { Proveedor } from '../../../core/models/proveedor.model';
import { ProveedorService } from '../../../core/services/proveedor.service';

declare var $: any;

@Component({
  selector: 'app-index-compra',
  standalone: false,
  templateUrl: './index-compra.html',
  styleUrl: './index-compra.scss',
})
export class IndexCompra implements OnInit {
  canView = false;
  canCreate = false;
  canCancel = false;

  // Data
  compras: Compra[] = [];

  // Filtros
  searchProveedor: string = '';
  fecha_desde: string = '';
  fecha_hasta: string = '';

  // Estado UI
  load_data: boolean = true;
  load_cancel: boolean = true;

  // Detalle
  compraSeleccionada: Compra | null = null;
  loadingDetalle: boolean = false;

  // Resumen
  resumen = {
    totalRegistros: 0,
    totalCompras: 0,
    totalContado: 0,
    totalCredito: 0,
  };

  constructor(
    private auth: AuthService,
    private router: Router,
    private compraService: CompraService
  ) {}

  ngOnInit(): void {
    this.canView = this.auth.hasPermission('COMPRAS_VIEW');
    this.canCreate = this.auth.hasPermission('COMPRAS_CREATE');
    this.canCancel = this.auth.hasPermission('COMPRAS_ANULAR');

    if (!this.canView) {
      this.router.navigate(['/dashboard']);
      return;
    }

    // Rango por defecto: hoy y un mes atrás
    const hoy = new Date();
    this.fecha_hasta = hoy.toISOString().substring(0, 10);
    const hace30 = new Date();
    hace30.setDate(hace30.getDate() - 30);
    this.fecha_desde = hace30.toISOString().substring(0, 10);

    this.init_compras();
  }

  // 🔍 Lista filtrada por nombre de proveedor (keyup)
  get comprasFiltradas(): Compra[] {
    const term = (this.searchProveedor || '').toLowerCase().trim();

    if (!term) return this.compras;

    return this.compras.filter((c) => {
      const nombreProv = (c.proveedor?.nombre || '').toLowerCase();
      const nitProv = (c.proveedor?.nit || '').toLowerCase();
      return nombreProv.includes(term) || nitProv.includes(term);
    });
  }

  init_compras() {
    this.load_data = true;

    const params: any = {};
    if (this.fecha_desde) {
      params.fecha_desde = this.fecha_desde;
    }
    if (this.fecha_hasta) {
      params.fecha_hasta = this.fecha_hasta;
    }

    this.compraService.getAllCompras(params).subscribe({
      next: (res) => {
        this.compras = res.data || res || [];
        this.calcularResumen();
        this.load_data = false;
      },
      error: (err) => {
        console.error('Error al obtener compras', err);
        $.notify('Error al obtener compras', {
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

  calcularResumen() {
    let totalCompras = 0;
    let totalContado = 0;
    let totalCredito = 0;

    this.compras.forEach((c) => {
      const total = Number(c.total) || 0;
      if (c.estado === 'ACTIVA') {
        totalCompras += total;
      }      

      if (c.tipo_compra === 'CONTADO' && c.estado === 'ACTIVA') {
        totalContado += total;
      } else if (c.tipo_compra === 'CREDITO' && c.estado === 'ACTIVA') {
        totalCredito += total;
      }
    });

    this.resumen = {
      totalRegistros: this.compras.length,
      totalCompras,
      totalContado,
      totalCredito,
    };
  }

  // Navegar a crear compra
  nueva_compra() {
    if (!this.canCreate) return;
    this.router.navigate(['/compras/create']);
  }

  // Ver detalle (modal)
  ver_detalle(compra: Compra) {
    this.compraSeleccionada = null;
    this.loadingDetalle = true;

    $('#detalleCompraModal').modal('show');

    this.compraService.getCompraById(compra.id).subscribe({
      next: (res) => {
        this.compraSeleccionada = res.data || res;
        this.loadingDetalle = false;
      },
      error: (err) => {
        console.error('Error al obtener detalle de compra', err);
        $.notify('Error al obtener detalle de la compra', {
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

  // Abrir modal anular
  open_modal_anular(c: Compra) {
    if (!this.canCancel || c.estado === 'ANULADA') return;
    $('#anularCompra-' + c.id).modal('show');
  }

  // Anular compra
  anular_compra(c: Compra) {
    if (!this.canCancel) return;

    this.load_cancel = false;

    this.compraService.anularCompra(c.id).subscribe({
      next: (res) => {
        $.notify(res?.mensaje || 'Compra anulada correctamente', {
          type: 'success',
          spacing: 10,
          timer: 2000,
          placement: { from: 'top', align: 'right' },
          delay: 1000,
          animate: { enter: 'animated bounce', exit: 'animated bounce' },
        });

        $('#anularCompra-' + c.id).modal('hide');
        this.init_compras();
        this.load_cancel = true;
      },
      error: (err) => {
        console.error('Error al anular compra', err);
        $.notify(
          err?.error?.mensaje || 'Error al anular la compra',
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

  getTipoBadgeClass(tipo: string) {
    return tipo === 'CREDITO'
      ? 'badge badge-info'
      : 'badge badge-primary';
  }

  getEstadoBadgeClass(estado: string) {
    return estado === 'ACTIVA'
      ? 'badge badge-success'
      : 'badge badge-danger';
  }

  limpiarFiltros() {
    this.searchProveedor = '';

    const hoy = new Date();
    this.fecha_hasta = hoy.toISOString().substring(0, 10);
    const hace30 = new Date();
    hace30.setDate(hace30.getDate() - 30);
    this.fecha_desde = hace30.toISOString().substring(0, 10);

    this.init_compras();
  }
}