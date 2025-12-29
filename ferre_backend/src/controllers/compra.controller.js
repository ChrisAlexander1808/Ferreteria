// src/controllers/compra.controller.js
const { Compra, DetalleCompra, GastoCompra, Producto, Proveedor, MovimientoInventario, CuentaPorPagar, sequelize } = require('../database/init-models');
// Crear una nueva compra
const { Op } = require('sequelize');

exports.crearCompra = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const empresa_id = req.user.empresa_id;

    const {
      proveedor_id,
      fecha,
      tipo_compra,        // 'CONTADO' | 'CREDITO'
      numero_factura,
      observacion,
      fecha_vencimiento,  // para CREDITO
      detalles,           // [{ producto_id, cantidad, precio_unitario }]
      gastos,             // [{ descripcion, monto }]
    } = req.body;

    if (!proveedor_id) {
      return res.status(400).json({ mensaje: 'Debe seleccionar un proveedor.' });
    }

    if (!fecha) {
      return res.status(400).json({ mensaje: 'Debe indicar la fecha de la compra.' });
    }

    if (!Array.isArray(detalles) || detalles.length === 0) {
      return res.status(400).json({ mensaje: 'Debe agregar al menos un producto en el detalle.' });
    }

    const tipo = tipo_compra === 'CREDITO' ? 'CREDITO' : 'CONTADO';

    // Validar proveedor pertenece a la empresa (si lo estás manejando así)
    const proveedor = await Proveedor.findOne({
      where: { id: proveedor_id, empresa_id },
      transaction: t,
    });
    if (!proveedor) {
      return res.status(404).json({ mensaje: 'Proveedor no encontrado para esta empresa.' });
    }

    // 🔹 Crear la compra vacía (total = 0) y luego la rellenamos
    const compra = await Compra.create({
      proveedor_id,
      empresa_id,
      fecha,
      tipo_compra: tipo,
      numero_factura: numero_factura || null,
      observacion: observacion || null,
      total: 0,
      estado: 'ACTIVA',
    }, { transaction: t });

    let totalCompra = 0;

    // 🔹 Procesar detalle
    for (const item of detalles) {
      const { producto_id, cantidad, precio_unitario } = item;

      if (!producto_id || !cantidad || !precio_unitario) {
        throw new Error('Todos los items deben tener producto_id, cantidad y precio_unitario.');
      }

      const producto = await Producto.findOne({
        where: { id: producto_id },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (!producto) {
        throw new Error(`Producto con ID ${producto_id} no encontrado para esta empresa.`);
      }

      const cant = Number(cantidad);
      const precio = Number(precio_unitario);
      const subtotal = cant * precio;
      totalCompra += subtotal;

      // Detalle de compra
      await DetalleCompra.create({
        compra_id: compra.id,
        producto_id,
        cantidad: cant,
        precio_unitario: precio,
        subtotal,
      }, { transaction: t });

      // Movimiento de inventario
      await MovimientoInventario.create({
        producto_id,
        tipo: 'ENTRADA',
        cantidad: cant,
        referencia: `COMPRA-${compra.id}`,
        motivo: 'Compra de producto',
        empresa_id,
      }, { transaction: t });

      // Actualizar stock + precio de compra
      producto.stock_actual = Number(producto.stock_actual || 0) + cant;

      // 👇 Ajusta el nombre de este campo según tu modelo (ej. precio_compra, costo_compra, etc.)
      if ('precio_compra' in producto) {
        producto.precio_compra = precio;
      }

      await producto.save({ transaction: t });
    }

    // 🔹 Gastos adicionales (no alimentan inventario)
    if (Array.isArray(gastos) && gastos.length > 0) {
      for (const g of gastos) {
        if (!g.descripcion || !g.monto) continue;

        const montoGasto = Number(g.monto) || 0;
        if (montoGasto <= 0) continue;

        await GastoCompra.create({
          compra_id: compra.id,
          descripcion: g.descripcion,
          monto: montoGasto,
        }, { transaction: t });

        totalCompra += montoGasto;
      }
    }

    // 🔹 Actualizar total de la compra
    compra.total = totalCompra;
    await compra.save({ transaction: t });

    // 🔹 Crear Cuenta por Pagar si es CREDITO
    let cxp = null;
    if (tipo === 'CREDITO') {
      if (!fecha_vencimiento) {
        throw new Error('Debe indicar fecha_vencimiento para compras al crédito.');
      }

      cxp = await CuentaPorPagar.create({
        compra_id: compra.id,
        proveedor_id,
        empresa_id,
        fecha_emision: fecha,
        fecha_vencimiento,
        monto_total: totalCompra,
        saldo_pendiente: totalCompra,
        estado: 'PENDIENTE',
      }, { transaction: t });
    }

    await t.commit();

    return res.status(201).json({
      mensaje: 'Compra registrada correctamente',
      data: {
        compra,
        cuenta_por_pagar: cxp,
      },
    });
  } catch (error) {
    await t.rollback();
    console.error('Error al crear compra:', error);
    return res.status(500).json({
      mensaje: 'Error al registrar la compra',
      error: error.message,
    });
  }
};
// Listar todas las compras
exports.obtenerCompras = async (req, res) => {
  try {
    const empresa_id = req.user.empresa_id;
    const { proveedor_id, tipo_compra, estado, fecha_desde, fecha_hasta } = req.query;

    const where = { empresa_id };

    if (proveedor_id) where.proveedor_id = proveedor_id;
    if (tipo_compra) where.tipo_compra = tipo_compra;
    if (estado) where.estado = estado; // ACTIVA / ANULADA

    // ✅ FILTRO POR FECHA
    if (fecha_desde || fecha_hasta) {
      where.fecha = {};

      if (fecha_desde) {
        where.fecha[Op.gte] = new Date(`${fecha_desde}T00:00:00`);
      }

      if (fecha_hasta) {
        where.fecha[Op.lte] = new Date(`${fecha_hasta}T23:59:59`);
      }
    }

    const compras = await Compra.findAll({
      where,
      include: [
        {
          model: Proveedor,
          as: 'proveedor',
          attributes: ['id', 'nombre', 'nit'],
        },
        {
          model: CuentaPorPagar,
          as: 'cuenta_por_pagar',
          attributes: ['id', 'monto_total', 'saldo_pendiente', 'estado'],
        },
      ],
      order: [['fecha', 'DESC'], ['id', 'DESC']],
    });

    return res.json({ data: compras });
  } catch (error) {
    console.error('Error al obtener compras:', error);
    return res.status(500).json({
      mensaje: 'Error al obtener las compras',
      error: error.message,
    });
  }
};

