// src/setup/setup-global.js
const { sequelize } = require('../database/init-models');
const { runSetup } = require('../services/setup.service');

async function setupGlobal() {
  try {
    await sequelize.sync({ alter: true });

    // Ejecuta setup base
    await runSetup({ withDummyData: false });

    // Luego podrías iterar y crear EmpresaA, EmpresaB con usuarios distintos
    console.log('🌎 Setup global ejecutado (multiempresas)');
  } catch (error) {
    console.error('❌ Error en setup global:', error);
  } finally {
    await sequelize.close();
    process.exit();
  }
}

setupGlobal();
