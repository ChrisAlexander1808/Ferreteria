import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CxpService } from '../../../core/services/cxp.service';
declare var $: any;

interface CuentaPorPagarItem {
  id: number;
  compra_id: number;
  proveedor_id: number;
  empresa_id: number;
  fecha_emision: string;
  fecha_vencimiento: string;
  monto_total: number;
  saldo_pendiente: number;
  estado: 'PENDIENTE' | 'PARCIAL' | 'PAGADA' | 'VENCIDA' | 'ANULADA';
  proveedor?: {
    id: number;
    nombre: string;
    nit: string;
  };
  compra?: {
    id: number;
    fecha: string;
    numero_factura: string | null;
    tipo_compra: 'CONTADO' | 'CREDITO';
    total: number;
  };
}

@Component({
  selector: 'app-index-cxp',
  standalone: false,
  templateUrl: './index-cxp.html',
  styleUrl: './index-cxp.scss',
})
export class IndexCxp implements OnInit {

  canView = false;

  // Filtros
  filtroProveedor: string = '';
  estadoFiltro: string = 'TODOS';
  fecha_desde: string = '';
  fecha_hasta: string = '';

  // Datos
  cxp: CuentaPorPagarItem[] = [];
  cxpFiltradas: CuentaPorPagarItem[] = [];

  // Resumen
  resumen = {
    total_registros: 0,

    pendientes_count: 0,
    pendientes_monto: 0,

    parciales_count: 0,
    parciales_monto: 0,

    pagadas_count: 0,
    pagadas_monto: 0,

    vencidas_count: 0,
    vencidas_monto: 0,
  };

  // UI
  load_data: boolean = true;
  loadingDetalle: boolean = false;
  detalleCxp: any = null;

  constructor(
    private auth: AuthService,
    private router: Router,
    private cxpService: CxpService
  ) {}

  ngOnInit(): void {
    this.canView = this.auth.hasPermission('CXP_READ');

    if (!this.canView) {
      this.router.navigate(['/dashboard']);
      return;
    }

    this.initFechas();
    this.init_cxp();
  }
    // Rango por defecto: hoy - 30 días
  initFechas() {
    const hoy = new Date();
    const hace30 = new Date();
    hace30.setDate(hoy.getDate() - 30);

    this.fecha_hasta = hoy.toISOString().substring(0, 10);
    this.fecha_desde = hace30.toISOString().substring(0, 10);
  }

  // Cargar listado desde backend
  init_cxp() {
    this.load_data = true;

    const params: any = {
      fecha_desde: this.fecha_desde,
      fecha_hasta: this.fecha_hasta,
    };

    // El filtro de estado fuerte se hace opcionalmente en backend
    if (this.estadoFiltro !== 'TODOS') {
      params.estado = this.estadoFiltro;
    }

    this.cxpService.getAllCXP(params).subscribe({
      next: (res) => {
        this.cxp = (res.data || []).map((item: any) => ({
          ...item,
          monto_total: Number(item.monto_total || 0),
          saldo_pendiente: Number(item.saldo_pendiente || 0),
        }));
        this.aplicarFiltros();
        this.load_data = false;
      },
      error: (err) => {
        console.error('Error al obtener CxP', err);
        $.notify('Error al obtener cuentas por pagar', {
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

  // Cuando cambia texto del proveedor (keyup)
  onChangeFiltroProveedor() {
    this.aplicarFiltros();
  }

  // Cuando cambia estado (chips / select)
  onChangeEstado(estado: string) {
    this.estadoFiltro = estado;
    // Reconsultamos al backend para que también filtre por estado
    this.init_cxp();
  }

  // Cuando cambian fechas
  onChangeFechas() {
    this.init_cxp();
  }

  // Aplica filtros de texto + estado sobre this.cxp
  aplicarFiltros() {
    const term = this.filtroProveedor.trim().toLowerCase();

    this.cxpFiltradas = this.cxp.filter((c) => {
      // filtro por estado (extra en front por si el backend no lo aplicó)
      const coincideEstado =
        this.estadoFiltro === 'TODOS' || c.estado === this.estadoFiltro;

      // filtro por proveedor (nombre / NIT)
      const nombre = (c.proveedor?.nombre || '').toLowerCase();
      const nit = (c.proveedor?.nit || '').toLowerCase();
      const coincideTexto =
        !term || nombre.includes(term) || nit.includes(term);

      return coincideEstado && coincideTexto;
    });

    this.calcularResumen();
  }

  calcularResumen() {
    const sum = (estado: string) => {
      const items = this.cxpFiltradas.filter((c) => c.estado === estado);
      const monto = items.reduce(
        (acc, c) => acc + Number(c.saldo_pendiente || 0),
        0
      );
      return { count: items.length, monto };
    };

    const pend = sum('PENDIENTE');
    const parc = sum('PARCIAL');
    const pag  = sum('PAGADA');
    const venc = sum('VENCIDA');

    this.resumen.total_registros = this.cxpFiltradas.length;

    this.resumen.pendientes_count = pend.count;
    this.resumen.pendientes_monto = pend.monto;

    this.resumen.parciales_count = parc.count;
    this.resumen.parciales_monto = parc.monto;

    this.resumen.pagadas_count = pag.count;
    this.resumen.pagadas_monto = pag.monto;

    this.resumen.vencidas_count = venc.count;
    this.resumen.vencidas_monto = venc.monto;
  }

  // Clases para badge de estado
  getEstadoBadgeClass(estado: string): string {
    switch (estado) {
      case 'PENDIENTE':
        return 'badge badge-warning';
      case 'PARCIAL':
        return 'badge badge-info';
      case 'PAGADA':
        return 'badge badge-success';
      case 'VENCIDA':
        return 'badge badge-danger';
      case 'ANULADA':
        return 'badge badge-dark';
      default:
        return 'badge badge-secondary';
    }
  }

  // 👉 Detalle en modal (como CxC)
  ver_detalle(cxp: CuentaPorPagarItem) {
    this.loadingDetalle = true;
    this.detalleCxp = null;

    $('#detalleCxpModal').modal('show');

    this.cxpService.getCXPById(cxp.id).subscribe({
      next: (res) => {
        this.detalleCxp = res.data;
        this.loadingDetalle = false;
      },
      error: (err) => {
        console.error('Error al obtener detalle CxP', err);
        $.notify('Error al obtener detalle de la cuenta por pagar', {
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

}
