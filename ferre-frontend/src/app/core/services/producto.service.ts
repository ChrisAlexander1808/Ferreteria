import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductoService {
    private api = environment.apiUrl+'/api';

    constructor(private http: HttpClient) {}

    getAllProductos(): Observable<any> {
    return this.http.get(`${this.api}/getAllProductos`);
    }
  
    getByIdProducto(id: any): Observable<any> {
      return this.http.get(`${this.api}/getByIdProducto/${id}`);
    }
  
    createProducto(data: any): Observable<any> {
      return this.http.post(`${this.api}/createProducto`, data);
    }
  
    updateProducto(id: number, data: any): Observable<any> {
      return this.http.put(`${this.api}/updateProducto/${id}`, data);
    }
  
    deleteProducto(id: number): Observable<any> {
      return this.http.delete(`${this.api}/deleteProducto/${id}`); 
    }

    getNextCodigo(categoria_id: number, nombre: string) {
    const params: any = {
        categoria_id: String(categoria_id),
        nombre: nombre
      };

      return this.http.get<any>(`${this.api}/productos/next-codigo`, { params });
    }
}
