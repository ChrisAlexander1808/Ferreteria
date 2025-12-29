// src/controllers/cuentas-por-cobrar.controller.js
const {
  CuentaPorCobrar,
  Cliente,
  Venta,
  PagoDetalle,
  Pago,
} = require('../database/init-models');
const { Op } = require('sequelize');

exports.getAllCxC = async (req, res) => {
  try {
    const empresa_id = req.user.empresa_id;
    const { cliente_id, estado } = req.query;

    const where = { empresa_id };

    if (cliente_id) {
      where.cliente_id = cliente_id;
    }

    if (estado) {
      // estado puede ser PENDIENTE, PARCIAL, PAGADA, ANULADA, VENCIDA
      where.estado = estado;
    }

    const data = await CuentaPorCobrar.findAll({
      where,
      include: [
        {
          model: Cliente,
          as: 'cliente',
          attributes: ['id', 'nombre', 'nit'],
        },
        {
          model: Venta,
          as: 'venta',
          attributes: ['id', 'fecha', 'numero_factura', 'tipo_venta', 'total'],
        },
      ],
      order: [['fecha_emision', 'DESC']],
    });

    return res.json({ data });
  } catch (error) {
    console.error('getAllCxC error:', error);
    return res.status(500).json({
      mensaje: 'Error al obtener cuentas por cobrar',
      error: error.message,
    });
  }
};

// 🔹 Obtener una CxC por ID (con pagos aplicados)
exports.getCxCById = async (req, res) => {
  try {
    const empresa_id = req.user.empresa_id;
    const { id } = req.params;

    const cxc = await CuentaPorCobrar.findOne({
      where: { id, empresa_id },
      include: [
        {
          model: Cliente,
          as: 'cliente',
          attributes: ['id', 'nombre', 'nit', 'telefono', 'correo'],
        },
        {
          model: Venta,
          as: 'venta',
          attributes: ['id', 'fecha', 'numero_factura', 'tipo_venta', 'total'],
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
              where: {
                estado: { [Op.ne]: 'ANULADO' },
              },
                required: true, // por si algún día hay PagoDetalle sin Pago            
            },
          ],
        },
      ],
    });

    if (!cxc) {
      return res.status(404).json({ mensaje: 'Cuenta por cobrar no encontrada' });
    }


    return res.json({ data: cxc });
  } catch (error) {
    console.error('getCxCById error:', error);
    return res.status(500).json({
      mensaje: 'Error al obtener la cuenta por cobrar',
      error: error.message,
    });
  }
};

// 🔹 Listar CxC por cliente (para estado de cuenta, por ejemplo)
exports.getCxCByCliente = async (req, res) => {
  try {
    const empresa_id = req.user.empresa_id;
    const { cliente_id } = req.params;

    const data = await CuentaPorCobrar.findAll({
      where: {
        empresa_id,
        cliente_id,
        estado: { [Op.not]: 'ANULADA' },
      },
      include: [
        {
          model: Venta,
          as: 'venta',
          attributes: ['id', 'fecha', 'numero_factura', 'total'],
        },
      ],
      order: [['fecha_emision', 'DESC']],
    });

    return res.json({ data });
  } catch (error) {
    console.error('getCxCByCliente error:', error);
    return res.status(500).json({
      mensaje: 'Error al obtener cuentas por cobrar del cliente',
      error: error.message,
    });
  }
};