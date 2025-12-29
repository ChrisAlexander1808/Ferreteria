// src/controllers/dashboard.controller.js
const {
  sequelize,
  Venta,
  Compra,
  Pago,
  CuentaPorCobrar,
  CuentaPorPagar,
  DetalleVenta,
  Producto,
} = require('../database/init-models');

const { Op } = require('sequelize');

// Helper: obtener rango de fechas según año / mes
function getDateRange(yearParam, monthParam) {
  const now = new Date();
  const year = yearParam ? parseInt(yearParam, 10) : now.getFullYear();
  const monthStr = monthParam || 'ALL';

  let desde;
  let hasta;

  if (!monthStr || monthStr === 'ALL') {
    // Año completo
    desde = new Date(year, 0, 1);       // 1 enero
    hasta = new Date(year + 1, 0, 1);   // 1 enero año siguiente (exclusivo)
  } else {
    const monthIndex = parseInt(monthStr, 10) - 1; // 0–11
    desde = new Date(year, monthIndex, 1);
    hasta = new Date(year, monthIndex + 1, 1);
  }

  return { year, desde, hasta, monthStr };
}

// Helper: convertir resultado de SUM() (string/null) a número
function num(val) {
  return Number(val || 0);
}

// Helper: mergear series mensuales por mes
function mergeSeries(ventasRows, comprasRows) {
  const mapa = new Map();

  (ventasRows || []).forEach((r) => {
    const mes = r.mes;
    if (!mapa.has(mes)) {
      mapa.set(mes, { mes, ventas: 0, compras: 0 });
    }
    const item = mapa.get(mes);
    item.ventas = num(r.total_ventas);
  });

  (comprasRows || []).forEach((r) => {
    const mes = r.mes;
    if (!mapa.has(mes)) {
      mapa.set(mes, { mes, ventas: 0, compras: 0 });
    }
    const item = mapa.get(mes);
    item.compras = num(r.total_compras);
  });

  return Array.from(mapa.values()).sort((a, b) =>
    a.mes.localeCompare(b.mes)
  );
}

function mergeFlujo(cobrosRows, pagosRows) {
  const mapa = new Map();

  (cobrosRows || []).forEach((r) => {
    const mes = r.mes;
    if (!mapa.has(mes)) {
      mapa.set(mes, { mes, cobros: 0, pagos: 0 });
    }
    const item = mapa.get(mes);
    item.cobros = num(r.total_cobros);
  });

  (pagosRows || []).forEach((r) => {
    const mes = r.mes;
    if (!mapa.has(mes)) {
      mapa.set(mes, { mes, cobros: 0, pagos: 0 });
    }
    const item = mapa.get(mes);
    item.pagos = num(r.total_pagos);
  });

  return Array.from(mapa.values()).sort((a, b) =>
    a.mes.localeCompare(b.mes)
  );
}

