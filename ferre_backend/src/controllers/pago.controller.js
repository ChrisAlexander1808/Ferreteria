// src/controllers/pago.controller.js
const {
  sequelize,
  Pago,
  PagoDetalle,
  CuentaPorCobrar,
  Cliente,
  Proveedor,
  MetodoPago,
  CuentaPorPagar,
  Venta,
  Compra, // por si luego usas CXP
} = require('../database/init-models');
const { Op } = require('sequelize');

exports.crearPago = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const empresa_id = req.user.empresa_id;

    const {
      origen,          // 'CXC' | 'CXP'
      cliente_id,
      proveedor_id,
      tipo_documento,  // 'PAGO', 'NOTA_CREDITO', etc.
      metodo_pago_id,
      fecha_pago,
      monto_total,
      observacion,
      referencia,
      // detalles: [{ cxc_id?, cxp_id?, monto_aplicado }]
      detalles,
    } = req.body;

    // 🔹 Validaciones básicas
    if (!origen || !['CXC', 'CXP'].includes(origen)) {
      return res.status(400).json({ mensaje: 'origen debe ser CXC o CXP.' });
    }

    if (!metodo_pago_id) {
      return res.status(400).json({ mensaje: 'Debe indicar un método de pago.' });
    }

    if (!Array.isArray(detalles) || detalles.length === 0) {
      return res.status(400).json({ mensaje: 'Debe incluir al menos un detalle de pago.' });
    }

    const totalDetalles = detalles.reduce(
      (acc, d) => acc + parseFloat(d.monto_aplicado || 0),
      0
    );

    if (Number(monto_total) !== totalDetalles) {
      return res.status(400).json({
        mensaje: `El monto_total (${monto_total}) no coincide con la suma de detalles (${totalDetalles}).`,
      });
    }

    // 🔹 Validar cliente / proveedor según origen
    if (origen === 'CXC') {
      if (!cliente_id) {
        return res
          .status(400)
          .json({ mensaje: 'Debe indicar cliente_id para pagos de CxC.' });
      }
      const cliente = await Cliente.findOne({
        where: { id: cliente_id, empresa_id },
        transaction: t,
      });
      if (!cliente) {
        return res
          .status(404)
          .json({ mensaje: 'Cliente no encontrado para esta empresa.' });
      }
    }

    if (origen === 'CXP') {
      if (!proveedor_id) {
        return res
          .status(400)
          .json({ mensaje: 'Debe indicar proveedor_id para pagos de CxP.' });
      }
      // Aquí más adelante validás proveedor/empresa
    }

    // 🔹 Crear Pago
    const pago = await Pago.create(
      {
        empresa_id,
        origen, // 'CXC' | 'CXP'
        cliente_id: origen === 'CXC' ? cliente_id : null,
        proveedor_id: origen === 'CXP' ? proveedor_id : null,
        tipo_documento: tipo_documento || 'PAGO',
        fecha_pago: fecha_pago || new Date(),
        monto_total: Number(monto_total),
        observacion: observacion || null,
        metodo_pago_id,
        referencia: referencia || null,
      },
      { transaction: t }
    );

    // 🔹 Recorrer detalles y aplicar a CxC / CxP
    for (const d of detalles) {
      const monto_aplicado = parseFloat(d.monto_aplicado || 0);
      if (monto_aplicado <= 0) {
        throw new Error('Todos los montos aplicados deben ser mayores a 0.');
      }

      let cxc = null;
      let cxp = null;

      if (origen === 'CXC') {
        if (!d.cxc_id) {
          throw new Error('Falta cxc_id en un detalle de pago de CxC.');
        }

        cxc = await CuentaPorCobrar.findOne({
          where: {
            id: d.cxc_id,
            empresa_id,
            cliente_id,
            estado: { [Op.not]: 'ANULADA' },
          },
          transaction: t,
          lock: t.LOCK.UPDATE,
        });

        if (!cxc) {
          throw new Error(
            `Cuenta por cobrar ID ${d.cxc_id} no encontrada o no pertenece a este cliente/empresa.`
          );
        }

        if (Number(cxc.saldo_pendiente) < monto_aplicado) {
          throw new Error(
            `El monto aplicado (${monto_aplicado}) supera el saldo pendiente (${cxc.saldo_pendiente}) de la CxC #${cxc.id}.`
          );
        }

        // Actualizar saldo y estado
        cxc.saldo_pendiente = Number(cxc.saldo_pendiente) - monto_aplicado;

        if (cxc.saldo_pendiente <= 0.01) {
          cxc.estado = 'PAGADA';
          cxc.saldo_pendiente = 0;
        } else {
          cxc.estado = 'PARCIAL';
        }

        await cxc.save({ transaction: t });
      }

      // (más adelante podés hacer lo mismo para CxP)
      if (origen === 'CXP') {
        if (!d.cxp_id) {
          throw new Error('Falta cxp_id en un detalle de pago de CxP.');
        }
        cxp = await CuentaPorPagar.findOne({
          where: {
            id: d.cxp_id,
            empresa_id,
            proveedor_id,
            estado: { [Op.not]: 'ANULADA' },
          },
          transaction: t,
          lock: t.LOCK.UPDATE,
        });

        if (!cxp) {
          throw new Error(
            `Cuenta por pagar ID ${d.cxp_id} no encontrada o no pertenece a este proveedor/empresa.`
          );
        }

        if (Number(cxp.saldo_pendiente) < monto_aplicado) {
          throw new Error(
            `El monto aplicado (${monto_aplicado}) supera el saldo pendiente (${cxp.saldo_pendiente}) de la CxP #${cxp.id}.`
          );
        }

        // Actualizar saldo y estado
        cxp.saldo_pendiente = Number(cxp.saldo_pendiente) - monto_aplicado;

        if (cxp.saldo_pendiente <= 0.01) {
          cxp.estado = 'PAGADA';
          cxp.saldo_pendiente = 0;
        } else {
          cxp.estado = 'PARCIAL';
        }

        await cxp.save({ transaction: t });
      }

      // 🔹 Crear PagoDetalle
      await PagoDetalle.create(
        {
          pago_id: pago.id,
          cxc_id: cxc ? cxc.id : null,
          cxp_id: cxp ? cxp.id : null,
          monto_aplicado,
          observacion:
            d.observacion ||
            (cxc
              ? `Pago aplicado a CxC #${cxc.id}`
              : cxp
              ? `Pago aplicado a CxP #${cxp.id}`
              : pago.observacion),
        },
        { transaction: t }
      );
    }

    await t.commit();

    return res.status(201).json({
      mensaje: 'Pago registrado correctamente.',
      data: { pago_id: pago.id },
    });
  } catch (error) {
    await t.rollback();
    console.error(error);
    return res.status(500).json({
      mensaje: 'Error al registrar pago',
      error: error.message,
    });
  }
};

