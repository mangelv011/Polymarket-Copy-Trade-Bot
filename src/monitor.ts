import { RealTimeDataClient, Message } from '@polymarket/real-time-data-client';
import { BotConfig } from './config';
import { PolymarketTrader, TradeInfo } from './trader';
import { Logger } from 'winston';

// Función para reproducir sonido de notificación
function playNotificationSound(): void {
  try {
    // En Windows, usar el comando de sistema para reproducir sonido
    if (process.platform === 'win32') {
      const { exec } = require('child_process');
      exec('powershell -c "(New-Object Media.SoundPlayer \\"C:\\Windows\\Media\\Windows Ding.wav\\").PlaySync();"', 
        { timeout: 1000 }, () => {});
    } else {
      // En otros sistemas, imprimir caracteres de campanilla
      process.stdout.write('\x07\x07\x07'); // ASCII bell character
    }
  } catch (error) {
    // Si falla el sonido, continuar silenciosamente
  }
}

export class TradeMonitor {
  private rtClient: RealTimeDataClient;
  private trader: PolymarketTrader;
  private config: BotConfig;
  private logger: Logger;
  private isConnected: boolean = false;
  private processedTrades: Map<string, number> = new Map(); // Cache con timestamp
  private cacheCleanupInterval: NodeJS.Timeout;

  constructor(config: BotConfig, trader: PolymarketTrader, logger: Logger) {
    this.config = config;
    this.trader = trader;
    this.logger = logger;

    this.rtClient = new RealTimeDataClient({
      onMessage: (client: RealTimeDataClient, message: Message) => this.handleMessage(message),
      onConnect: (client: RealTimeDataClient) => this.handleConnect()
    });

    // Limpiar cache cada 2 minutos para evitar memory leaks y trades antiguos
    this.cacheCleanupInterval = setInterval(() => {
      const now = Date.now();
      const oldEntries = Array.from(this.processedTrades.entries()).filter(([key, timestamp]) => now - timestamp > 120000); // 2 minutos
      oldEntries.forEach(([key]) => this.processedTrades.delete(key));
      this.logger.debug(`🧹 Cache limpiado: ${oldEntries.length} entradas eliminadas`);
    }, 2 * 60 * 1000);
  }

  async startMonitoring(): Promise<void> {
    try {
      this.logger.info(`🔍 Iniciando monitoreo de ${this.config.targetWalletAddresses.length} wallets:`);
      this.config.targetWalletAddresses.forEach((address, index) => {
        this.logger.info(`   ${index + 1}. ${address}`);
      });
      this.rtClient.connect();
    } catch (error) {
      this.logger.error('❌ Error iniciando monitoreo:', error);
      throw error;
    }
  }

  private handleConnect(): void {
    this.isConnected = true;
    this.logger.info('✅ Conectado al servicio de datos en tiempo real');

    // Suscribirse a todas las operaciones relevantes según documentación oficial
    this.rtClient.subscribe({
      subscriptions: [
        {
          topic: "activity",
          type: "trades", // Trades básicos BUY/SELL
          filters: ""
        },
        {
          topic: "activity", 
          type: "orders_matched", // Órdenes emparejadas
          filters: ""
        }
      ]
    });

    this.logger.info('📡 Suscripción a trades y órdenes activada');
  }

