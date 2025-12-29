// src/controllers/venta.controller.js
const { Venta, DetalleVenta, Producto, MovimientoInventario, Cliente, CuentaPorCobrar, Pago, PagoDetalle } = require('../database/init-models');
const { Op } = require('sequelize');

exports.crearVenta = async (req, res) => {
  const t = await Venta.sequelize.transaction();
  try {
    const { cliente_id, empresa_id, fecha, observacion, detalles, tipo_venta, num_factura, metodo_pago_id } = req.body;

    // Validación básica
    if (!detalles || !Array.isArray(detalles) || detalles.length === 0) {
      return res.status(400).json({ mensaje: 'Debe incluir al menos un detalle en la venta.' });
    }

    if (!tipo_venta || !['CONTADO', 'CREDITO'].includes(tipo_venta)) {
      return res.status(400).json({ mensaje: 'tipo_venta debe ser CONTADO o CREDITO.' });
    }

    if (!cliente_id) {
      return res.status(400).json({ mensaje: 'Debe seleccionar un cliente.' });
    }

    if (tipo_venta === 'CONTADO' && !metodo_pago_id) {
      return res.status(400).json({ mensaje: 'Debe seleccionar un método de pago para ventas de contado.' });
    }

    const cliente = await Cliente.findOne({
      where: { id: cliente_id, empresa_id },
      transaction: t,
    });

    if (!cliente) {
      return res.status(404).json({ mensaje: 'Cliente no encontrado para esta empresa.' });
    }

    // Calcular total
    const total = detalles.reduce((acc, d) => acc + parseFloat(d.subtotal), 0);

    if (total <= 0) {
      return res.status(400).json({ mensaje: 'El total de la venta debe ser mayor a cero.' });
    }

    const fechaVenta = fecha || new Date();

    // Crear venta
    const venta = await Venta.create(
      { cliente_id, 
        empresa_id, 
        fecha: fechaVenta,
        observacion: observacion || null, 
        total,
        tipo_venta,
        numero_factura: num_factura || null,
       },
      { transaction: t }
    );

    // Crear detalles
    for (const d of detalles) {
      await DetalleVenta.create({
        venta_id: venta.id,
        tipo_item: d.tipo_item,
        producto_id: d.tipo_item === 'BIEN' ? d.producto_id : null,
        descripcion: d.tipo_item === 'SERVICIO' ? d.descripcion : null,
        cantidad: d.cantidad,
        precio_unitario: d.precio_unitario,
        subtotal: d.subtotal
      }, { transaction: t });

      // Registrar salida de inventario si es un bien
      if (d.tipo_item === 'BIEN') {
        const producto = await Producto.findByPk(d.producto_id, { transaction: t });
        if (!producto) throw new Error(`Producto ID ${d.producto_id} no encontrado`);
        if (producto.stock_actual < d.cantidad) throw new Error(`Stock insuficiente para el producto ${producto.nombre}`);

        producto.stock_actual -= d.cantidad;
        if (d.precio_unitario > producto.precio_venta) {
          producto.precio_venta = d.precio_unitario;
        }

        await producto.save({ transaction: t });

        await MovimientoInventario.create({
          tipo: 'SALIDA',
          cantidad: d.cantidad,
          referencia: `Venta #${venta.id}`,
          producto_id: d.producto_id,
          motivo: 'Venta de producto'
        }, { transaction: t });
      }
    }

    // Si es CRÉDITO → crear CuentaPorCobrar
    if (tipo_venta === 'CREDITO') {
      const plazo_dias = cliente.limite_credito || 30; // campo que definimos en Cliente
      const fecha_emision = fechaVenta instanceof Date ? fechaVenta : new Date(fechaVenta);
      const fecha_vencimiento = new Date(fecha_emision);
      fecha_vencimiento.setDate(fecha_vencimiento.getDate() + plazo_dias);

      await CuentaPorCobrar.create(
        {
          empresa_id,
          cliente_id,
          venta_id: venta.id,
          monto_total: total,
          saldo_pendiente: total,
          fecha_emision,
          fecha_vencimiento,
          estado: 'PENDIENTE',
        },
        { transaction: t }
      );
    }

    // Si es CONTADO → crear Pago y PagoDetalle
    if (tipo_venta === 'CONTADO') {
      const pago = await Pago.create(
        {
          empresa_id,
          origen: 'CC',
          cliente_id,
          proveedor_id: null,
          metodo_pago_id,
          fecha_pago: fechaVenta,
          monto_total: total,
          referencia: `Pago contado de venta #${venta.id}`,
          observacion: observacion || `Pago contado de venta #${venta.id}`,
        },
        { transaction: t }
      );

      await PagoDetalle.create(
        {
          pago_id: pago.id,
          cxc_id: null,
          cxp_id: null,
          monto_aplicado: total,
          observacion: `No aplica a detalle porque se pago al contado revisar solo el pago ${pago.id}`
        },
        { transaction: t }
      );
    }

    await t.commit();
    res.status(201).json({ mensaje: 'Venta registrada correctamente.', venta_id: venta.id });

  } catch (error) {
    await t.rollback();
    console.error(error);
    res.status(500).json({ mensaje: 'Error al registrar la venta.', error: error.message });
  }
};

