import dotenv from 'dotenv';
import { Wallet } from 'ethers';

dotenv.config();

export interface BotConfig {
  privateKey: string;
  polymarketProxyAddress: string;
  targetWalletAddress: string;
  chainId: number;
  polymarketHost: string;
  signatureType: number;
  sizeMultiplier: number;
  minTradeAmount: number;
  maxTradeAmount: number;
  maxBalanceUsage: number;
  logLevel: string;
}

export function validateConfig(): BotConfig {
  const requiredVars = [
    'PRIVATE_KEY',
    'POLYMARKET_PROXY_ADDRESS', 
    'TARGET_WALLET_ADDRESS'
  ];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      throw new Error(`Variable de entorno requerida no encontrada: ${varName}`);
    }
  }

  // Validar que la private key sea válida
  try {
    new Wallet(process.env.PRIVATE_KEY!);
  } catch (error) {
    throw new Error('PRIVATE_KEY inválida');
  }

  // Validar direcciones Ethereum
  if (!isValidAddress(process.env.POLYMARKET_PROXY_ADDRESS!)) {
    throw new Error('POLYMARKET_PROXY_ADDRESS inválida');
  }

  if (!isValidAddress(process.env.TARGET_WALLET_ADDRESS!)) {
    throw new Error('TARGET_WALLET_ADDRESS inválida');
  }

  return {
    privateKey: process.env.PRIVATE_KEY!,
    polymarketProxyAddress: process.env.POLYMARKET_PROXY_ADDRESS!,
    targetWalletAddress: process.env.TARGET_WALLET_ADDRESS!,
    chainId: parseInt(process.env.CHAIN_ID || '137'),
    polymarketHost: process.env.POLYMARKET_HOST || 'https://clob.polymarket.com',
    signatureType: parseInt(process.env.SIGNATURE_TYPE || '0'),
    sizeMultiplier: parseFloat(process.env.SIZE_MULTIPLIER || '0.01'),
    minTradeAmount: parseFloat(process.env.MIN_TRADE_AMOUNT || '0.0'),
    maxTradeAmount: parseFloat(process.env.MAX_TRADE_AMOUNT || '5.0'),
    maxBalanceUsage: parseFloat(process.env.MAX_BALANCE_USAGE || '0.8'),
    logLevel: process.env.LOG_LEVEL || 'info'
  };
}

function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}
