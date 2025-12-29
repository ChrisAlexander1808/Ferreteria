import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CxcService {
  private api = environment.apiUrl + '/api';

  constructor(private http: HttpClient) {}

  // Listado general con filtros opcionales
  getAllCxc(params?: { cliente_id?: number; estado?: string }): Observable<any> {
    let httpParams = new HttpParams();
    if (params?.cliente_id) {
      httpParams = httpParams.set('cliente_id', params.cliente_id);
    }
    if (params?.estado) {
      httpParams = httpParams.set('estado', params.estado);
    }

    return this.http.get(`${this.api}/getAllCXC`, { params: httpParams });
  }

  // Detalle de una CxC
  getCxcById(id: number): Observable<any> {
    return this.http.get(`${this.api}/getCXCById/${id}`);
  }

  // CxC por cliente (estado de cuenta)
  getCxcByCliente(clienteId: number): Observable<any> {
    return this.http.get(`${this.api}/getCXCByCliente/${clienteId}`);
  }
}
