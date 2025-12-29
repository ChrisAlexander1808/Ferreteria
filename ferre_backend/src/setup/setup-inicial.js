// src/setup/setup-inicial.js
const { sequelize } = require('../database/init-models');
const { runSetup } = require('../services/setup.service');

// Detecta entorno (usa NODE_ENV, default a "development")
const isProd = process.env.NODE_ENV === 'production';

async function setupInicial() {
  try {
    await sequelize.sync({ alter: !isProd }); // en PROD lo podés cambiar a { force: false }
    console.log('📦 Modelos sincronizados con la BD');

    await runSetup({ withDummyData: isDev });
  } catch (error) {
    console.error('❌ Error en setup inicial:', error);
  } finally {
    await sequelize.close();
    process.exit();
  }
}

setupInicial();
