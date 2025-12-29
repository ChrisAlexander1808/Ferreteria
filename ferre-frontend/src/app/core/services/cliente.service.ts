import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ClienteService {
    private api = environment.apiUrl+'/api';

    constructor(private http: HttpClient) {}

    getAllClientes(): Observable<any> {
    return this.http.get(`${this.api}/getAllClientes`);
    }
  
    getByIdCliente(id: any): Observable<any> {
      return this.http.get(`${this.api}/getByIdCliente/${id}`);
    }
  
    createCliente(data: any): Observable<any> {
      return this.http.post(`${this.api}/createCliente`, data);
    }
  
    updateCliente(id: number, data: any): Observable<any> {
      return this.http.put(`${this.api}/updateCliente/${id}`, data);
    }
  
    deleteCliente(id: number): Observable<any> {
      return this.http.delete(`${this.api}/deleteCliente/${id}`); 
    }
}
