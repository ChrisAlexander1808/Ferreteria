import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { StorageService } from '../services/storage.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private storage: StorageService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const user = this.storage.getUser();
    if (!user) {
      this.router.navigate(['/auth/login']);
      return false;
    }

    const needModules: string[] = route.data['modulos'] || [];
    const needPerms: string[] = route.data['permisos'] || [];

    const userMods = (user.modulos || []).map(String);
    const userPerms = (user.permisos || []).map(String);

    if (needModules.length && !needModules.some(m => userMods.includes(m))) {
      console.warn('Acceso denegado: módulo no autorizado', { needModules, userMods });
      this.router.navigate(['/dashboard']);
      return false;
    }
    if (needPerms.length && !needPerms.some(p => userPerms.includes(p))) {
      console.warn('Acceso denegado: permiso insuficiente', { needPerms, userPerms });
      this.router.navigate(['/dashboard']);
      return false;
    }
    return true;
  }
}
