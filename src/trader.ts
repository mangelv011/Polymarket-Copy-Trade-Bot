import { ClobClient, OrderType, Side, AssetType, TickSize } from '@polymarket/clob-client';
import { Wallet } from 'ethers';
import { BotConfig } from './config';
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

export interface TradeInfo {
  asset_id: string;
  market: string;
  side: string;
  price: string;
  size: string;
  outcome: string;
  proxyWallet?: string;
  transaction_hash?: string;
}

export class PolymarketTrader {
  private client: ClobClient;
  private config: BotConfig;
  private logger: Logger;

  constructor(config: BotConfig, logger: Logger) {
    this.config = config;
    this.logger = logger;
    
    const signer = new Wallet(config.privateKey);
    this.client = new ClobClient(
      config.polymarketHost,
      config.chainId,
      signer,
      undefined,
      config.signatureType,
      config.polymarketProxyAddress
    );
  }

  async initialize(): Promise<void> {
    try {
      // Crear o derivar API key automáticamente
      this.logger.info('🔑 Generando credenciales API...');
      const creds = await this.client.createOrDeriveApiKey();
      this.logger.info('✅ Credenciales API generadas');
      
      // Actualizar cliente con las credenciales
      const signer = new Wallet(this.config.privateKey);
      this.client = new ClobClient(
        this.config.polymarketHost,
        this.config.chainId,
        signer,
        creds,
        this.config.signatureType,
        this.config.polymarketProxyAddress
      );
      
      const balanceResponse = await this.client.getBalanceAllowance({
        asset_type: AssetType.COLLATERAL
      });
      this.logger.info(`✅ Trader inicializado. Balance disponible: $${(parseFloat(balanceResponse.balance) / 1000000).toFixed(2)} USDC`);
    } catch (error) {
      this.logger.error('❌ Error inicializando trader:', error);
      throw error;
    }
  }

  async getAccountBalance(): Promise<number> {
    try {
      const balanceResponse = await this.client.getBalanceAllowance({
        asset_type: AssetType.COLLATERAL
      });
      // Convertir de wei a USDC (dividir por 1,000,000)
      return parseFloat(balanceResponse.balance) / 1000000;
    } catch (error) {
      this.logger.error('❌ Error obteniendo balance:', error);
      return 0;
    }
  }

  async getTokenBalance(tokenId: string): Promise<number> {
    try {
      const balanceResponse = await this.client.getBalanceAllowance({
        asset_type: AssetType.CONDITIONAL,
        token_id: tokenId
      });
      return parseFloat(balanceResponse.balance) / 1000000; // Convertir de wei
    } catch (error) {
      this.logger.warn(`⚠️ Error obteniendo posición para token ${tokenId}:`, error);
      return 0;
    }
  }

