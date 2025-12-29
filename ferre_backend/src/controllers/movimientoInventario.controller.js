// src/controllers/movimiento.controller.js
const { MovimientoInventario, Producto, sequelize } = require('../database/init-models');
const { Op } = require('sequelize');

exports.registrarMovimiento = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { producto_id, tipo, cantidad, motivo, referencia } = req.body;

    const producto = await Producto.findByPk(producto_id, { transaction: t });
    if (!producto) return res.status(404).json({ message: 'Producto no encontrado' });

    // Actualizar stock según tipo
    let nuevoStock = producto.stock_actual;
    if (tipo === 'ENTRADA') nuevoStock += cantidad;
    else if (tipo === 'SALIDA') nuevoStock -= cantidad;
    else if (tipo === 'AJUSTE') nuevoStock = cantidad;

    if (nuevoStock < 0) {
      await t.rollback();
      return res.status(400).json({ message: 'El stock no puede ser negativo' });
    }

    await producto.update({ stock_actual: nuevoStock }, { transaction: t });

    const movimiento = await MovimientoInventario.create(
      { producto_id, tipo, cantidad, motivo, referencia },
      { transaction: t }
    );

    await t.commit();
    res.status(201).json({ message: 'Movimiento registrado correctamente', data: movimiento });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ message: 'Error al registrar movimiento', error: error.message });
  }
};

// ✅ Obtener movimientos (opcional por producto)
exports.getAll = async (req, res) => {
  try {
    const { producto_id } = req.query;
    const where = producto_id ? { producto_id } : {};

    const movimientos = await MovimientoInventario.findAll({
      where,
      include: [{ model: Producto, as: 'producto' }],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({ data: movimientos });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener movimientos', error: error.message });
  }
};

exports.obtenerKardexProducto = async (req, res) => {
  try {
    const producto_id = req.params.id;
    const { desde, hasta } = req.query;

    const where = { producto_id };

    if (desde || hasta) {
      where.createdAt = {};

      // ✅ desde: inicio del día
      if (desde) {
        where.createdAt[Op.gte] = new Date(`${desde}T00:00:00.000Z`);
      }

      // ✅ hasta: fin del día (inclusivo)
      if (hasta) {
        where.createdAt[Op.lte] = new Date(`${hasta}T23:59:59.999Z`);
      }
    }

    const producto = await Producto.findByPk(producto_id);
    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    const movimientos = await MovimientoInventario.findAll({
      where,
      order: [['createdAt', 'ASC']],
    });

    let saldo = 0;
    const kardex = movimientos.map((m) => {
      const cantidad = Number(m.cantidad) || 0;
      let entrada = 0;
      let salida = 0;

      // Ojo: aquí respetamos AJUSTE positivo/negativo
      if (m.tipo === 'ENTRADA') {
        entrada = cantidad;
        saldo += cantidad;
      } else if (m.tipo === 'SALIDA') {
        salida = cantidad;
        saldo -= cantidad;
      } else if (m.tipo === 'AJUSTE') {
        if (cantidad >= 0) {
          entrada = cantidad;
          saldo += cantidad;
        } else {
          salida = Math.abs(cantidad);
          saldo -= Math.abs(cantidad);
        }
      }

      return {
        id: m.id,
        fecha: m.createdAt,
        tipo: m.tipo,
        motivo: m.motivo,
        referencia: m.referencia,
        entrada,
        salida,
        saldo,
      };
    });

    res.status(200).json({
      producto: {
        id: producto.id,
        nombre: producto.nombre,
        codigo: producto.codigo,
        unidad_medida: producto.unidad_medida,
        stock_actual: producto.stock_actual,
      },
      kardex,
    });
  } catch (error) {
    console.error('Error kardex:', error);
    res.status(500).json({
      message: 'Error al obtener kardex',
      error: error.message,
    });
  }
};