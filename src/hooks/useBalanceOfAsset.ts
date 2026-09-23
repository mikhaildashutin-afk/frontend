import { formatUnits } from "ethers";
import { useEffect, useState } from "react";
import { useReadContract } from "wagmi";

import { ABI_REBALANCE } from "../abi/rebalance";

/**
 * Баланс пользователя в активах vault (underlying).
 *
 * Rebalancer vault — ERC-4626. Баланс в активах получается связкой:
 *   shares = balanceOf(owner)
 *   assets = convertToAssets(shares)
 *
 * `decimals` — decimals underlying-токена (для USDC — 6), поэтому
 * после convertToAssets результат форматируем именно этим масштабом.
 */
export const useBalanceOfAsset = (
  contractAddress: `0x${string}`,
  ownerAddress: `0x${string}`,
  decimals: number
) => {
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const { data: rawShares, isLoading: loadingShares, refetch } = useReadContract({
    address: contractAddress,
    abi: ABI_REBALANCE,
    functionName: "balanceOf",
    args: [ownerAddress]
  });

  const shares = (rawShares ?? BigInt(0)) as bigint;

  const { data: rawAssets, isLoading: loadingAssets } = useReadContract({
    address: contractAddress,
    abi: ABI_REBALANCE,
    functionName: "convertToAssets",
    args: [shares],
    query: {
      enabled: rawShares !== undefined && rawShares !== null
    }
  });

  useEffect(() => {
    if (rawAssets !== undefined && rawAssets !== null) {
      const formattedBalance = formatUnits(rawAssets as bigint, decimals);
      setBalance(+formattedBalance);
    }
    setIsLoading(loadingShares || loadingAssets);
  }, [rawAssets, loadingShares, loadingAssets, decimals]);

  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 3000);

    return () => clearInterval(interval);
  }, [refetch]);

  return { balance, isLoading };
};