export interface Proveedor {
  id: number;
  empresa_id: number;
  nombre: string;
  direccion: string;
  telefono?: string;
  correo?: string;
  nit: string;
}