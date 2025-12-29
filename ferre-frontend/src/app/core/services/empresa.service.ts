import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class EmpresaService {
    private api = environment.apiUrl+'/api';

  constructor(private http: HttpClient) {}

  getAllEmpresas(): Observable<any> {
    return this.http.get(`${this.api}/getAllEmpresas`);
  }

  getByIdEmpresa(id: number): Observable<any> {
    return this.http.get(`${this.api}/getByIdEmpresa/${id}`);
  }

  createEmpresa(data: any): Observable<any> {
    return this.http.post(`${this.api}/createEmpresa`, data);
  }

  updateEmpresa(id: number, data: any): Observable<any> {
    return this.http.put(`${this.api}/updateEmpresa/${id}`, data);
  }

  deleteEmpresa(id: number): Observable<any> {
    return this.http.delete(`${this.api}/deleteEmpresa/${id}`); 
  }
}
