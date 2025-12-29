import { Proveedor } from './proveedor.model';
import { Producto } from './producto.model';

export type TipoCompra = 'CONTADO' | 'CREDITO';
export type EstadoCompra = 'ACTIVA' | 'ANULADA';

export type EstadoCxp =
  | 'PENDIENTE'
  | 'PARCIAL'
  | 'PAGADA'
  | 'VENCIDA'
  | 'ANULADA';

export interface CuentaPorPagarResumen {
  id: number;
  monto_total: number;
  saldo_pendiente: number;
  estado: EstadoCxp;
}

export interface DetalleCompra {
  id?: number;
  compra_id?: number;
  producto_id: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  Producto?: Producto; // por si viene en el detalle del backend
}

export interface GastoCompra {
  id?: number;
  compra_id?: number;
  descripcion: string;
  monto: number;
}

export interface Compra {
  id: number;
  proveedor_id: number;
  empresa_id: number;
  fecha: string;
  tipo_compra: TipoCompra;
  numero_factura?: string | null;
  total: number;
  observacion?: string | null;
  estado: EstadoCompra;

  proveedor?: Proveedor;
  cuenta_por_pagar?: CuentaPorPagarResumen;

  // para el detalle
  detalles?: DetalleCompra[];
  gastos?: GastoCompra[];
}
