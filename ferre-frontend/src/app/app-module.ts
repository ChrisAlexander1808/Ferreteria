import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, HttpClientModule } from "@angular/common/http";
import { FormsModule } from "@angular/forms";
import { AppRoutingModule } from './app-routing-module';
import { AppComponent } from './app.component';
import { routing } from './app.routing';
import { TokenInterceptor } from "./core/interceptors/token.interceptor";
import { NgbPaginationModule, NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { NgxPaginationModule } from "ngx-pagination";
import { NgSelectModule } from '@ng-select/ng-select';

import { Sidebar } from "./layout/sidebar/sidebar";
import { Dashboard } from './layout/dashboard/dashboard';
import { IndexUser } from './modules/usuarios/index-user/index-user';
import { CreateUser } from './modules/usuarios/create-user/create-user';
import { EditUser } from './modules/usuarios/edit-user/edit-user';
import { IndexEmpresa } from './modules/empresas/index-empresa/index-empresa';
import { IndexModulo } from './modules/modulos/index-modulo/index-modulo';
import { IndexPermiso } from './modules/permisos/index-permiso/index-permiso';
import { IndexRol } from './modules/roles/index-rol/index-rol';
import { Top } from './layout/top/top';
import { CreateRol } from './modules/roles/create-rol/create-rol';
import { Clientes } from './modules/clientes/clientes';
import { Proveedores } from './modules/proveedores/proveedores';
import { Categorias } from './modules/categorias/categorias';
import { Productos } from './modules/productos/productos';
import { Inventario } from './modules/inventario/inventario';
import { Ventas } from './modules/ventas/ventas';
import { CreateVenta } from './modules/ventas/create-venta/create-venta';
import { EditRol } from './modules/roles/edit-rol/edit-rol';
import { IndexMpagos } from './modules/mpagos/index-mpagos/index-mpagos';
import { IndexCxc } from './modules/cxc/index-cxc/index-cxc';
import { IndexPago } from './modules/pagos/index-pago/index-pago';
import { CreatePago } from './modules/pagos/create-pago/create-pago';
import { IndexCompra } from './modules/compras/index-compra/index-compra';
import { CreateCompra } from './modules/compras/create-compra/create-compra';
import { IndexCxp } from './modules/cxp/index-cxp/index-cxp';
import { KardexProducto } from './modules/productos/kardex-producto/kardex-producto';

@NgModule({
  declarations: [
    AppComponent,
    Sidebar,
    Dashboard,
    IndexUser,
    CreateUser,
    EditUser,
    IndexEmpresa,
    IndexModulo,
    IndexPermiso,
    IndexRol,
    Top,
    CreateRol,
    Clientes,
    Proveedores,
    Categorias,
    Productos,
    Inventario,
    Ventas,
    CreateVenta,
    EditRol,
    IndexMpagos,
    IndexCxc,
    IndexPago,
    CreatePago,
    IndexCompra,
    CreateCompra,
    IndexCxp,
    KardexProducto
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    routing,
    FormsModule,
    HttpClientModule,
    NgbPaginationModule,
    NgbModule,
    NgxPaginationModule,
    NgSelectModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
