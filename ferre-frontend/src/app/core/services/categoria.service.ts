import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CategoriaService {
    private api = environment.apiUrl+'/api';

    constructor(private http: HttpClient) {}

  getAllCategorias(): Observable<any> {
  return this.http.get(`${this.api}/getAllCategorias`);
  }

  getByIdCategoria(id: any): Observable<any> {
    return this.http.get(`${this.api}/getByIdCategoria/${id}`);
  }

  createCategoria(data: any): Observable<any> {
    return this.http.post(`${this.api}/createCategoria`, data);
  }

  updateCategoria(id: number, data: any): Observable<any> {
    return this.http.put(`${this.api}/updateCategoria/${id}`, data);
  }

  deleteCategoria(id: number): Observable<any> {
    return this.http.delete(`${this.api}/deleteCategoria/${id}`); 
  }
}
