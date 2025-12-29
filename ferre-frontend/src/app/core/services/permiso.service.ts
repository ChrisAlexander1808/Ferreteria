import { Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class PermisoService {
    private api = environment.apiUrl+'/api';

    constructor(private http: HttpClient) {}

  getAllPermisos(): Observable<any> {
    return this.http.get(`${this.api}/getAllPermisos`);
  }

  getPermisoById(id: any): Observable<any> {
    return this.http.get(`${this.api}/getPermisoById/${id}`);
  }

  createPermiso(data: any): Observable<any> {
    return this.http.post(`${this.api}/createPermiso`, data);
  }

  updatePermiso(id: number, data: any): Observable<any> {
    return this.http.put(`${this.api}/updatePermiso/${id}`, data);
  }

  deletePermiso(id: number): Observable<any> {
    return this.http.delete(`${this.api}/deletePermiso/${id}`); 
  }
}
