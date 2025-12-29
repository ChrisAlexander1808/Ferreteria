import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProveedorService {
    private api = environment.apiUrl+'/api';

    constructor(private http: HttpClient) {}

    getAllProveedores(): Observable<any> {
    return this.http.get(`${this.api}/getAllProveedores`);
    }
  
    getByIdProveedor(id: any): Observable<any> {
      return this.http.get(`${this.api}/getByIdProveedor/${id}`);
    }
  
    createProveedor(data: any): Observable<any> {
      return this.http.post(`${this.api}/createProveedor`, data);
    }
  
    updateProveedor(id: number, data: any): Observable<any> {
      return this.http.put(`${this.api}/updateProveedor/${id}`, data);
    }
  
    deleteProveedor(id: number): Observable<any> {
      return this.http.delete(`${this.api}/deleteProveedor/${id}`); 
    }
}
