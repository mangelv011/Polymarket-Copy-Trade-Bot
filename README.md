# Polymarket Copy Trading Bot

Real-time Polymarket copy trading bot that automatically mirrors trades from multiple target wallets using market orders with configurable limits and duplicate detection.

## Installation

```bash
npm install
cp .env.example .env
# Edit .env with your configuration
npm run build
npm start
```

## Configuration (.env)

```properties
# Your private key (from Magic Link or MetaMask)
PRIVATE_KEY=0x...

# Your Polymarket deposit address
POLYMARKET_PROXY_ADDRESS=0x...

# Target wallet addresses to copy (multiple supported)
TARGET_WALLET_ADDRESSES=0x...,0x...,0x...

# Bot configuration
SIZE_MULTIPLIER=0.02         # 2% of balance per trade
MAX_TRADE_AMOUNT=5.0         # Maximum $5 per trade
MIN_TRADE_AMOUNT=1.0         # Minimum $1 per trade
SIGNATURE_TYPE=1             # 1 for Magic Link, 0 for MetaMask
```

## Getting Required Keys

**Private Key (Magic Link):**
1. Go to [reveal.magic.link/polymarket](https://reveal.magic.link/polymarket)
2. Connect your Polymarket email
3. Copy the private key

**Proxy Address:**
1. Go to polymarket.com → Deposit
2. Copy the address where you deposit USDC

**Target Wallets:**
- Addresses of the traders you want to copy
- Separate multiple addresses with commas
- Example: `0x123...,0x456...,0x789...`

## Usage

```bash
npm start
```

The bot will automatically detect and copy trades from all configured wallets while respecting your configured limits.

## Features

- **Multi-wallet monitoring**: Copy trades from multiple target wallets simultaneously
- Real-time trade monitoring via WebSocket
- Market order execution for immediate fills
- Configurable position sizing and risk limits
- Duplicate trade detection and filtering
- Automatic balance management
- Support for Magic Link and MetaMask wallets

## Scripts

```bash
npm start      # Run bot
npm run build  # Compile TypeScript
npm run dev    # Development mode with auto-reload
```

## Important Notes

- Start with small amounts to test ($20-50)
- Uses market orders for immediate execution
- Monitors multiple wallets simultaneously
- Respects all configured limits
- Only invests what you can afford to lose
- Use a separate wallet for bot trading

## Troubleshooting

**"not enough balance/allowance"**: Need more USDC in your Polymarket account
**"Size lower than minimum"**: Market requires larger minimum size
**No trades detected**: Verify TARGET_WALLET_ADDRESSES are correct

## Contributors

- Miguel Angel Vallejo ([GitHub](https://github.com/mangelv011))

## License

MIT License

## Disclaimer

This software is provided without warranties. Use at your own risk. Developers are not responsible for financial losses.
