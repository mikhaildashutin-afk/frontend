import { formatUnits } from "ethers";
import { useEffect, useState } from "react";
import { useReadContracts } from "wagmi";

import { ABI_REBALANCE } from "../abi/rebalance";

type Token = {
  contractAddress?: `0x${string}`;
  decimals?: number;
};

/**
 * Проверяет, есть ли у пользователя ненулевой баланс в активах хотя бы по одному vault.
 *
 * Rebalancer vault — ERC-4626. Баланс в активах получается связкой:
 *   shares = balanceOf(owner)
 *   assets = convertToAssets(shares)
 */
export const useBalanceOfAssets = (tokens: Token[], ownerAddress?: `0x${string}`) => {
  const [hasBalance, setHasBalance] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const validTokens = tokens.filter((t) => !!t.contractAddress && !!t.decimals);
  const enabled = validTokens.length > 0 && !!ownerAddress && ownerAddress !== "0x";

  const balanceContracts = validTokens.map(({ contractAddress }) => ({
    address: contractAddress as `0x${string}`,
    abi: ABI_REBALANCE,
    functionName: "balanceOf",
    args: [ownerAddress as `0x${string}`]
  }));

  const { data: rawShares, isLoading: loadingShares, refetch } = useReadContracts({
    contracts: balanceContracts,
    query: {
      enabled
    }
  });

  const shares = rawShares?.map((r) => (r.status === "success" ? (r.result as bigint) : BigInt(0))) ?? [];

  const assetContracts = validTokens.map(({ contractAddress }, index) => ({
    address: contractAddress as `0x${string}`,
    abi: ABI_REBALANCE,
    functionName: "convertToAssets",
    args: [shares[index] ?? BigInt(0)]
  }));

  const { data: rawAssets, isLoading: loadingAssets } = useReadContracts({
    contracts: assetContracts,
    query: {
      enabled: enabled && shares.length === validTokens.length
    }
  });

  useEffect(() => {
    if (rawAssets && validTokens.length > 0) {
      const balances = rawAssets.map((result, index) => {
        if (result.status !== "success") return 0;
        const decimals = validTokens[index].decimals ?? 18;
        return parseFloat(formatUnits(result.result as bigint, decimals));
      });
      setHasBalance(balances.some((balance) => balance > 0));
    } else {
      setHasBalance(false);
    }

    setIsLoading(loadingShares || loadingAssets);
  }, [rawAssets, loadingShares, loadingAssets]);

  useEffect(() => {
    if (!enabled) return;
    const interval = setInterval(() => {
      refetch();
    }, 3000);

    return () => clearInterval(interval);
  }, [refetch, enabled]);

  return { hasBalance, isLoading };
};