// Obtener compra por ID
exports.obtenerCompraPorId = async (req, res) => {
  try {
    const empresa_id = req.user.empresa_id;
    const { id } = req.params;

    const compra = await Compra.findOne({
      where: { id, empresa_id },
      include: [
        {
          model: Proveedor,
          as: 'proveedor',
        },
        {
          model: DetalleCompra,
          as: 'detalles',
          include: [
            { model: Producto, as: 'Producto' }, // o as que tengas definido
          ],
        },
        {
          model: GastoCompra,
          as: 'gastos',
        },
        {
          model: CuentaPorPagar,
          as: 'cuenta_por_pagar',
        },
      ],
    });

    if (!compra) {
      return res.status(404).json({ mensaje: 'Compra no encontrada' });
    }

    return res.json({ data: compra });
  } catch (error) {
    console.error('Error al obtener compra:', error);
    return res.status(500).json({
      mensaje: 'Error al obtener la compra',
      error: error.message,
    });
  }
};

// Anular compra (revertir inventario y CxP si aplica)
exports.anularCompra = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const empresa_id = req.user.empresa_id;
    const { id } = req.params;

    // 1) Bloqueamos SOLO la compra
    const compra = await Compra.findOne({
      where: { id, empresa_id },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!compra) {
      await t.rollback();
      return res.status(404).json({ mensaje: 'Compra no encontrada' });
    }

    if (compra.estado === 'ANULADA') {
      await t.rollback();
      return res.status(400).json({ mensaje: 'La compra ya está anulada' });
    }

    // 2) Traer CxP ligada (si existe), en consulta separada
    const cxp = await CuentaPorPagar.findOne({
      where: {
        compra_id: compra.id,
        empresa_id,
      },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (cxp) {
      // Si algún día hay pagos parciales de CxP, aquí revisas PagoDetalle
      if (Number(cxp.saldo_pendiente) < Number(cxp.monto_total)) {
        await t.rollback();
        return res.status(400).json({
          mensaje:
            'No se puede anular la compra porque la cuenta por pagar tiene pagos aplicados.',
        });
      }

      // Marcar CxP como ANULADA
      cxp.estado = 'ANULADA';
      cxp.saldo_pendiente = 0;
      await cxp.save({ transaction: t });
    }

    // 3) Traer detalles de compra en otra consulta
    const detalles = await DetalleCompra.findAll({
      where: { compra_id: compra.id },
      transaction: t,
    });

    // 4) Revertir inventario
    for (const det of detalles) {
      const producto = await Producto.findOne({
        where: { id: det.producto_id },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (!producto) continue;

      const cant = Number(det.cantidad) || 0;

      producto.stock_actual = Number(producto.stock_actual || 0) - cant;
      await producto.save({ transaction: t });

      await MovimientoInventario.create(
        {
          producto_id: det.producto_id,
          tipo: 'SALIDA',
          cantidad: cant,
          referencia: `ANULACION-COMPRA-${compra.id}`,
          motivo: 'Anulación de compra',
          empresa_id,
        },
        { transaction: t }
      );
    }

    // 5) Marcar compra ANULADA
    compra.estado = 'ANULADA';
    await compra.save({ transaction: t });

    await t.commit();
    return res.json({ mensaje: 'Compra anulada correctamente.' });
  } catch (error) {
    await t.rollback();
    console.error('Error al anular compra:', error);
    return res.status(500).json({
      mensaje: 'Error al anular la compra',
      error: error.message,
    });
  }
};

