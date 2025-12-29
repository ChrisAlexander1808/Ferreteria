import { Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ModuloService {
    private api = environment.apiUrl+'/api';

    constructor(private http: HttpClient){}

  getAllModulos(): Observable<any> {
    return this.http.get(`${this.api}/getAllModulos`);
  }

  getByIdModulo(id: number): Observable<any> {
    return this.http.get(`${this.api}/getByIdModulo/${id}`);
  }

  createModulo(data: any): Observable<any> {
    return this.http.post(`${this.api}/createModulo`, data);
  }

  updateModulo(id: number, data: any): Observable<any> {
    return this.http.put(`${this.api}/updateModulo/${id}`, data);
  }

}
