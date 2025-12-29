import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { StorageService } from './storage.service';
import * as jwtDecode from 'jwt-decode';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private url = `${environment.apiUrl}/api`;

  constructor(
    private http: HttpClient,
    private storage: StorageService,
    private router: Router
  ) {}

  /**
   * LOGIN: autentica al usuario y guarda el token + usuario en localStorage
   */
  login(correo: string, contrasena: string): Observable<any> {
    return this.http.post(`${this.url}/login`, { correo, contrasena }).pipe(
      tap((res: any) => {
        if (res?.token) {
          // Guarda token
          this.storage.setToken(res.token);

          // Si viene data del backend, úsala; si no, decodifica el JWT
          const userData = res.data || (jwtDecode as any).default(res.token);
          this.storage.setUser(userData);
        }
      }),
      catchError((err) => {
        console.error('Error en login:', err);
        return throwError(() => err);
      })
    );
  }

  /**
   * LOGOUT: limpia todo y redirige al login
   */
  logout(): void {
    this.storage.clear();
    this.router.navigate(['/auth/login']);
  }

  /**
   * Verifica si el usuario tiene sesión activa
   */
  isAuthenticated(): boolean {
    const token = this.storage.getToken();
    return !!token;
  }

  /**
   * Obtiene la información del usuario autenticado
   */
  getUser(): any {
    return this.storage.getUser();
  }

  /**
   * Verifica si el usuario tiene cierto permiso o módulo
   */
  hasModule(modulo: string): boolean {
    const user = this.getUser();
    return user?.modulos?.includes(modulo) ?? false;
  }

  hasPermission(permiso: string): boolean {
    const user = this.getUser();
    return user?.permisos?.includes(permiso) ?? false;
  }

  hasAnyPermission(perms: string[]): boolean {
    return perms.some(p => this.hasPermission(p));
  }

  hasAllPermissions(perms: string[]): boolean {
    return perms.every(p => this.hasPermission(p));
  }

  getDefaultRoute(): string {
    // Aquí defines el orden de prioridad de las pantallas
    const candidates: { path: string; check: () => boolean }[] = [
      // Dashboard (solo si tiene permiso o módulo)
      {
        path: '/dashboard',
        check: () =>
          this.hasPermission('DASHBOARD_VIEW') ||
          this.hasModule('DASHBOARD'),
      },

      // Operaciones
      {
        path: '/ventas',
        check: () => this.hasPermission('VENTAS_VIEW'),
      },
      {
        path: '/compras',
        check: () => this.hasPermission('COMPRAS_VIEW'),
      },
      {
        path: '/inventario',
        check: () => this.hasPermission('INVENTARIO_READ'),
      },

      // Mantenimientos
      {
        path: '/clientes',
        check: () => this.hasPermission('CLIENTES_READ'),
      },
      {
        path: '/proveedores',
        check: () => this.hasPermission('PROVEEDOR_READ'),
      },
      {
        path: '/productos',
        check: () => this.hasPermission('PRODUCTO_READ'),
      },

      // Configuración
      {
        path: '/config/usuarios',
        check: () => this.hasPermission('CONFIG_USER_MANAGE'),
      },
      {
        path: '/config/roles',
        check: () => this.hasPermission('CONFIG_USER_MANAGE'),
      },
      {
        path: '/config/modulos',
        check: () => this.hasPermission('CONFIG_USER_MANAGE'),
      },
      {
        path: '/config/permisos',
        check: () => this.hasPermission('CONFIG_USER_MANAGE'),
      },
      {
        path: '/config/empresas',
        check: () => this.hasPermission('CONFIG_USER_MANAGE'),
      },
    ];

    const found = candidates.find(c => c.check());

    if (found) {
      return found.path;
    }

    // Si no tiene NINGÚN permiso de los anteriores:
    // puedes mandarlo a una página "sin permisos" o al login.
    return '/auth/login';
  }
}
