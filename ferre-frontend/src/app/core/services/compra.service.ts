import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CompraService {
   private api = environment.apiUrl + '/api';

  constructor(private http: HttpClient) {}

  getAllCompras(params?: {
    proveedor_id?: number;
    tipo_compra?: string;
    estado?: string;
    fecha_desde?: string;
    fecha_hasta?: string;
  }): Observable<any> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.proveedor_id) {
        httpParams = httpParams.set(
          'proveedor_id',
          String(params.proveedor_id)
        );
      }
      if (params.tipo_compra) {
        httpParams = httpParams.set('tipo_compra', params.tipo_compra);
      }
      if (params.estado) {
        httpParams = httpParams.set('estado', params.estado);
      }
      if (params.fecha_desde) {
        httpParams = httpParams.set('fecha_desde', params.fecha_desde);
      }
      if (params.fecha_hasta) {
        httpParams = httpParams.set('fecha_hasta', params.fecha_hasta);
      }
    }

    return this.http.get(`${this.api}/getAllCompras`, { params: httpParams });
  }

  getCompraById(id: number): Observable<any> {
    return this.http.get(`${this.api}/getByIdCompra/${id}`);
  }

  createCompra(payload: any): Observable<any> {
    return this.http.post(`${this.api}/createCompra`, payload);
  }

  anularCompra(id: number): Observable<any> {
    // si en backend lo pones como POST, cambias aquí
    return this.http.put(`${this.api}/anularCompra/${id}`, {});
  }
}
