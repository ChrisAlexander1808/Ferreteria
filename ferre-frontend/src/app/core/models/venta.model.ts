export interface VentaDetalleProducto {
  id?: number;
  nombre: string;
}

export interface VentaDetalle {
  id: number;
  venta_id: number;
  tipo_item: 'BIEN' | 'SERVICIO';
  producto_id?: number | null;
  producto?: VentaDetalleProducto | null;
  descripcion?: string | null;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export interface VentaCliente {
  id?: number;
  nombre: string;
}

export interface Venta {
  id: number;
  cliente_id?: number | null;
  cliente?: VentaCliente | null;
  empresa_id?: number;
  fecha: string;
  observacion?: string | null;
  numero_factura?: string | null;
  total: number;
  estado: 'ACTIVA' | 'ANULADA';
  tipo_venta: 'CONTADO' | 'CREDITO';
  detalles?: VentaDetalle[];
  createdAt?: string;
  updatedAt?: string;
}
