import { ClobClient, OrderType, Side, AssetType, TickSize } from '@polymarket/clob-client';
import { Wallet } from 'ethers';
import { BotConfig } from './config';
import { Logger } from 'winston';

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

  async copyTrade(trade: TradeInfo): Promise<void> {
    try {
      this.logger.info('🔄 Procesando trade para copiar...');
      this.logger.info(`📊 Trade original: ${trade.side.toUpperCase()} $${parseFloat(trade.size).toFixed(2)} en ${trade.market}`);

      // Obtener balance actual
      const currentBalance = await this.getAccountBalance();
      this.logger.info(`💰 Balance actual: $${currentBalance.toFixed(2)} USDC`);

      if (currentBalance <= 0) {
        this.logger.warn('⚠️ Balance insuficiente para realizar trades');
        return;
      }

      // Calcular tamaño usando el multiplicador
      const originalSize = parseFloat(trade.size);
      let adjustedAmount = currentBalance * this.config.sizeMultiplier;
      
      this.logger.info(`🧮 Cálculo inicial: $${currentBalance.toFixed(2)} × ${this.config.sizeMultiplier} = $${adjustedAmount.toFixed(2)}`);

      // VERIFICACIÓN: Market orders requieren mínimo $1
      // Si el cálculo es menor a $1, forzar a $1.00
      if (adjustedAmount < 1.0) {
        this.logger.warn(`⚠️ Cálculo inicial $${adjustedAmount.toFixed(2)} < $1.00 (mínimo)`);
        adjustedAmount = 1.0;
        this.logger.info(`� FORZANDO a $1.00 para cumplir mínimo de Polymarket`);
      }

      // Aplicar límite máximo
      if (adjustedAmount > this.config.maxTradeAmount) {
        const originalAdjusted = adjustedAmount;
        adjustedAmount = this.config.maxTradeAmount;
        this.logger.info(`🛡️ Limitando trade: $${originalAdjusted.toFixed(2)} → $${adjustedAmount.toFixed(2)} (máximo configurado)`);
      }

      // Aplicar límite mínimo del usuario
      if (adjustedAmount < this.config.minTradeAmount) {
        this.logger.warn(`⚠️ Trade muy pequeño: $${adjustedAmount.toFixed(2)} < $${this.config.minTradeAmount} (mínimo). Omitiendo.`);
        return;
      }

      // Verificar que no supere el balance
      if (adjustedAmount > currentBalance) {
        this.logger.warn(`⚠️ Trade demasiado grande: $${adjustedAmount.toFixed(2)} > $${currentBalance.toFixed(2)} (balance). Omitiendo.`);
        return;
      }

      this.logger.info(`✅ Trade final: ${trade.side.toUpperCase()} $${adjustedAmount.toFixed(2)} en ${trade.market}`);
      this.logger.info(`🛡️ LÍMITES RESPETADOS: Trade = $${adjustedAmount.toFixed(2)} ≤ $${this.config.maxTradeAmount} ✅`);

      // Crear market order según documentación oficial
      const side = trade.side.toLowerCase() === 'buy' ? Side.BUY : Side.SELL;
      
      this.logger.info(`📝 Preparando MARKET ORDER...`);
      this.logger.info(`   - Activo: ${trade.asset_id}`);
      this.logger.info(`   - Lado: ${side}`);
      this.logger.info(`   - Cantidad: $${adjustedAmount.toFixed(2)}`);

      // Crear market order según documentación oficial (SIN orderType en el objeto)
      const marketOrderArgs = {
        tokenID: trade.asset_id,
        amount: adjustedAmount, // USDC para BUY, SHARES para SELL
        side: side
        // NO incluir orderType aquí - se pasa como parámetro separado
      };

      this.logger.info('🚀 Enviando MARKET ORDER (ejecución inmediata)...');
      
      const result = await this.client.createAndPostMarketOrder(
        marketOrderArgs,
        { tickSize: "0.01" }, // tickSize correcto: 0.01 (no 0.001)
        OrderType.FOK // Fill or Kill
      );

      if (result && result.success) {
        this.logger.info('✅ ¡Trade ejecutado exitosamente!');
        this.logger.info(`📄 ID de orden: ${result.orderId || 'N/A'}`);
        
        // Mostrar balance actualizado
        const newBalance = await this.getAccountBalance();
        const difference = currentBalance - newBalance;
        this.logger.info(`💰 Balance actualizado: $${newBalance.toFixed(2)} USDC (diferencia: -$${difference.toFixed(2)})`);
      } else {
        this.logger.error('❌ Error ejecutando trade:', result);
      }

    } catch (error: any) {
      if (error.message && error.message.includes('insufficient')) {
        this.logger.error('❌ Fondos insuficientes para el trade');
      } else {
        this.logger.error('❌ Error ejecutando trade:', error);
      }
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
