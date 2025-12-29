import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from "./core/guards/auth.guard";
import { RoleGuard } from "./core/guards/role.guard";
import { Dashboard } from "./layout/dashboard/dashboard";
import { IndexEmpresa } from './modules/empresas/index-empresa/index-empresa';
import { IndexModulo } from './modules/modulos/index-modulo/index-modulo';
import { IndexPermiso } from './modules/permisos/index-permiso/index-permiso';
import { IndexRol } from './modules/roles/index-rol/index-rol';
import { IndexUser } from './modules/usuarios/index-user/index-user';

const routes: Routes = [/*
    { path: 'auth', loadChildren: () => import('./modules/auth/auth.module').then(m => m.AuthModule) },

    {
      path: '',
      component: Dashboard,
      canActivate: [AuthGuard],
      children: [
        { path: 'dashboard', component: Dashboard },
        { path: 'config/empresas', component: IndexEmpresa},   
        { path: 'config/modulos', component: IndexModulo }, 
        { path: 'config/permisos', component: IndexPermiso }, 
        { path: 'config/roles', component: IndexRol }, 
        { path: 'config/usuarios', component: IndexUser }, 
        { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
      ]
    },
    { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
    { path: '**', redirectTo: 'auth/login' },    */
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }


