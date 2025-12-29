import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { StorageService } from '../services/storage.service';
import { Router } from '@angular/router';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(private storage: StorageService, private router:Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // 1️⃣ Obtenemos el token almacenado
    const token = this.storage.getToken();

    // 2️⃣ Si existe, clonamos la request agregando el header Authorization
    let authReq = req;
    if (token) {
      authReq = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
    }

    // 3️⃣ Continuamos la cadena de interceptores, y manejamos errores globales
    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // 🔥 Manejo global de errores comunes
        if (error.status === 401) {
          this.storage.clear(); // Limpiamos sesión
          this.router.navigate(['/auth/login']); // Redirigimos al login
        } else if (error.status === 403) {
          console.warn('Acceso denegado: no tienes permisos para esta acción');
        } else if (error.status === 500) {
          console.error('Error interno del servidor');
        }

        // Re-lanzamos el error para que el componente lo maneje si lo desea
        return throwError(() => error);
      })
    );
  }
}
