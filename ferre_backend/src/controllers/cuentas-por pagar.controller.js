// src/controllers/cuentas-por-pagar.controller.js
const {
  CuentaPorPagar,
  Proveedor,
  Empresa,
  Compra,
  PagoDetalle,
  Pago,
} = require('../database/init-models');
const { Op } = require('sequelize');

// 🔹 Listado CxP con filtros
exports.getAllCXP = async (req, res) => {
  try {
    const empresa_id = req.user.empresa_id;
    const {
      proveedor_id,
      estado,          // 'PENDIENTE', 'PARCIAL', 'PAGADA', 'VENCIDA', 'ANULADA' o 'PENDIENTE,PARCIAL'
      fecha_desde,
      fecha_hasta,
    } = req.query;

    const where = { empresa_id };

    if (proveedor_id) where.proveedor_id = proveedor_id;

    if (estado) {
      const estados = String(estado)
        .split(',')
        .map((e) => e.trim())
        .filter(Boolean);

      if (estados.length === 1) {
        where.estado = estados[0];
      } else if (estados.length > 1) {
        where.estado = { [Op.in]: estados };
      }
    }

    if (fecha_desde || fecha_hasta) {
      where.fecha_emision = {};
      if (fecha_desde) {
        where.fecha_emision[Op.gte] = new Date(fecha_desde);
      }
      if (fecha_hasta) {
        where.fecha_emision[Op.lte] = new Date(fecha_hasta);
      }
    }

    const data = await CuentaPorPagar.findAll({
      where,
      include: [
        {
          model: Proveedor,
          as: 'proveedor',
          attributes: ['id', 'nombre', 'nit'],
        },
        {
          model: Compra,
          as: 'compra',
          attributes: ['id', 'fecha', 'numero_factura', 'tipo_compra', 'total'],
        },
      ],
      order: [['fecha_emision', 'DESC'], ['id', 'DESC']],
    });

    return res.json({ data });
  } catch (error) {
    console.error('getAllCXP error:', error);
    return res.status(500).json({
      mensaje: 'Error al obtener cuentas por pagar',
      error: error.message,
    });
  }
};

// 🔹 Detalle de una CxP por ID (con pagos aplicados)
exports.getCXPById = async (req, res) => {
  try {
    const empresa_id = req.user.empresa_id;
    const { id } = req.params;

    const cxp = await CuentaPorPagar.findOne({
      where: { id, empresa_id },
      include: [
        {
          model: Proveedor,
          as: 'proveedor',
          attributes: ['id', 'nombre', 'nit', 'telefono', 'correo'],
        },
        {
          model: Compra,
          as: 'compra',
          attributes: ['id', 'fecha', 'numero_factura', 'tipo_compra', 'total'],
        },
        {
          model: PagoDetalle,
          as: 'pagos_aplicados',
          include: [
            {
              model: Pago,
              as: 'pago',
              attributes: [
                'id',
                'fecha_pago',
                'monto_total',
                'metodo_pago_id',
                'referencia',
                'observacion',
                'estado',
              ],
            },
          ],
        },
      ],
    });

    if (!cxp) {
      return res.status(404).json({ mensaje: 'Cuenta por pagar no encontrada' });
    }

    // Filtrar pagos ANULADOS
    const plain = cxp.get({ plain: true });

    if (Array.isArray(plain.pagos_aplicados)) {
      plain.pagos_aplicados = plain.pagos_aplicados.filter(
        (det) => !det.pago || det.pago.estado !== 'ANULADO'
      );
    }

    return res.json({ data: plain });
  } catch (error) {
    console.error('getCXPById error:', error);
    return res.status(500).json({
      mensaje: 'Error al obtener la cuenta por pagar',
      error: error.message,
    });
  }
};
