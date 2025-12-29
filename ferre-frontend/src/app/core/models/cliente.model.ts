export interface Cliente {
  id: number;
  empresa_id: number;
  nombre: string;
  direccion: string;
  telefono?: string;
  correo?: string;
  nit: string;
  tipo_cliente: string;
  limite_credito: number;
}