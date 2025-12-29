import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from "rxjs";
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class RolService {
    private api = environment.apiUrl+'/api';

    constructor(private http: HttpClient) {}

  getAllRoles(): Observable<any> {
    return this.http.get(`${this.api}/getAllRoles`);
  }

  getByIdRol(id:any): Observable<any> {
    return this.http.get(`${this.api}/getByIdRol/${id}`);
  }

  getPermissionsByRoleId(id:any): Observable<any> {
    return this.http.get(`${this.api}/getPermissionsByRoleId/${id}`);
  }

  createRol(data: any): Observable<any> {
    return this.http.post(`${this.api}/createRol`, data);
  }

  createRolpermiso(data: any): Observable<any> {
    return this.http.post(`${this.api}/createRolpermiso`, data);
  }

  updateRolWithPerms(id: number, data: any): Observable<any> {
    return this.http.put(`${this.api}/updateRolWithPerms/${id}`, data);
  }

}
