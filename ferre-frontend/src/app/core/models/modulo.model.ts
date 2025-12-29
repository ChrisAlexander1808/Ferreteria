export interface Modulo {
  id: number;
  clave: string;
  nombre: string;
  descripcion?: string;
  activo?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