exports.obtenerVentas = async (req, res) => {
  try {
    const empresa_id = req.user.empresa_id;

    const {
      cliente_id,
      tipo_venta,     // CONTADO | CREDITO
      estado,         // true | false (o "ACTIVA"/"ANULADA" si manejas string)
      fecha_desde,
      fecha_hasta
    } = req.query;

    const where = { empresa_id };

    if (cliente_id) where.cliente_id = cliente_id;
    if (tipo_venta) where.tipo_venta = tipo_venta;

    // ✅ si tu estado es boolean en BD:
    if (estado !== undefined && estado !== null && estado !== '') {
      // viene como string por query: "true" / "false"
      where.estado = String(estado) === 'true';
    }

    // ✅ filtro por fecha (incluye día completo)
    if (fecha_desde || fecha_hasta) {
      where.fecha = {};

      if (fecha_desde) where.fecha[Op.gte] = new Date(`${fecha_desde}T00:00:00`);
      if (fecha_hasta) where.fecha[Op.lte] = new Date(`${fecha_hasta}T23:59:59`);
    }

    const ventas = await Venta.findAll({
      where,
      include: [
        { model: Cliente, as: 'cliente', attributes: ['id', 'nombre', 'nit'] },
        {
          model: DetalleVenta,
          as: 'detalles',
          include: [{ model: Producto, as: 'producto', attributes: ['nombre'] }],
        },
      ],
      order: [['fecha', 'DESC'], ['id', 'DESC']],
    });

    return res.json({ data: ventas });
  } catch (error) {
    console.error('Error al obtener las ventas:', error);
    return res.status(500).json({ mensaje: 'Error al obtener las ventas', error: error.message });
  }
};

exports.obtenerVentaPorId = async (req, res) => {
  try {
    const venta = await Venta.findByPk(req.params.id, {
      include: [
        { model: Cliente, as: 'cliente', attributes: ['nombre'] },
        { model: DetalleVenta, as: 'detalles', include: [{ model: Producto, as: 'producto', attributes: ['nombre'] }] }
      ]
    });

    if (!venta) return res.status(404).json({ mensaje: 'Venta no encontrada' });
    res.json(venta);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener la venta', error: error.message });
  }
};

exports.anularVenta = async (req, res) => {
  const t = await Venta.sequelize.transaction();
  try {
    const venta = await Venta.findByPk(req.params.id, {
      include: [{ model: DetalleVenta, as: 'detalles' }]
    });

    if (!venta) return res.status(404).json({ mensaje: 'Venta no encontrada' });
    if (venta.estado === false){
        return res.status(400).json({ mensaje: 'La venta ya está anulada' });
    } 

    if (venta.tipo_venta === 'CREDITO') {
      const cxc = await CuentaPorCobrar.findOne({
        where: { venta_id: venta.id },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (cxc) {
        // si ya tiene pagos parciales, por ahora no permitimos anular
        if (cxc.saldo_pendiente < cxc.monto_total) {
          return res.status(400).json({
            mensaje: 'No se puede anular: la venta tiene pagos aplicados en CxC.',
          });
        }
        else{
        // marcar la CxC como cancelada / anulada
        cxc.estado = 'ANULADA'; // o 'ANULADA', como prefieras
        cxc.saldo_pendiente = 0;
        await cxc.save({ transaction: t });
        }        
      }
    }
    
    // Revertir stock solo para los BIENES
    for (const detalle of venta.detalles) {
      if (detalle.tipo_item === 'BIEN' && detalle.producto_id) {
        const producto = await Producto.findByPk(detalle.producto_id);
        producto.stock_actual += detalle.cantidad;
        await producto.save({ transaction: t });

        await MovimientoInventario.create({
          tipo: 'ENTRADA',
          cantidad: detalle.cantidad,
          motivo: `Anulación de venta #${venta.id}`,
          producto_id: detalle.producto_id,
          referencia: `ANULACIÓN-VENTA-${venta.id}`
        }, { transaction: t });
      }
    }

    venta.estado = false;
    await venta.save({ transaction: t });

    await t.commit();
    res.json({ mensaje: 'Venta anulada correctamente.' });

  } catch (error) {
    await t.rollback();
    res.status(500).json({ mensaje: 'Error al anular la venta', error: error.message });
  }
};
