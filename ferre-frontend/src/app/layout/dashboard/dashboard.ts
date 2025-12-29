import { Component, OnInit } from '@angular/core';
import {
  DashboardService,
  DashboardTotales,
  DashboardVentasComprasMes,
  DashboardFlujoMes,
  DashboardTopProducto,
  DashboardVentasPorTipo,
  DashboardData,
} from '../../core/services/dashboard.service';

declare var ApexCharts: any;

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {

    canView = false;

 // Filtros
  year: number;
  month: string = 'ALL'; // 'ALL' o '01'...'12'

  // Datos
  totales: DashboardTotales | null = null;
  ventasPorTipo: DashboardVentasPorTipo | null = null;
  ventasComprasMensuales: DashboardVentasComprasMes[] = [];
  flujoEfectivoMensual: DashboardFlujoMes[] = [];
  topProductos: DashboardTopProducto[] = [];

  // Estado UI
  loading: boolean = false;

  // Charts
  private chartVentasCompras: any | null = null;
  private chartFlujo: any | null = null;
  private chartVentasTipo: any | null = null;

  // Para mostrar meses en español
  readonly mesesLabels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  constructor(private dashboardService: DashboardService) {
    const hoy = new Date();
    this.year = hoy.getFullYear();
  }

  ngOnInit(): void {
    this.loadDashboard();
  }

  // Cargar información del backend
  loadDashboard() {
    this.loading = true;

    this.dashboardService.getResumen(this.year, this.month).subscribe({
      next: (res) => {
        const data: DashboardData = res.data;

        this.totales = data.totales || null;
        this.ventasPorTipo = data.ventasPorTipo || {};
        this.ventasComprasMensuales = data.ventasComprasMensuales || [];
        this.flujoEfectivoMensual = data.flujoEfectivoMensual || [];
        this.topProductos = (data.topProductos || []).slice(0, 10); // top 10 máx.

        this.loading = false;

        // Render charts
        setTimeout(() => {
          this.renderChartVentasCompras();
          this.renderChartFlujoEfectivo();
          this.renderChartVentasPorTipo();
        }, 0);
      },
      error: (err) => {
        console.error('Error al cargar dashboard', err);
        this.loading = false;
      },
    });
  }

  // Botón buscar
  search() {
    this.loadDashboard();
  }

  // Botón refresh (año actual y todo el año)
  refresh() {
    const hoy = new Date();
    this.year = hoy.getFullYear();
    this.month = 'ALL';
    this.loadDashboard();
  }

  // ==== Helpers métricas ====

  get totalVentas(): number {
    return this.totales?.totalVentas ?? 0;
  }

  get totalCompras(): number {
    return this.totales?.totalCompras ?? 0;
  }

  get resultadoBruto(): number {
    return this.totales?.resultadoBruto ?? 0;
  }

  get totalCobros(): number {
    return this.totales?.totalCobros ?? 0;
  }

  get totalPagos(): number {
    return this.totales?.totalPagos ?? 0;
  }

  get saldoCxC(): number {
    return this.totales?.saldoCxC ?? 0;
  }

  get saldoCxP(): number {
    return this.totales?.saldoCxP ?? 0;
  }

  get ventasContado(): number {
    return this.ventasPorTipo?.CONTADO ?? 0;
  }

  get ventasCredito(): number {
    return this.ventasPorTipo?.CREDITO ?? 0;
  }

  // ==== Charts ====

  private renderChartVentasCompras() {
    const element = document.querySelector('#chart_ventas_compras') as HTMLElement;
    if (!element) return;

    if (this.chartVentasCompras) {
      this.chartVentasCompras.destroy();
      this.chartVentasCompras = null;
    }

    // Series base de 12 meses
    const ventasSeries = new Array(12).fill(0);
    const comprasSeries = new Array(12).fill(0);

    // Rellenar según respuesta: mes = 'YYYY-MM'
    (this.ventasComprasMensuales || []).forEach((item) => {
      if (!item.mes) return;
      const parts = item.mes.split('-');
      if (parts.length !== 2) return;
      const mesNum = parseInt(parts[1], 10); // 1-12
      if (isNaN(mesNum) || mesNum < 1 || mesNum > 12) return;

      const idx = mesNum - 1;
      ventasSeries[idx] = item.ventas || 0;
      comprasSeries[idx] = item.compras || 0;
    });

    const options = {
      series: [
        {
          name: 'Ventas Q.',
          data: ventasSeries,
        },
        {
          name: 'Compras Q.',
          data: comprasSeries,
        },
      ],
      chart: {
        height: 300,
        type: 'line',
        zoom: { enabled: false },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: 'straight',
      },
      grid: {
        row: {
          colors: ['#f3f3f3', 'transparent'],
          opacity: 0.4,
        },
      },
      xaxis: {
        categories: this.mesesLabels,
      },
      colors: ['#1866F7', '#EA6351'],
    };

    this.chartVentasCompras = new ApexCharts(element, options);
    this.chartVentasCompras.render();
  }

  private renderChartFlujoEfectivo() {
    const element = document.querySelector('#chart_flujo') as HTMLElement;
    if (!element) return;

    if (this.chartFlujo) {
      this.chartFlujo.destroy();
      this.chartFlujo = null;
    }

    const primary = '#6993FF';
    const success = '#4EA64E';
    const warning = '#EA6351';

    const totalCobros = this.totalCobros;
    const totalPagos = this.totalPagos;

    const options = {
      series: [totalCobros, totalPagos],
      chart: {
        width: 380,
        type: 'pie',
      },
      labels: ['Cobros (CxC)', 'Pagos (CxP)'],
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200,
            },
            legend: {
              position: 'bottom',
            },
          },
        },
      ],
      colors: [success, warning],
    };

    this.chartFlujo = new ApexCharts(element, options);
    this.chartFlujo.render();
  }

  private renderChartVentasPorTipo() {
    const element = document.querySelector('#chart_ventas_tipo') as HTMLElement;
    if (!element) return;

    if (this.chartVentasTipo) {
      this.chartVentasTipo.destroy();
      this.chartVentasTipo = null;
    }

    const contado = this.ventasContado;
    const credito = this.ventasCredito;

    const options = {
      series: [contado, credito],
      chart: {
        width: 380,
        type: 'donut',
      },
      labels: ['Contado', 'Crédito'],
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 220,
            },
            legend: {
              position: 'bottom',
            },
          },
        },
      ],
      colors: ['#2DD3CB', '#F9D407'],
    };

    this.chartVentasTipo = new ApexCharts(element, options);
    this.chartVentasTipo.render();
  }

  // Helper para nombre de producto nulo
  getNombreProducto(p: DashboardTopProducto): string {
    return p.producto || 'Otros / Servicios';
  }
}
