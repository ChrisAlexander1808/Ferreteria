import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CxpService {
  private api = environment.apiUrl + '/api';

  constructor(private http: HttpClient) {}

   // Listado general con filtros opcionales
  getAllCXP(params?: {
    proveedor_id?: number;
    estado?: string;
    fecha_desde?: string;
    fecha_hasta?: string;
  }): Observable<any> {
    let httpParams = new HttpParams();

    if (params?.proveedor_id) {
      httpParams = httpParams.set('proveedor_id', params.proveedor_id);
    }
    if (params?.estado) {
      httpParams = httpParams.set('estado', params.estado);
    }
    if (params?.fecha_desde) {
      httpParams = httpParams.set('fecha_desde', params.fecha_desde);
    }
    if (params?.fecha_hasta) {
      httpParams = httpParams.set('fecha_hasta', params.fecha_hasta);
    }

    return this.http.get(`${this.api}/getAllCXP`, { params: httpParams });
  }

  // Detalle de una CxP
  getCXPById(id: number): Observable<any> {
    return this.http.get(`${this.api}/getCXPById/${id}`);
  }

}