  private handleMessage(message: Message): void {
    try {
      if (message.topic === 'activity' && 
          (message.type === 'trades' || message.type === 'orders_matched')) {
        
        const tradeData = message.payload as any;
        
        // Verificar si el trade es de alguna de las wallets objetivo
        const traderWallet = tradeData.proxyWallet?.toLowerCase();
        const isTargetWallet = this.config.targetWalletAddresses.some(
          address => address.toLowerCase() === traderWallet
        );
        
        if (isTargetWallet) {
          
          // Reproducir sonido de notificación inmediatamente
          playNotificationSound();
          
          // Crear clave única para detectar duplicados (usando timestamp + múltiples campos)
          const timestamp = Date.now();
          const tradeKey = `${tradeData.proxyWallet}-${tradeData.asset || tradeData.asset_id}-${tradeData.side}-${tradeData.price}-${tradeData.size}-${tradeData.transactionHash || timestamp}-${message.type}`;
          
          // Verificar si ya procesamos este trade (ventana de 2 minutos)
          const now = Date.now();
          if (this.processedTrades.has(tradeKey)) {
            const lastProcessed = this.processedTrades.get(tradeKey)!;
            if (now - lastProcessed < 120000) { // 2 minutos
              this.logger.info(`🔄 Trade duplicado detectado y omitido: ${message.type} (hace ${Math.round((now - lastProcessed)/1000)}s)`);
              return;
            }
          }
          
          // Marcar como procesado con timestamp actual
          this.processedTrades.set(tradeKey, now);
          
          // Mostrar título del trade en consola para mayor visibilidad
          const tradeTitle = tradeData.title || 'Sin título disponible';
          const outcome = tradeData.outcome || 'Desconocido';
          const price = tradeData.price || '0';
          const sourceWallet = tradeData.proxyWallet;
          const shortSource = `${sourceWallet.slice(0, 6)}...${sourceWallet.slice(-4)}`;
          
          console.log('='.repeat(60));
          console.log(`📊 TRADE DETECTADO PARA COPIAR`);
          console.log(`📈 Mercado: "${tradeTitle}"`);
          console.log(`💹 Operación: ${tradeData.side.toUpperCase()} ${outcome} @ $${price}`);
          console.log(`👤 Trader origen: ${shortSource} (${sourceWallet})`);
          console.log(`🤖 Preparando copia automática...`);
          console.log('='.repeat(60));
          
          this.logger.info(`🎯 ${message.type} detectado de wallet objetivo!`, {
            type: message.type,
            title: tradeTitle,
            eventSlug: tradeData.eventSlug,
            marketSlug: tradeData.slug,
            side: tradeData.side,
            outcome: outcome,
            price: price,
            size: tradeData.size,
            asset: tradeData.asset || tradeData.asset_id,
            conditionId: tradeData.conditionId || tradeData.market,
            transactionHash: tradeData.transactionHash
          });
          
          // Convertir a nuestro formato interno
          const tradeInfo: TradeInfo = {
            asset_id: tradeData.asset || tradeData.asset_id,
            market: tradeData.conditionId || tradeData.market,
            side: tradeData.side,
            price: tradeData.price.toString(),
            size: tradeData.size.toString(),
            outcome: tradeData.outcome,
            proxyWallet: tradeData.proxyWallet,
            transaction_hash: tradeData.transactionHash
          };
          
          // Copiar solo trades de BUY/SELL (operaciones de trading principales)
          if (tradeInfo.side === 'BUY' || tradeInfo.side === 'SELL') {
            // Ejecutar copia de trade de forma asíncrona sin bloquear el monitor
            this.trader.copyTrade(tradeInfo).catch(error => {
              this.logger.error('❌ Error copiando trade - Bot continúa:', error);
              this.logger.info('🔄 Monitor permanece activo...');
            });
          } else {
            this.logger.info(`ℹ️ Operación ${tradeInfo.side} detectada (no copiada)`);
          }
        }
      }
    } catch (error) {
      // El monitor NUNCA debe detenerse por un error de procesamiento
      this.logger.error('❌ ERROR PROCESANDO MENSAJE - Monitor continúa:', error);
      this.logger.info('🔄 Monitor permanece activo y continuará detectando trades...');
    }
  }

  stop(): void {
    if (this.isConnected) {
      this.rtClient.disconnect();
      this.logger.info('🛑 Monitoreo detenido');
    }
    
    // Limpiar intervalo y cache
    if (this.cacheCleanupInterval) {
      clearInterval(this.cacheCleanupInterval);
    }
    this.processedTrades.clear();
  }
}
