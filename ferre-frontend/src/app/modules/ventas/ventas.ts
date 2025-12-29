import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { Venta } from '../../core/models/venta.model';
import { VentaService } from '../../core/services/venta.service';
declare var $: any;

@Component({
  selector: 'app-ventas',
  standalone: false,
  templateUrl: './ventas.html',
  styleUrl: './ventas.scss',
})
export class Ventas implements OnInit {
   // Permisos
  canView = false;
  canCreate = false;
  canCancel = false;

  // Estado UI
  load_data: boolean = true;
  load_cancel: boolean = true;

  filtro_venta: string = '';
  page: number = 1;
  pageSize: number = 10;

  ventas: Venta[] = [];
  ventas_const: Venta[] = [];

  resumen = {
    totalRegistros: 0,
    totalVentas: 0,
    totalContado: 0,
    totalCredito: 0,
  };

  fecha_desde: string = '';
  fecha_hasta: string = '';


  selectedVenta: Venta | null = null;

    constructor(
      private auth: AuthService,
      private router: Router,
      private ventaService: VentaService
    ){}

    ngOnInit(): void {
      this.canView = this.auth.hasPermission('VENTAS_VIEW');
      this.canCreate = this.auth.hasPermission('VENTAS_CREATE');
      this.canCancel = this.auth.hasPermission('VENTAS_CANCEL');

      if (!this.canView) {
        this.router.navigate(['/dashboard']);
        return;
      }

      const hoy = new Date();
      this.fecha_hasta = hoy.toISOString().substring(0, 10);
      const hace30 = new Date();
      hace30.setDate(hace30.getDate() - 30);
      this.fecha_desde = hace30.toISOString().substring(0, 10);

    this.init_ventas();
    }

    init_ventas() {
    this.load_data = true;

    const params: any = {};
    if (this.fecha_desde) params.fecha_desde = this.fecha_desde;
    if (this.fecha_hasta) params.fecha_hasta = this.fecha_hasta;

    this.ventaService.getAllVentas(params).subscribe({
      next: (response) => {
        const data = Array.isArray(response) ? response : (response?.data ?? []);

        this.ventas = data || [];
        this.ventas_const = [...data];
        this.calcularResumen();
        this.load_data = false;
      },
      error: (err) => {
        console.error('Error al obtener ventas', err);
        this.load_data = false;
        $.notify('Error al obtener ventas', {
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

    limpiarFiltros() {
      this.filtro_venta = '';

      const hoy = new Date();
      this.fecha_hasta = hoy.toISOString().substring(0, 10);
      const hace30 = new Date();
      hace30.setDate(hace30.getDate() - 30);
      this.fecha_desde = hace30.toISOString().substring(0, 10);

      this.init_ventas();
    }

    calcularResumen() {

      const lista = Array.isArray(this.ventas) ? this.ventas : [];

      let totalVentas = 0;
      let totalContado = 0;
      let totalCredito = 0;

      lista.forEach((v) => {
        const total = Number(v.total) || 0;

        // Solo tomamos ventas ACTIVAS (estado = true)
        if (v.estado) {
          totalVentas += total;

          if (v.tipo_venta === 'CONTADO') {
            totalContado += total;
          } else if (v.tipo_venta === 'CREDITO') {
            totalCredito += total;
          }
        }
      });

      this.resumen = {
        totalRegistros: this.ventas.length, // incluye activas + anuladas
        totalVentas,
        totalContado,
        totalCredito,
      };
  }


   filtrar() {
    if (!this.filtro_venta) {
      this.ventas = [...this.ventas_const];
      this.calcularResumen(); // 👈 recalc al limpiar filtro
      return;
    }

    const term = new RegExp(this.filtro_venta, 'i');

    this.ventas = this.ventas_const.filter((venta) => {
      const clienteNombre = venta.cliente?.nombre || '';
      const idStr = String(venta.id || '');

      return term.test(clienteNombre) || term.test(idStr);
    });

    this.calcularResumen(); // 👈 recalc con la lista filtrada
  }

  // Ir a crear venta (ajusta ruta si usas otra)
  ir_crear_venta() {
    if (!this.canCreate) return;
    this.router.navigate(['/ventas/nueva']); // <-- ajusta a tu ruta real si es diferente
  }

  // Abrir modal detalle
  openDetalleModal(venta: Venta) {
    this.selectedVenta = venta;
    $('#modalDetalleVenta').modal('show');
  }

  // Confirmación de anulación (abre modal específico por venta)
  openAnularModal(id: number) {
    if (!this.canCancel) return;
    $('#anular-' + id).modal('show');
  }

  // Anular venta
  anular_venta(id: number) {
    if (!this.canCancel) return;

    this.load_cancel = false;

    this.ventaService.anularVenta(id).subscribe({
      next: (response) => {
        $.notify(response?.mensaje || 'Venta anulada correctamente', {
          type: 'success',
          spacing: 10,
          timer: 2000,
          placement: { from: 'top', align: 'right' },
          delay: 1000,
          animate: { enter: 'animated bounce', exit: 'animated bounce' },
        });

        $('#anular-' + id).modal('hide');
        this.init_ventas();
        this.load_cancel = true;
      },
      error: (err) => {
        console.error('Error al anular venta', err);
        $.notify(
          err?.error?.mensaje || 'Error al anular venta',
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
}
