export interface Producto {
  id: number;
  nombre: string;
  codigo: string;
  descripcion?: string;
  precio_compra: number;
  precio_venta: number;
  stock_actual: number;
  unidad_medida: string;
}

export interface MovimientoInventario {
   id: number;
   tipo: 'ENTRADA' | 'SALIDA' | 'AJUSTE';
   cantidad: number;
   motivo: string;
   referencia: string;
   createdAt?: string;
   producto?: Producto;
}