import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DashboardTotales {
  totalVentas: number;
  totalCompras: number;
  resultadoBruto: number;
  totalCobros: number;
  totalPagos: number;
  saldoCxC: number;
  saldoCxP: number;
}

export interface DashboardVentasComprasMes {
  mes: string;   // '2025-11', '2025-12', etc.
  ventas: number;
  compras: number;
}

export interface DashboardFlujoMes {
  mes: string;
  cobros: number;
  pagos: number;
}

export interface DashboardTopProducto {
  producto: string | null;
  cantidad: number;
  total: number;
}

export interface DashboardVentasPorTipo {
  CONTADO?: number;
  CREDITO?: number;
  [key: string]: number | undefined;
}

export interface DashboardPeriodo {
  year: number;
  month: string; // 'ALL' | '01'...'12'
  desde: string;
  hasta: string;
}

export interface DashboardData {
  periodo: DashboardPeriodo;
  totales: DashboardTotales;
  ventasPorTipo: DashboardVentasPorTipo;
  ventasComprasMensuales: DashboardVentasComprasMes[];
  flujoEfectivoMensual: DashboardFlujoMes[];
  topProductos: DashboardTopProducto[];
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private api = environment.apiUrl + '/api';

  constructor(private http: HttpClient) {}

  getResumen(year: number, month: string): Observable<{ data: DashboardData }> {
    let params = new HttpParams()
      .set('year', String(year))
      .set('month', month || 'ALL');

    // Ajusta la URL si tu endpoint se llama distinto
    return this.http.get<{ data: DashboardData }>(
      `${this.api}/dashboard/resumen`,
      { params }
    );
  }
}

