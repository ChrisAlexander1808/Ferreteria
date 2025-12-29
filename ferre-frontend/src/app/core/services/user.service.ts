import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UserService {
  private api = environment.apiUrl+'/api';
  
  constructor(private http: HttpClient) {}

  getAlluser(): Observable<any> {
    return this.http.get(`${this.api}/getAlluser`);
  }

  getById(id: number): Observable<any> {
    return this.http.get(`${this.api}/getById/${id}`);
  }

  createUser(data: any): Observable<any> {
    return this.http.post(`${this.api}/createUser`, data);
  }

  updateUser(id: number, data: any): Observable<any> {
    return this.http.put(`${this.api}/updateUser/${id}`, data);
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.api}/deleteUser/${id}`); 
  }
}
