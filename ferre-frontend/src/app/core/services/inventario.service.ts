import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class InventarioService {
    private api = environment.apiUrl+'/api';

    constructor(private http: HttpClient) {}

    getAllMovimientos(): Observable<any> {
    return this.http.get(`${this.api}/getAllMovimientos`);
    }
  
    createMovimiento(data: any): Observable<any> {
      return this.http.post(`${this.api}/createMovimiento`, data);
    }

    getKardexProducto(id: number, desde?: string, hasta?: string) {
      let params: any = {};
      if (desde) params.desde = desde;
      if (hasta) params.hasta = hasta;

      return this.http.get<any>(`${this.api}/productos/${id}/kardex`, { params });
    }

}
