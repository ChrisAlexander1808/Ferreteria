import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Pago } from '../models/pago.model';

@Injectable({
  providedIn: 'root',
})
export class PagoService {
   private api = environment.apiUrl + '/api';

  constructor(private http: HttpClient) {}

 getAllPagos(filtros?: {
    origen?: string;
    fecha_desde?: string;
    fecha_hasta?: string;
    cliente_id?: number;
    proveedor_id?: number;
  }): Observable<any> {
    let params = new HttpParams();

    if (filtros) {
      if (filtros.origen) {
        params = params.set('origen', filtros.origen);
      }
      if (filtros.fecha_desde) {
        params = params.set('fecha_desde', filtros.fecha_desde);
      }
      if (filtros.fecha_hasta) {
        params = params.set('fecha_hasta', filtros.fecha_hasta);
      }
      if (filtros.cliente_id) {
        params = params.set('cliente_id', filtros.cliente_id.toString());
      }
      if (filtros.proveedor_id) {
        params = params.set('proveedor_id', filtros.proveedor_id.toString());
      }
    }

    return this.http.get(`${this.api}/getAllPagos`, { params });
  }

  getPagoById(id: number): Observable<any> {
    return this.http.get(`${this.api}/getPagoById/${id}`);
  }

  createPago(data: any): Observable<any> {
    return this.http.post(`${this.api}/createPago`, data);
  }

  anularPago(id: number): Observable<any> {
    return this.http.put(`${this.api}/anularPago/${id}`, {});
  }
}
