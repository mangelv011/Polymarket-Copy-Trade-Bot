import { validateConfig } from './config';
import { createLogger } from './logger';
import { PolymarketTrader } from './trader';
import { TradeMonitor } from './monitor';

async function main(): Promise<void> {
  console.log('🚀 Iniciando Polymarket Copy Trade Bot...');

  try {
    // Validar configuración
    const config = validateConfig();
    
    // Crear logger
    const logger = createLogger(config.logLevel);
    
    logger.info('='.repeat(50));
    logger.info('🤖 POLYMARKET COPY TRADE BOT');
    logger.info('='.repeat(50));
    logger.info(`📍 Wallets objetivo (${config.targetWalletAddresses.length}):`);
    config.targetWalletAddresses.forEach((address, index) => {
      logger.info(`   ${index + 1}. ${address}`);
    });
    logger.info(`🔄 Multiplicador: ${config.sizeMultiplier}x`);
    logger.info(`💵 Límites: $${config.minTradeAmount} - $${config.maxTradeAmount}`);
    logger.info(`⚡ Copia trades en TIEMPO REAL (sin restricciones)`);
    logger.info('='.repeat(50));
    
    // Inicializar trader
    const trader = new PolymarketTrader(config, logger);
    await trader.initialize();
    
    // Inicializar monitor
    const monitor = new TradeMonitor(config, trader, logger);
    await monitor.startMonitoring();
    
    logger.info('✅ Bot iniciado correctamente - Esperando trades...');
    
    // Manejar cierre del programa
    process.on('SIGINT', () => {
      logger.info('🛑 Deteniendo bot...');
      monitor.stop();
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      logger.info('🛑 Deteniendo bot...');
      monitor.stop();
      process.exit(0);
    });

    // Mantener el proceso ejecutándose
    setInterval(() => {
      // Bot funcionando...
    }, 10000);
    
  } catch (error) {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  }
}

// Manejar errores no capturados
process.on('unhandledRejection', (reason: any) => {
  console.error('❌ Error no manejado:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error: any) => {
  console.error('❌ Excepción no capturada:', error);
  process.exit(1);
});

// Ejecutar bot
main().catch((error) => {
  console.error('❌ Error ejecutando bot:', error);
  process.exit(1);
});