  async copyTrade(trade: TradeInfo): Promise<void> {
    try {
      // Reproducir sonido de notificación
      playNotificationSound();
      
      // Información clara sobre la operación de copia
      const sourceWallet = trade.proxyWallet || 'Desconocida';
      const shortSource = `${sourceWallet.slice(0, 6)}...${sourceWallet.slice(-4)}`;
      const shortTarget = `${this.config.polymarketProxyAddress.slice(0, 6)}...${this.config.polymarketProxyAddress.slice(-4)}`;
      
      this.logger.info('='.repeat(60));
      this.logger.info('🔄 COPIANDO TRADE');
      this.logger.info(`📤 DESDE: ${shortSource} (${sourceWallet})`);
      this.logger.info(`📥 HACIA: ${shortTarget} (${this.config.polymarketProxyAddress})`);
      this.logger.info(`📊 Trade original: ${trade.side.toUpperCase()} $${parseFloat(trade.size).toFixed(2)} en ${trade.market}`);
      this.logger.info('='.repeat(60));

      // Determinar tipo de orden
      const side = trade.side.toLowerCase() === 'buy' ? Side.BUY : Side.SELL;
      
      // Para órdenes SELL, verificar si tenemos la posición
      if (side === Side.SELL) {
        this.logger.info('📋 Verificando posición para SELL...');
        const currentPosition = await this.getTokenBalance(trade.asset_id);
        
        if (currentPosition <= 0) {
          this.logger.warn('⚠️ SELL OMITIDO: No tienes posición en este token');
          this.logger.info(`🚫 Token: ${trade.asset_id}`);
          this.logger.info(`📊 Posición actual: ${currentPosition} shares`);
          this.logger.info('✅ Bot continúa monitoreando...');
          return; // Continuar sin ejecutar el trade
        }
        
        this.logger.info(`✅ Posición encontrada: ${currentPosition.toFixed(4)} shares`);
      }

      // Obtener balance actual
      const currentBalance = await this.getAccountBalance();
      this.logger.info(`💰 Balance actual: $${currentBalance.toFixed(2)} USDC`);

      if (currentBalance <= 0) {
        this.logger.warn('⚠️ Balance insuficiente para realizar trades');
        return;
      }

      // Calcular tamaño basado en el monto original del trade (no en balance)
      const originalSize = parseFloat(trade.size);
      let adjustedAmount = originalSize * this.config.sizeMultiplier;
      
      this.logger.info(`🧮 Cálculo basado en trade original:`);
      this.logger.info(`   • Monto original: $${originalSize.toFixed(2)}`);
      this.logger.info(`   • Multiplicador: ${this.config.sizeMultiplier}x`);
      this.logger.info(`   • Mi monto: $${originalSize.toFixed(2)} × ${this.config.sizeMultiplier} = $${adjustedAmount.toFixed(2)}`);
      this.logger.info(`   • Balance disponible: $${currentBalance.toFixed(2)}`);

      // Verificar que tengamos suficiente balance para el trade calculado
      if (adjustedAmount > currentBalance) {
        this.logger.warn(`⚠️ Monto calculado ($${adjustedAmount.toFixed(2)}) > Balance ($${currentBalance.toFixed(2)})`);
        this.logger.info(`🔧 Ajustando al máximo disponible: $${currentBalance.toFixed(2)}`);
        adjustedAmount = currentBalance;
      }

      // NUEVA LÓGICA: Control diferenciado para BUY vs SELL
      if (side === Side.BUY) {
        // COMPRAS: Aplicar límites estrictos
        this.logger.info(`📈 ORDEN DE COMPRA - Aplicando límites estrictos`);
        
        // Límite máximo estricto
        if (adjustedAmount > this.config.maxTradeAmount) {
          const originalAdjusted = adjustedAmount;
          adjustedAmount = this.config.maxTradeAmount;
          this.logger.info(`🛡️ Limitando compra: $${originalAdjusted.toFixed(2)} → $${adjustedAmount.toFixed(2)} (máximo)`);
        }
        
        // Límite mínimo estricto - si es menor, usar mínimo directamente
        if (adjustedAmount < this.config.minTradeAmount) {
          const originalAdjusted = adjustedAmount;
          adjustedAmount = this.config.minTradeAmount;
          this.logger.info(`⬆️ Ajustando compra al mínimo: $${originalAdjusted.toFixed(2)} → $${adjustedAmount.toFixed(2)}`);
        }
        
      } else {
        // VENTAS: Límites más flexibles
        this.logger.info(`📉 ORDEN DE VENTA - Aplicando límites flexibles`);
        
        // Límite máximo estricto
        if (adjustedAmount > this.config.maxTradeAmount) {
          const originalAdjusted = adjustedAmount;
          adjustedAmount = this.config.maxTradeAmount;
          this.logger.info(`🛡️ Limitando venta: $${originalAdjusted.toFixed(2)} → $${adjustedAmount.toFixed(2)} (máximo)`);
        }
        
        // Para ventas: intentar con cantidad original si es menor al mínimo
        // (se manejará el error más adelante si falla)
        if (adjustedAmount < this.config.minTradeAmount) {
          this.logger.info(`⚠️ Venta menor al mínimo: $${adjustedAmount.toFixed(2)} < $${this.config.minTradeAmount} - Intentando con cantidad original`);
        }
      }

      // Verificar que no supere el balance (aplica a ambos)
      if (adjustedAmount > currentBalance) {
        this.logger.warn(`⚠️ Trade demasiado grande: $${adjustedAmount.toFixed(2)} > $${currentBalance.toFixed(2)} (balance). Omitiendo.`);
        return;
      }

      this.logger.info(`✅ Trade final: ${trade.side.toUpperCase()} $${adjustedAmount.toFixed(2)} en ${trade.market}`);
      this.logger.info(`🛡️ LÍMITES: Trade = $${adjustedAmount.toFixed(2)} | Máximo = $${this.config.maxTradeAmount} | Mínimo = $${this.config.minTradeAmount}`);

      // Intentar ejecutar trade con lógica de fallback
      await this.executeTradeWithFallback(trade, side, adjustedAmount, currentBalance);
      
    } catch (error: any) {
      // El bot NUNCA debe parar por un error de trade
      this.logger.error('❌ ERROR EJECUTANDO TRADE - Bot continúa:', error);
      this.logger.info('🔄 Bot permanece activo y continuará monitoreando...');
      
      // Si es un error crítico, registrarlo pero continuar
      if (error.message) {
        this.logger.error(`📋 Detalle del error: ${error.message}`);
      }
    }
  }

