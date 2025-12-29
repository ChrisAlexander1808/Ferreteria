export interface Empresa {
  id: number;
  nombre: string;
  nit: string;
  direccion?: string;
  telefono?: string;
  correo?: string;
  estado?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
