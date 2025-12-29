import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class VentaService {
    private api = environment.apiUrl + '/api';

  constructor(private http: HttpClient) {}

  getAllVentas(params?: {
  cliente_id?: number;
  tipo_venta?: string;
  estado?: string; // 'true' | 'false'
  fecha_desde?: string;
  fecha_hasta?: string;
}): Observable<any> {
  let httpParams = new HttpParams();

  if (params) {
    if (params.cliente_id) httpParams = httpParams.set('cliente_id', String(params.cliente_id));
    if (params.tipo_venta) httpParams = httpParams.set('tipo_venta', params.tipo_venta);
    if (params.estado !== undefined && params.estado !== null && params.estado !== '') {
      httpParams = httpParams.set('estado', params.estado);
    }
    if (params.fecha_desde) httpParams = httpParams.set('fecha_desde', params.fecha_desde);
    if (params.fecha_hasta) httpParams = httpParams.set('fecha_hasta', params.fecha_hasta);
  }

  return this.http.get(`${this.api}/getAllVentas`, { params: httpParams });
}

  getByIdVenta(id: number): Observable<any> {
    return this.http.get(`${this.api}/getByIdVenta/${id}`);
  }

  createVenta(data: any): Observable<any> {
    // Backend devuelve: { mensaje: string, venta_id: number }
    return this.http.post(`${this.api}/createVenta`, data);
  }

  anularVenta(id: number): Observable<any> {
    // Usa el PUT /updateVenta/:id que anula la venta
    return this.http.put(`${this.api}/updateVenta/${id}`, {});
  }
}