exports.getResumen = async (req, res) => {
  try {
    const empresa_id = req.user.empresa_id;
    const { year: yearParam, month: monthParam } = req.query;

    const { year, desde, hasta, monthStr } = getDateRange(yearParam, monthParam);

    // 📌 Filtros base para el período
    const filtroFechaVentas = {
      empresa_id,
      estado: true, // asumimos true = activa
      fecha: {
        [Op.gte]: desde,
        [Op.lt]: hasta,
      },
    };

    const filtroFechaCompras = {
      empresa_id,
      estado: 'ACTIVA',
      fecha: {
        [Op.gte]: desde,
        [Op.lt]: hasta,
      },
    };

    const filtroFechaPagos = {
      empresa_id,
      estado: 'REGISTRADO',
      fecha_pago: {
        [Op.gte]: desde,
        [Op.lt]: hasta,
      },
    };

    // 🔹 1. Totales (ventas, compras, resultado, cobros, pagos, saldos CxC/CxP, ventas por tipo)
    const [
      // total ventas por tipo
      ventasPorTipoRows,
      // total compras
      comprasTotalRow,
      // total cobros CxC
      cobrosTotalRow,
      // total pagos CxP
      pagosTotalRow,
      // saldo CxC
      saldoCxCRow,
      // saldo CxP
      saldoCxPRow,
    ] = await Promise.all([
      // Ventas por tipo (CONTADO / CREDITO)
      Venta.findAll({
        where: filtroFechaVentas,
        attributes: [
          'tipo_venta',
          [sequelize.fn('SUM', sequelize.col('total')), 'total'],
        ],
        group: ['tipo_venta'],
        raw: true,
      }),

      // Total compras
      Compra.findOne({
        where: filtroFechaCompras,
        attributes: [[sequelize.fn('SUM', sequelize.col('total')), 'total']],
        raw: true,
      }),

      // Cobros CxC
      Pago.findOne({
        where: {
          ...filtroFechaPagos,
          origen: 'CXC',
        },
        attributes: [[sequelize.fn('SUM', sequelize.col('monto_total')), 'total']],
        raw: true,
      }),

      // Pagos CxP
      Pago.findOne({
        where: {
          ...filtroFechaPagos,
          origen: 'CXP',
        },
        attributes: [[sequelize.fn('SUM', sequelize.col('monto_total')), 'total']],
        raw: true,
      }),

      // Saldo CxC
      CuentaPorCobrar.findOne({
        where: {
          empresa_id,
          estado: { [Op.in]: ['PENDIENTE', 'PARCIAL', 'VENCIDA'] },
        },
        attributes: [[sequelize.fn('SUM', sequelize.col('saldo_pendiente')), 'saldo']],
        raw: true,
      }),

      // Saldo CxP
      CuentaPorPagar.findOne({
        where: {
          empresa_id,
          estado: { [Op.in]: ['PENDIENTE', 'PARCIAL', 'VENCIDA'] },
        },
        attributes: [[sequelize.fn('SUM', sequelize.col('saldo_pendiente')), 'saldo']],
        raw: true,
      }),
    ]);

    // Procesar ventas por tipo
    let totalVentas = 0;
    const ventasPorTipo = { CONTADO: 0, CREDITO: 0 };

    (ventasPorTipoRows || []).forEach((r) => {
      const tipo = r.tipo_venta;
      const total = num(r.total);
      totalVentas += total;
      if (tipo === 'CONTADO' || tipo === 'CREDITO') {
        ventasPorTipo[tipo] = total;
      }
    });

    const totalCompras = num(comprasTotalRow?.total);
    const totalCobros = num(cobrosTotalRow?.total);
    const totalPagos = num(pagosTotalRow?.total);
    const saldoCxC = num(saldoCxCRow?.saldo);
    const saldoCxP = num(saldoCxPRow?.saldo);

    const resultadoBruto = totalVentas - totalCompras;

    // 🔹 2. Series Ventas vs Compras (siempre por año completo)
    const [ventasMensualesRows, comprasMensualesRows] = await Promise.all([
      Venta.findAll({
        where: {
          empresa_id,
          estado: true,
          fecha: {
            [Op.gte]: new Date(year, 0, 1),
            [Op.lt]: new Date(year + 1, 0, 1),
          },
        },
        attributes: [
          [sequelize.fn('to_char', sequelize.col('fecha'), 'YYYY-MM'), 'mes'],
          [sequelize.fn('SUM', sequelize.col('total')), 'total_ventas'],
        ],
        group: [sequelize.literal('mes')],
        order: [sequelize.literal('mes ASC')],
        raw: true,
      }),

      Compra.findAll({
        where: {
          empresa_id,
          estado: 'ACTIVA',
          fecha: {
            [Op.gte]: new Date(year, 0, 1),
            [Op.lt]: new Date(year + 1, 0, 1),
          },
        },
        attributes: [
          [sequelize.fn('to_char', sequelize.col('fecha'), 'YYYY-MM'), 'mes'],
          [sequelize.fn('SUM', sequelize.col('total')), 'total_compras'],
        ],
        group: [sequelize.literal('mes')],
        order: [sequelize.literal('mes ASC')],
        raw: true,
      }),
    ]);

    const ventasComprasMensuales = mergeSeries(
      ventasMensualesRows,
      comprasMensualesRows
    );

    // 🔹 3. Series flujo de efectivo (cobros vs pagos) por mes (año completo)
    const [cobrosMensualesRows, pagosMensualesRows] = await Promise.all([
      Pago.findAll({
        where: {
          empresa_id,
          estado: 'REGISTRADO',
          origen: 'CXC',
          fecha_pago: {
            [Op.gte]: new Date(year, 0, 1),
            [Op.lt]: new Date(year + 1, 0, 1),
          },
        },
        attributes: [
          [sequelize.fn('to_char', sequelize.col('fecha_pago'), 'YYYY-MM'), 'mes'],
          [sequelize.fn('SUM', sequelize.col('monto_total')), 'total_cobros'],
        ],
        group: [sequelize.literal('mes')],
        order: [sequelize.literal('mes ASC')],
        raw: true,
      }),

      Pago.findAll({
        where: {
          empresa_id,
          estado: 'REGISTRADO',
          origen: 'CXP',
          fecha_pago: {
            [Op.gte]: new Date(year, 0, 1),
            [Op.lt]: new Date(year + 1, 0, 1),
          },
        },
        attributes: [
          [sequelize.fn('to_char', sequelize.col('fecha_pago'), 'YYYY-MM'), 'mes'],
          [sequelize.fn('SUM', sequelize.col('monto_total')), 'total_pagos'],
        ],
        group: [sequelize.literal('mes')],
        order: [sequelize.literal('mes ASC')],
        raw: true,
      }),
    ]);

    const flujoEfectivoMensual = mergeFlujo(
      cobrosMensualesRows,
      pagosMensualesRows
    );

    // 🔹 4. Top productos más vendidos (por cantidad) en el período seleccionado
    const topProductosRows = await DetalleVenta.findAll({
      include: [
        {
          model: Venta,
          as: 'venta',
          attributes: [],
          where: {
            empresa_id,
            estado: true,
            fecha: {
              [Op.gte]: desde,
              [Op.lt]: hasta,
            },
          },
        },
        {
          model: Producto,
          as: 'producto',
          attributes: ['id', 'nombre'],
        },
      ],
      attributes: [
        'producto_id',
        [sequelize.fn('SUM', sequelize.col('cantidad')), 'cantidad'],
        [sequelize.fn('SUM', sequelize.col('subtotal')), 'total'],
      ],
      group: ['DetalleVenta.producto_id', 'producto.id', 'producto.nombre'],
      order: [[sequelize.literal('cantidad'), 'DESC']],
      limit: 10,
      raw: true,
    });

    const topProductos = (topProductosRows || []).map((r) => ({
      producto: r['producto.nombre'],
      cantidad: num(r.cantidad),
      total: num(r.total),
    }));

    // 🔹 Armar respuesta
    return res.json({
      data: {
        periodo: {
          year,
          month: monthStr,
          desde,
          hasta,
        },
        totales: {
          totalVentas,
          totalCompras,
          resultadoBruto,
          totalCobros,
          totalPagos,
          saldoCxC,
          saldoCxP,
        },
        ventasPorTipo,
        ventasComprasMensuales,
        flujoEfectivoMensual,
        topProductos,
      },
    });
  } catch (error) {
    console.error('getResumen dashboard error:', error);
    return res.status(500).json({
      mensaje: 'Error al obtener resumen del dashboard',
      error: error.message,
    });
  }
};