  // Nuevo método para ejecutar trades con lógica de fallback
  private async executeTradeWithFallback(
    trade: TradeInfo, 
    side: Side, 
    adjustedAmount: number, 
    currentBalance: number
  ): Promise<void> {
    const originalAmount = adjustedAmount;
    const shortTarget = `${this.config.polymarketProxyAddress.slice(0, 6)}...${this.config.polymarketProxyAddress.slice(-4)}`;
    
    this.logger.info(`📝 Preparando MARKET ORDER para ${shortTarget}...`);
    this.logger.info(`   - Activo: ${trade.asset_id}`);
    this.logger.info(`   - Lado: ${side}`);
    this.logger.info(`   - Cantidad: $${adjustedAmount.toFixed(2)}`);
    this.logger.info(`   - Cuenta destino: ${this.config.polymarketProxyAddress}`);

    // Intentar con cantidad original primero
    let success = await this.tryExecuteOrder(trade, side, adjustedAmount, currentBalance);
    
    // Si falla por liquidez y es una cantidad grande, intentar con cantidades menores
    if (!success && adjustedAmount > this.config.minTradeAmount * 2) {
      // Intentar con 50% del monto
      const halfAmount = adjustedAmount / 2;
      this.logger.warn(`⚠️ Orden original falló, intentando con $${halfAmount.toFixed(2)} (50% del monto)`);
      
      if (halfAmount >= this.config.minTradeAmount) {
        success = await this.tryExecuteOrder(trade, side, halfAmount, currentBalance);
        
        // Si falla el 50%, intentar con 25%
        if (!success) {
          const quarterAmount = adjustedAmount / 4;
          if (quarterAmount >= this.config.minTradeAmount) {
            this.logger.warn(`⚠️ 50% falló, intentando con $${quarterAmount.toFixed(2)} (25% del monto original)`);
            success = await this.tryExecuteOrder(trade, side, quarterAmount, currentBalance);
          }
        }
        
        // Si aún falla, intentar con el mínimo
        if (!success && this.config.minTradeAmount <= currentBalance) {
          this.logger.warn(`⚠️ Intentando con mínimo absoluto: $${this.config.minTradeAmount}`);
          success = await this.tryExecuteOrder(trade, side, this.config.minTradeAmount, currentBalance);
        }
      }
    }
    
    // Si falla y la cantidad es menor al mínimo, intentar con el mínimo
    else if (!success && adjustedAmount < this.config.minTradeAmount) {
      this.logger.warn(`⚠️ Orden falló con $${adjustedAmount.toFixed(2)}, intentando con mínimo $${this.config.minTradeAmount}`);
      
      // Verificar que el mínimo no exceda el balance
      if (this.config.minTradeAmount <= currentBalance && this.config.minTradeAmount <= this.config.maxTradeAmount) {
        success = await this.tryExecuteOrder(trade, side, this.config.minTradeAmount, currentBalance);
      } else {
        this.logger.error(`❌ No se puede usar mínimo: $${this.config.minTradeAmount} > balance($${currentBalance}) o > máximo($${this.config.maxTradeAmount})`);
      }
    }
    
    if (!success) {
      this.logger.error('❌ TRADE NO EJECUTADO - Todas las opciones intentadas fallaron');
      this.logger.info('📊 RESUMEN:');
      this.logger.info(`   • Monto original calculado: $${originalAmount.toFixed(2)}`);
      this.logger.info(`   • Balance disponible: $${currentBalance.toFixed(2)}`);
      this.logger.info(`   • Motivo más probable: Falta de liquidez en el mercado`);
      this.logger.info('� RECOMENDACIONES:');
      this.logger.info('   • Reduce MAX_TRADE_AMOUNT para mercados pequeños');
      this.logger.info('   • Reduce SIZE_MULTIPLIER para trades más pequeños');
      this.logger.info('   • Este trade se omitió - Bot continúa con el siguiente');
      this.logger.info('�🔄 Bot continúa activo y monitoreando nuevos trades...');
    }
  }

