# 🤖 Polymarket Copy Trade Bot

Bot que copia trades de Polymarket en tiempo real con gestión de riesgo.

## 🚀 Instalación

```bash
# Instalar dependencias
npm install

# Copiar configuración
cp .env.example .env

# Editar .env con tus valores
# Compilar
npm run build

# Ejecutar
npm start
```

## ⚙️ Configuración (.env)

```properties
# Tu clave privada (de Magic Link o MetaMask)
PRIVATE_KEY=0x...

# Tu dirección de Polymarket (donde depositas USDC)
POLYMARKET_PROXY_ADDRESS=0x...

# Wallet que quieres copiar
TARGET_WALLET_ADDRESS=0x...

# Configuración del bot
SIZE_MULTIPLIER=0.005        # 0.5% de tu balance por trade
MAX_TRADE_AMOUNT=5.0         # Máximo $5 por trade
MAX_BALANCE_USAGE=0.5        # Usar máximo 50% del balance
SIGNATURE_TYPE=1             # 1 para Magic Link
```
3. Copia la clave (empieza por 0x...)

#### 💰 B) Tu dirección de depósito en Polymarket
1. Ve a [polymarket.com](https://polymarket.com) y conecta tu wallet
2. Click en tu perfil (esquina superior derecha)
3. Busca "Deposit" o "Depositar"
4. Copia la dirección que aparece (empieza por 0x5b2ad...)

#### 🎯 C) Dirección del trader que quieres copiar
1. En Polymarket, busca el trader que quieres copiar
## 🔑 Obtener claves

**Private Key (Magic Link):**
1. Ve a [reveal.magic.link/polymarket](https://reveal.magic.link/polymarket)
2. Conecta tu email de Polymarket
3. Copia la clave privada

**Proxy Address:**
1. Ve a polymarket.com → Deposit
2. Copia la dirección donde depositas USDC

**Target Wallet:**
- Dirección del trader que quieres copiar

## 🎮 Uso

```bash
npm start
```

El bot detectará trades automáticamente y los copiará respetando tus límites.

## ⚠️ Importante

- Empieza con montos pequeños ($20-50)
- El bot respeta el límite máximo configurado
- Balances mostrados correctamente (convertidos desde formato wei)
- Market orders con ejecución inmediata

## 📝 Configuración SIZE_MULTIPLIER

- `0.005` = 0.5% de tu balance por trade (recomendado)
- `0.01` = 1% de tu balance
- `0.02` = 2% de tu balance
- `1.0` = Trading proporcional inteligente

## ⚙️ Scripts

```bash
npm start      # Ejecutar bot
npm run build  # Compilar
# 🤖 Polymarket Copy Trade Bot

Bot que copia trades de Polymarket en tiempo real con gestión de riesgo.

## � Instalación

```bash
# Instalar dependencias
npm install

# Copiar configuración
cp .env.example .env

# Editar .env con tus valores
# Compilar
npm run build

# Ejecutar
npm start
```

## ⚙️ Configuración (.env)

```properties
# Tu clave privada (de Magic Link o MetaMask)
PRIVATE_KEY=0x...

# Tu dirección de Polymarket (donde depositas USDC)
POLYMARKET_PROXY_ADDRESS=0x...

# Wallet que quieres copiar
TARGET_WALLET_ADDRESS=0x...

# Configuración del bot
SIZE_MULTIPLIER=0.005        # 0.5% de tu balance por trade
MAX_TRADE_AMOUNT=5.0         # Máximo $5 por trade
MAX_BALANCE_USAGE=0.5        # Usar máximo 50% del balance
SIGNATURE_TYPE=1             # 1 para Magic Link
```

## � Obtener claves

**Private Key (Magic Link):**
1. Ve a [reveal.magic.link/polymarket](https://reveal.magic.link/polymarket)
2. Conecta tu email de Polymarket
3. Copia la clave privada

**Proxy Address:**
1. Ve a polymarket.com → Deposit
2. Copia la dirección donde depositas USDC

**Target Wallet:**
- Dirección del trader que quieres copiar

## 🎮 Uso

```bash
npm start
```

El bot detectará trades automáticamente y los copiará respetando tus límites.

## ⚠️ Importante

- Empieza con montos pequeños ($20-50)
- El bot respeta el límite máximo configurado
- Balances mostrados correctamente (convertidos desde formato wei)
- Market orders con ejecución inmediata

## 📝 Configuración SIZE_MULTIPLIER

- `0.005` = 0.5% de tu balance por trade (recomendado)
- `0.01` = 1% de tu balance
- `0.02` = 2% de tu balance
- `1.0` = Trading proporcional inteligente

## ⚙️ Scripts

```bash
npm start      # Ejecutar bot
npm run build  # Compilar
npm run logs   # Ver logs
```

## 🛡️ Seguridad

- Solo invierte lo que puedes permitirte perder
- Usa una wallet separada para el bot
- Empieza con montos pequeños para probar

## � Licencia

MIT License
5. Copia la dirección que aparece (empieza por 0x5b2ad...)

#### 🎯 C) Dirección del trader que quieres copiar
1. En Polymarket, busca el trader que quieres copiar
2. Ve a su perfil
3. Copia su dirección de wallet (aparece en la URL o en el perfil)

### Paso 3: Configurar el bot
```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar con tus datos (usa notepad, nano, vim, etc.)
notepad .env
```

Completa el archivo `.env`:
```env
# 🔑 CLAVE PRIVADA (la que conseguiste en el paso 2A)
PRIVATE_KEY=0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef

# 💰 DIRECCIÓN DE DEPÓSITO (la que conseguiste en el paso 2B)  
POLYMARKET_PROXY_ADDRESS=0x5b2ad365a2015fcf669dc61bdb01bec60952a65a

# 🎯 TRADER A COPIAR (la que conseguiste en el paso 2C)
TARGET_WALLET_ADDRESS=0x4a38e6e0330c2463fb5ac2188a620634039abfe8

# ⚙️ CONFIGURACIÓN BÁSICA
SIGNATURE_TYPE=1             # 1 para Magic Link, 0 para MetaMask
SIZE_MULTIPLIER=0.1          # Copiar al 10% del tamaño original  
MIN_TRADE_AMOUNT=0.50        # Mínimo $0.50 por trade
MAX_TRADE_AMOUNT=5.0         # Máximo $5 por trade
```

### Paso 4: Financiar tu cuenta
**IMPORTANTE**: Necesitas tener USDC en tu dirección de depósito de Polymarket

1. Ve a [polymarket.com](https://polymarket.com) 
2. Click en "Deposit" 
3. Deposita USDC (recomendado: empezar con $10-50 para probar)
4. Espera la confirmación

### Paso 5: Ejecutar el bot
```bash
# Compilar el código
npm run build

# Ejecutar el bot
npm start
```

## 🔧 Comandos Disponibles

```bash
# Desarrollo (con recarga automática)
npm run dev

# Compilar TypeScript
npm run build  

# Ejecutar en producción
npm start

# Limpiar archivos compilados
npm run clean
```

## 💡 Configuración Avanzada

### 📊 Trading Proporcional vs Tradicional

El bot soporta **3 modos de copy trading**:

#### 🎯 Trading Proporcional Verdadero (Recomendado)
```env
SIZE_MULTIPLIER=1.0          # Copiar EXACTAMENTE el mismo % que usa el trader
SIZE_MULTIPLIER=0.5          # Usar la MITAD del % que usa el trader  
SIZE_MULTIPLIER=2.0          # Usar el DOBLE del % que usa el trader
MIN_TRADE_AMOUNT=0.0         # Sin límite mínimo
```

**Cómo funciona:**
1. El bot detecta cuánto % de su capital usó el trader objetivo
2. Aplica el **mismo porcentaje** a tu capital
3. Ajusta según el `SIZE_MULTIPLIER`

**Ejemplos prácticos:**
- **Trader objetivo:** $10,000 capital, hace trade de $50 (0.5% de su capital)
- **Tu capital:** $1,000 
- **Con SIZE_MULTIPLIER=1.0:** Tu trade = $5 (0.5% de tu capital)
- **Con SIZE_MULTIPLIER=0.5:** Tu trade = $2.50 (0.25% de tu capital)
- **Con SIZE_MULTIPLIER=2.0:** Tu trade = $10 (1% de tu capital)

**Ventajas:**
- ✅ **Proporción perfecta**: Mismo riesgo relativo que el trader experto
- ✅ **Sin límites mínimos**: Permite trades desde $0.01
- ✅ **Gestión inteligente**: Si el trader arriesga poco, tú también

#### 📈 Trading Proporcional Fijo
```env
SIZE_MULTIPLIER=0.02         # Cada trade usa 2% de tu balance total
MIN_TRADE_AMOUNT=0.0         # Sin límite mínimo
```

**Cómo funciona:**
- Si tienes $50 USDC → cada trade será máximo $1.00 (2%)
- Si tienes $100 USDC → cada trade será máximo $2.00 (2%)
- Si tienes $500 USDC → cada trade será máximo $10.00 (2%)

#### � Trading Tradicional
```env
SIZE_MULTIPLIER=0.5          # Copiar al 50% del tamaño original
MIN_TRADE_AMOUNT=1.0         # Mínimo $1 por trade
```

**Cómo funciona:**
- Si el trader original hace un trade de $100 → tú haces $50
- Si el trader original hace un trade de $10 → tú haces $5
- Independiente de tu balance actual

### Configuración recomendada por capital

| Tu capital | SIZE_MULTIPLIER | Descripción |
|------------|-----------------|-------------|
| $10 - $50  | `0.01` | 1% por trade (conservador) |
| $50 - $200 | `0.02` | 2% por trade (moderado) |  
| $200 - $500| `0.03` | 3% por trade (agresivo) |
| $500+      | `0.05` | 5% por trade (muy agresivo) |

### Ajustar límites de trading
```env
SIZE_MULTIPLIER=0.02         # 2% del balance disponible
MIN_TRADE_AMOUNT=0.0         # Sin límite mínimo (permite $0.01+)
MAX_TRADE_AMOUNT=10.0        # Máximo $10 por trade
MAX_BALANCE_USAGE=0.5        # Usar máximo 50% del balance total
```

### Cambiar trader objetivo
Solo modifica `TARGET_WALLET_ADDRESS` en el `.env` y reinicia el bot.

## 📊 Entendiendo la salida del bot

```
🎯 trades detectado de wallet objetivo!
📉 Limitando a monto máximo: $5
💰 Copiando: BUY 8.93 tokens a $0.56 (Total: $5.00)
🎉 Trade copiado exitosamente con ORDEN DE MERCADO! Order ID: 0x...
```

- **Market orders**: Se ejecutan inmediatamente (aparecen en "Positions", no en "Open orders")
- **Límites aplicados**: El bot respeta tus límites mínimos/máximos
- **Escalado**: Multiplica el tamaño original por tu `SIZE_MULTIPLIER`

## ⚠️ Seguridad e Información Importante

### 🛡️ Medidas de seguridad
- ✅ **Usa una wallet separada** solo para copy trading
- ✅ **Empieza con poco dinero** para probar ($10-50)
- ✅ **Nunca compartas tu private key**
- ✅ **Mantén tu archivo .env privado** (no lo subas a GitHub)

### 💰 Gestión de riesgo  
- El bot usa **market orders** (ejecución inmediata)
- Respeta límites mínimos y máximos configurados
- Solo puede gastar el USDC que tengas disponible
- **No puede acceder a otros fondos** de tu wallet principal

### 🔄 Tipos de operaciones
| Tipo | Descripción | Ejecución |
|------|-------------|-----------|
| **BUY** | Compra shares al precio de mercado | Inmediata |
| **SELL** | Vende shares (si las tienes) | Inmediata |
| **Orders Matched** | Órdenes completadas | Inmediata |

## 🐛 Solución de Problemas

### Error: "not enough balance / allowance"
- **Para SELL**: Normal si no tienes esos tokens (necesitas comprar primero)
- **Para BUY**: Necesitas más USDC en tu cuenta de Polymarket

### Error: "Size lower than minimum: 5"  
- El mercado requiere mínimo 5 tokens
- El bot lo ajustará automáticamente si está dentro de tus límites

### Error: "Could not create api key"
- Es normal, puedes ignorarlo
- El bot sigue funcionando correctamente

### El bot no detecta trades
- Verifica que `TARGET_WALLET_ADDRESS` sea correcta
- Asegúrate de que el trader esté activo
- Revisa que tengas conexión a internet

## 📝 Notas de Desarrollo

### Arquitectura
- **TypeScript**: Código tipado y seguro
- **WebSocket**: Conexión en tiempo real
- **Market Orders**: Ejecución inmediata via CLOB client
- **Magic Link**: Soporte para autenticación por email

### API Utilizada
- [@polymarket/clob-client](https://www.npmjs.com/package/@polymarket/clob-client): Cliente oficial de Polymarket
- [@polymarket/real-time-data-client](https://www.npmjs.com/package/@polymarket/real-time-data-client): WebSocket en tiempo real

## 📄 Licencia

MIT License - Úsa bajo tu propio riesgo

---

⚠️ **DISCLAIMER**: Este bot es para fines educativos. El trading conlleva riesgos. Solo invierte lo que puedas permitirte perder.

## 📊 Ejemplo de Funcionamiento

**Wallet objetivo hace:**
- Compra $50 de tokens → **Tu bot compra $5** (10% con SIZE_MULTIPLIER=0.1)
- Compra $10 de tokens → **Tu bot compra $1** (mínimo aplicado)
- Compra $200 de tokens → **Tu bot compra $5** (máximo aplicado)

## 📋 Requisitos

1. **Cuenta de Polymarket** con USDC depositado
2. **Node.js 18+** instalado
3. **Private key** de tu wallet
4. **Dirección de la wallet objetivo** que quieres copiar

## 🛡️ Seguridad

- El bot **NUNCA** gasta más del límite máximo por trade
- Copia TODOS los trades en tiempo real sin restricciones artificiales
- Todos los datos sensibles van en `.env` (no compartir)

## 🔧 Configuración Avanzada

### Para balance de $33 USD (recomendado):
```env
SIZE_MULTIPLIER=0.1          # 10% del tamaño original
MIN_TRADE_AMOUNT=1.0         # Mínimo $1 (requerido por Polymarket)
MAX_TRADE_AMOUNT=5.0         # Máximo $5 (15% de tu balance)
```

### Más conservador:
```env
SIZE_MULTIPLIER=0.05         # 5% del tamaño original
MAX_TRADE_AMOUNT=3.0         # Máximo $3 por trade
```

### Más agresivo (⚠️ Mayor riesgo):
```env
SIZE_MULTIPLIER=0.15         # 15% del tamaño original
MAX_TRADE_AMOUNT=8.0         # Máximo $8 por trade
```

## 📝 Logs

El bot muestra toda la actividad en tiempo real:
```
🎯 Trade detectado de wallet objetivo!
💰 Copiando: BUY 5.2341 tokens a $0.65 (Total: $3.40)
🎉 Trade copiado exitosamente!
```

## ⚠️ Advertencias Importantes

- **Riesgo financiero**: Puedes perder dinero
- **Slippage**: Los precios pueden cambiar entre trades
- **Liquidez**: Algunos mercados pueden tener poca liquidez
- **Empieza pequeño**: Usa multiplicadores bajos al principio

## 🐛 Solución de Problemas

**Error de conexión**: Verifica tu PRIVATE_KEY y POLYMARKET_PROXY_ADDRESS
**No se detectan trades**: Verifica que TARGET_WALLET_ADDRESS sea correcta
**Errores de órdenes**: Asegúrate de tener suficiente USDC en tu cuenta

## 📄 Licencia

MIT License

## ⚠️ Disclaimer

**Usa bajo tu propia responsabilidad.** Este software se proporciona sin garantías. Los desarrolladores no se hacen responsables de pérdidas financieras.