import { Routes, RouterModule } from "@angular/router";
import { ModuleWithProviders } from "@angular/core";
import { Dashboard } from "./layout/dashboard/dashboard";
import { IndexEmpresa } from "./modules/empresas/index-empresa/index-empresa";
import { AuthGuard } from "./core/guards/auth.guard";
import { IndexModulo } from "./modules/modulos/index-modulo/index-modulo";
import { IndexPermiso } from "./modules/permisos/index-permiso/index-permiso";
import { IndexRol } from "./modules/roles/index-rol/index-rol";
import { CreateRol } from "./modules/roles/create-rol/create-rol";
import { IndexUser } from "./modules/usuarios/index-user/index-user";
import { CreateUser } from "./modules/usuarios/create-user/create-user";
import { EditUser } from "./modules/usuarios/edit-user/edit-user";
import { Clientes } from "./modules/clientes/clientes";
import { Proveedores } from "./modules/proveedores/proveedores";
import { Categorias } from "./modules/categorias/categorias";
import { Productos } from "./modules/productos/productos";
import { Inventario } from "./modules/inventario/inventario";
import { Ventas } from "./modules/ventas/ventas";
import { CreateVenta } from "./modules/ventas/create-venta/create-venta";
import { EditRol } from "./modules/roles/edit-rol/edit-rol";
import { IndexMpagos } from "./modules/mpagos/index-mpagos/index-mpagos";
import { IndexCxc } from "./modules/cxc/index-cxc/index-cxc";
import { IndexPago } from "./modules/pagos/index-pago/index-pago";
import { CreatePago } from "./modules/pagos/create-pago/create-pago";
import { IndexCompra } from "./modules/compras/index-compra/index-compra";
import { CreateCompra } from "./modules/compras/create-compra/create-compra";
import { IndexCxp } from "./modules/cxp/index-cxp/index-cxp";
import { KardexProducto } from "./modules/productos/kardex-producto/kardex-producto";

const appRoutes : Routes = [
       { path: 'auth', loadChildren: () => import('./modules/auth/auth.module').then(m => m.AuthModule) },
       { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
       {path: 'dashboard', component: Dashboard, canActivate: [AuthGuard]},
       {path: 'config/empresas', component: IndexEmpresa, canActivate: [AuthGuard]},
       {path: 'config/modulos', component: IndexModulo, canActivate: [AuthGuard]},
       {path: 'config/permisos', component: IndexPermiso, canActivate: [AuthGuard]},
       {path: 'config/roles', component: IndexRol, canActivate: [AuthGuard]},
       {path: 'config/roles/create', component: CreateRol, canActivate: [AuthGuard]},
       {path: 'config/roles/edit/:id', component: EditRol, canActivate: [AuthGuard]},
       {path: 'config/usuarios', component: IndexUser, canActivate: [AuthGuard]},
       {path: 'config/usuarios/create', component: CreateUser, canActivate: [AuthGuard]},
       {path: 'config/usuarios/edit/:id', component: EditUser, canActivate: [AuthGuard]},
       {path: 'clientes', component: Clientes, canActivate: [AuthGuard]},
       {path: 'proveedores', component: Proveedores, canActivate: [AuthGuard]},
       {path: 'categorias', component: Categorias, canActivate: [AuthGuard]},
       {path: 'productos', component: Productos, canActivate: [AuthGuard]},
       {path: 'metodos-pago', component: IndexMpagos, canActivate: [AuthGuard]},
       {path: 'inventario', component: Inventario, canActivate: [AuthGuard]},
       {path: 'ventas', component: Ventas, canActivate: [AuthGuard]},
       {path: 'ventas/nueva', component: CreateVenta, canActivate: [AuthGuard]},
       {path: 'cxc', component: IndexCxc, canActivate: [AuthGuard]},
       {path: 'cxp', component: IndexCxp, canActivate: [AuthGuard]},
       {path: 'pagos', component: IndexPago, canActivate: [AuthGuard]},
       {path: 'pagos/create', component: CreatePago, canActivate: [AuthGuard]},
       {path: 'compras', component: IndexCompra, canActivate: [AuthGuard]},
       {path: 'compras/create', component: CreateCompra, canActivate: [AuthGuard]},
       {path: 'inventario/kardex/:id', component: KardexProducto, canActivate: [AuthGuard]}
]

export const appRoutingProviders : any[] = [];
export const routing : ModuleWithProviders<any> = RouterModule.forRoot(appRoutes);