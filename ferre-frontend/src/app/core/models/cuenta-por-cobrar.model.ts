import { Cliente } from './cliente.model';

export interface CuentaPorCobrar {
  id: number;
  venta_id: number;
  cliente_id: number;
  empresa_id: number;
  fecha_emision: string;
  fecha_vencimiento: string | null;
  monto_total: number | string;
  saldo_pendiente: number | string;
  estado: 'PENDIENTE' | 'PARCIAL' | 'PAGADA' | 'ANULADA' | 'VENCIDA';

  // Relación con cliente (ya la trae el backend en getCXCById)
  cliente?: Cliente | any;

  // 🔹 Relación con venta (lo que está dando el error en el template)
  venta?: {
    id: number;
    fecha: string;
    numero_factura: string | null;
    tipo_venta: string;
    total: number | string;
  };

  // Si quieres, también lo que ya devuelve pagos_aplicados
  pagos_aplicados?: any[];
}
