export interface Modulo {
  id: number;
  nombre: string;
  clave: string;
  descripcion: string;
}

export interface Permiso {
  id: number;
  clave: string;
  descripcion: string;
  moduloId?: number;
  Modulo: Modulo;
}
