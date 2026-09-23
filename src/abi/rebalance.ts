// Источник истины — ABI интерфейса Rebalancer (IRebalancer),
// синхронизированный с backend: rebalancer-optimized-backend/abis/IRebalancer.json.
// Метод `getBalanceOfAsset` отсутствует в контракте; баланс в активах получается
// связкой `balanceOf(account)` → `convertToAssets(shares)` (ERC-4626).
import type { Abi } from 'viem';
import abiJson from './IRebalancer.json';

export const ABI_REBALANCE = abiJson as Abi;