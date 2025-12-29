export interface Rol {
  id: number;
  nombre: string;
  descripcion: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Empresa {
  id: number;
  nombre: string;
}

export interface User {
  id: number;
  nombre: string;
  correo: string;
  contrasena: string;
  empresa_id: number;
  rol_id: number;
  modulos?: string[];   // ejemplo: ['VENTAS','INVENTARIO']
  permisos?: string[];  // ejemplo: ['VENTAS_CREATE']
  Rol: Rol;
  Empresa: Empresa
}
