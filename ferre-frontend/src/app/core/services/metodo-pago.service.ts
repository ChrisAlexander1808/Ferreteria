import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MetodoPagoService {
     private api = environment.apiUrl + '/api';

  constructor(private http: HttpClient) {}

  getAllMetodosPago(): Observable<any> {
    // El backend devuelve directamente un array de ventas (no { data: ... })
    return this.http.get(`${this.api}/getAllMetodosPago`);
  }

  getByIdMetodoPago(id: any): Observable<any> {
    // El backend devuelve directamente un array de ventas (no { data: ... })
    return this.http.get(`${this.api}/getByIdMetodoPago/${id}`);
  }

  updateMetodoPago(id: number, data: any): Observable<any> {
    return this.http.put(`${this.api}/updateMetodoPago/${id}`, data);
  }

  createMetodoPago(data: any): Observable<any> {
    // Backend devuelve: { mensaje: string, venta_id: number }
    return this.http.post(`${this.api}/createMetodoPago`, data);
  }

  deleteMetodoPago(id: number): Observable<any> {
    // Usa el PUT /updateVenta/:id que anula la venta
    return this.http.delete(`${this.api}/deleteMetodoPago/${id}`);
  }
}
