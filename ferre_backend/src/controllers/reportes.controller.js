const { Venta, Compra, Producto, Cliente, Proveedor } = require('../database/init-models');

exports.obtenerResumenGeneral = async (req, res) => {
  try {
    const { empresa_id } = req.query;
    if (!empresa_id) return res.status(400).json({ message: 'empresa_id requerido' });

    const [totalVentas, totalCompras, totalProductos, totalClientes, totalProveedores] = await Promise.all([
      Venta.count({ where: { empresa_id } }),
      Compra.count({ where: { empresa_id } }),
      Producto.count({ where: { empresa_id } }),
      Cliente.count({ where: { empresa_id } }),
      Proveedor.count({ where: { empresa_id } }),
    ]);

    res.json({
      totalVentas,
      totalCompras,
      totalProductos,
      totalClientes,
      totalProveedores
    });
  } catch (error) {
    console.error('Error en resumen general:', error);
    res.status(500).json({ message: 'Error al obtener resumen general', error: error.message });
  }
};

// Reporte de ventas vs compras por mes
exports.obtenerVentasComprasMensuales = async (req, res) => {
  try {
    const { empresa_id } = req.query;
    if (!empresa_id) return res.status(400).json({ message: 'empresa_id requerido' });

    const ventas = await Venta.findAll({
      where: { empresa_id },
      attributes: [
        [Venta.sequelize.fn('DATE_TRUNC', 'month', Venta.sequelize.col('fecha')), 'mes'],
        [Venta.sequelize.fn('SUM', Venta.sequelize.col('total')), 'total_ventas']
      ],
      group: ['mes'],
      order: [['mes', 'ASC']]
    });

    const compras = await Compra.findAll({
      where: { empresa_id },
      attributes: [
        [Compra.sequelize.fn('DATE_TRUNC', 'month', Compra.sequelize.col('fecha')), 'mes'],
        [Compra.sequelize.fn('SUM', Compra.sequelize.col('total')), 'total_compras']
      ],
      group: ['mes'],
      order: [['mes', 'ASC']]
    });

    res.json({ ventas, compras });
  } catch (error) {
    console.error('Error en reporte mensual:', error);
    res.status(500).json({ message: 'Error al obtener datos mensuales', error: error.message });
  }
};