// 🔹 Listar pagos
exports.getAll = async (req, res) => {
  try {
    const empresa_id = req.user.empresa_id;
    const {
      origen,        // 'CXC' | 'CXP' | 'CC' | 'CP'
      cliente_id,
      proveedor_id,
      fecha_desde,   // 'YYYY-MM-DD'
      fecha_hasta,   // 'YYYY-MM-DD'
    } = req.query;

    const where = { empresa_id };

    if (origen) {
      where.origen = origen;
    }

    if (cliente_id) {
      where.cliente_id = cliente_id;
    }

    if (proveedor_id) {
      where.proveedor_id = proveedor_id;
    }

    if (fecha_desde || fecha_hasta) {
      where.fecha_pago = {};

      if (fecha_desde) {
        where.fecha_pago[Op.gte] = new Date(fecha_desde);
      }

      if (fecha_hasta) {
        // incluir todo el día hasta las 23:59
        const hasta = new Date(fecha_hasta);
        hasta.setDate(hasta.getDate() + 1);
        where.fecha_pago[Op.lt] = hasta;
      }
    }

    const pagos = await Pago.findAll({
      where,
      include: [
        {
          model: MetodoPago,
          as: 'metodo_pago',
          attributes: ['id', 'nombre'],
        },
        {
          model: Cliente,
          as: 'cliente',
          attributes: ['id', 'nombre', 'nit'],
        },
        {
          model: Proveedor,
          as: 'proveedor',
          attributes: ['id', 'nombre', 'nit'],
        },
      ],
      order: [
        ['fecha_pago', 'DESC'],
        ['id', 'DESC'],
      ],
    });

    // 🔹 Resumen por origen
    const base = () => ({ cantidad: 0, total: 0 });
    const resumen = {
      CXC: base(),
      CXP: base(),
      CC: base(),
      CP: base(),
      global: base(),
    };

    pagos.forEach((p) => {
      const orig = p.origen;
      const monto = Number(p.monto_total) || 0;

      if (resumen[orig]) {
        resumen[orig].cantidad += 1;
        resumen[orig].total += monto;
      }

      resumen.global.cantidad += 1;
      resumen.global.total += monto;
    });

    return res.json({ data: pagos, resumen });
  } catch (error) {
    console.error('getAllPagos error:', error);
    return res.status(500).json({
      mensaje: 'Error al obtener pagos',
      error: error.message,
    });
  }
};

