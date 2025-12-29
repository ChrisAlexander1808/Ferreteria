// src/app/core/models/pago.model.ts
export interface PagoDetalleItem {
  id?: number;
  pago_id?: number;
  cxc_id?: number | null;
  cxp_id?: number | null;
  monto_aplicado: number;
  observacion?: string | null;
  // Para el detalle:
  cuenta_por_cobrar?: any;
  cuenta_por_pagar?: any;
}

export type OrigenPago = 'CXC' | 'CXP' | 'CC' | 'CP';
export type EstadoPago = 'REGISTRADO' | 'ANULADO';

export interface Pago {
  id: number;
  empresa_id: number;
  origen: OrigenPago;
  cliente_id?: number | null;
  proveedor_id?: number | null;
  tipo_documento: 'PAGO' | 'NOTA_CREDITO' | 'NOTA_DEBITO' | 'AJUSTE';
  metodo_pago_id?: number | null;
  fecha_pago: string;
  monto_total: number;
  referencia?: string | null;
  observacion?: string | null;
  estado: EstadoPago;
  metodo_pago?: {
    id: number;
    nombre: string;
  };
  // 👇 nuevo
  cliente?: {
    id: number;
    nombre: string;
    nit?: string;
  } | null;

  proveedor?: {
    id: number;
    nombre: string;
    nit?: string;
  } | null;
  detalles?: PagoDetalleItem[];
}

export interface ResumenOrigen {
  cantidad: number;
  total: number;
}

export interface ResumenPagos {
  CXC: ResumenOrigen;
  CXP: ResumenOrigen;
  CC: ResumenOrigen;
  CP: ResumenOrigen;
  global: ResumenOrigen;
}