  // Método auxiliar para intentar ejecutar una orden
  private async tryExecuteOrder(
    trade: TradeInfo, 
    side: Side, 
    amount: number, 
    currentBalance: number
  ): Promise<boolean> {
    try {
      // Crear market order según documentación oficial (SIN orderType en el objeto)
      const marketOrderArgs = {
        tokenID: trade.asset_id,
        amount: amount, // USDC para BUY, SHARES para SELL
        side: side
        // NO incluir orderType aquí - se pasa como parámetro separado
      };

      this.logger.info(`🚀 Enviando MARKET ORDER: $${amount.toFixed(2)} (${side})...`);
      
      const result = await this.client.createAndPostMarketOrder(
        marketOrderArgs,
        { tickSize: "0.01" }, // tickSize correcto: 0.01 (no 0.001)
        OrderType.FAK // Fill and Kill - permite ejecución parcial
      );

      if (result && result.success) {
        const shortTarget = `${this.config.polymarketProxyAddress.slice(0, 6)}...${this.config.polymarketProxyAddress.slice(-4)}`;
        
        this.logger.info('✅ ¡TRADE EJECUTADO EXITOSAMENTE!');
        this.logger.info(`📄 ID de orden: ${result.orderId || 'N/A'}`);
        this.logger.info(`🎯 Ejecutado en cuenta: ${shortTarget}`);
        this.logger.info(`📍 Dirección completa: ${this.config.polymarketProxyAddress}`);
        
        // Mostrar balance actualizado
        const newBalance = await this.getAccountBalance();
        const difference = currentBalance - newBalance;
        this.logger.info(`💰 Balance actualizado: $${newBalance.toFixed(2)} USDC (diferencia: -$${difference.toFixed(2)})`);
        return true;
      } else {
        this.logger.error('❌ Error ejecutando trade:', result);
        return false;
      }

    } catch (error: any) {
      // Manejo específico de errores comunes
      if (error.message && error.message.includes('insufficient')) {
        this.logger.error('❌ Fondos insuficientes para el trade');
      } else if (error.response?.data?.error?.includes('fully filled')) {
        this.logger.warn('⚠️ LIQUIDEZ INSUFICIENTE: No se pudo completar la orden FOK');
        this.logger.info(`💡 El mercado no tiene suficiente liquidez para $${amount.toFixed(2)}`);
        this.logger.info('� Esto es normal en mercados pequeños o con poca actividad');
        this.logger.info('🔄 Bot continúa monitoreando otros trades...');
      } else if (error.response?.data?.error?.includes('FOK')) {
        this.logger.warn('⚠️ ORDEN FOK RECHAZADA: Liquidez insuficiente en el libro');
        this.logger.info('� FOK = Fill or Kill (se completa totalmente o se cancela)');
        this.logger.info('🎯 Considerar usar cantidades menores para mercados pequeños');
      } else if (error.response?.data?.error) {
        this.logger.error('❌ Error de API:', error.response.data.error);
      } else {
        this.logger.error('❌ Error ejecutando trade:', error.response?.data?.error || error.message);
      }
      return false;
    }
  }

  async getMarketInfo(marketId: string) {
    try {
      const response = await fetch(`${this.config.polymarketHost}/markets?id=${marketId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      this.logger.error(`❌ Error obteniendo info del mercado ${marketId}:`, error);
      return null;
    }
  }
}