// 🔹 Obtener pago por ID con detalles y CxC
exports.getById = async (req, res) => {
  try {
    const empresa_id = req.user.empresa_id;
    const id = req.params.id;

    const pago = await Pago.findOne({
      where: { id, empresa_id },
      include: [
        {
          model: MetodoPago,
          as: 'metodo_pago',
          attributes: ['id', 'nombre'],
        },
        {
          model: PagoDetalle,
          as: 'detalles',
          include: [
            {
              model: CuentaPorCobrar,
              as: 'cuenta_por_cobrar',
              include: [
                {
                  model: Cliente,
                  as: 'cliente',
                  attributes: ['id', 'nombre', 'nit'],
                },
                {
                  model: Venta,
                  as: 'venta',
                  attributes: ['id', 'numero_factura', 'total'],
                },
              ],
            },
            {
              model: CuentaPorPagar,
              as: 'cuenta_por_pagar',
              include: [
                {
                  model: Proveedor,
                  as: 'proveedor',
                  attributes: ['id', 'nombre', 'nit'],
                },
                {
                  model: Compra,
                  as: 'compra',
                  attributes: ['id', 'numero_factura', 'total'],
                }
              ]
            },
          ],
        },
      ],
    });

    if (!pago) {
      return res.status(404).json({ mensaje: 'Pago no encontrado' });
    }

    return res.json({ data: pago });
  } catch (error) {
    return res.status(500).json({
      mensaje: 'Error al obtener el pago',
      error: error.message,
    });
  }
};

// src/controllers/pago.controller.js

exports.anularPago = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const empresa_id = req.user.empresa_id;
    const { id } = req.params;

    const pago = await Pago.findOne({
      where: { id, empresa_id },
      include: [
        {
          model: PagoDetalle,
          as: 'detalles',
        },
      ],
      transaction: t,
    });

    if (!pago) {
      await t.rollback();
      return res.status(404).json({ mensaje: 'Pago no encontrado' });
    }

    if (pago.estado === 'ANULADO') {
      await t.rollback();
      return res.status(400).json({ mensaje: 'El pago ya está anulado' });
    }

    // 🔹 Si el pago es de CxC -> revertimos saldo de las CxC afectadas
    if (pago.origen === 'CXC') {
      for (const det of pago.detalles) {
        if (!det.cxc_id) continue;

        const cxc = await CuentaPorCobrar.findOne({
          where: {
            id: det.cxc_id,
            empresa_id,
          },
          transaction: t,
          lock: t.LOCK.UPDATE,
        });

        if (!cxc) continue;

        const monto_aplicado = Number(det.monto_aplicado) || 0;
        cxc.saldo_pendiente =
          Number(cxc.saldo_pendiente || 0) + monto_aplicado;

        // Recalcular estado
        const monto_total = Number(cxc.monto_total || 0);
        if (cxc.saldo_pendiente >= monto_total - 0.01) {
          cxc.estado = 'PENDIENTE'; // volvió casi a su estado original
        } else if (cxc.saldo_pendiente > 0) {
          cxc.estado = 'PARCIAL';
        } else {
          cxc.estado = 'PAGADA';
        }

        await cxc.save({ transaction: t });
      }
    }

    // 🔹 (Futuro) Si el pago es de CxP, revertir saldo en CxP similar

    pago.estado = 'ANULADO';
    await pago.save({ transaction: t });

    await t.commit();
    return res.json({ mensaje: 'Pago anulado correctamente.' });
  } catch (error) {
    await t.rollback();
    console.error('anularPago error:', error);
    return res.status(500).json({
      mensaje: 'Error al anular el pago',
      error: error.message,
    });
  }
};

