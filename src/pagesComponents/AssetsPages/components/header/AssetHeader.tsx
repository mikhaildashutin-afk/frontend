"use client";
import { Flex, Link, Text } from "@chakra-ui/layout";
import { useMediaQuery } from "@chakra-ui/react";
import React, { FC, useMemo } from "react";

import Icon from "@/components/icon";
import { getFinalExplorerUrl } from "@/utils/url";

import { Risk } from "../../../../components/risk";
import { riskBgColor, riskColor } from "../../../../components/risk/utils";
import { TokenIcon } from "../../../../components/token-icon";
import {
  ARB_DEFAULT_EXPLORER_URL,
  BSC_DEFAULT_EXPLORER_URL,
  BASE_DEFAULT_EXPLORER_URL,
  ICON_NAMES,
  MEDIA_QUERY_MAX,
  CHAIN_ICONS
} from "../../../../consts";
import { ROUTES_TYPE } from "../../../../consts/routes-type";
import { getCurrentPath } from "../../../../features/RebalancePerformance/utils";
import { formatNumber } from "../../../../utils/formatNumber";
import { usePathname } from "next/navigation";
import { observer } from "mobx-react-lite";
import { useStore } from "@/hooks/useStoreContext";
import { ICHAIN } from "@/types";
import { arbitrum, base, bsc } from "viem/chains";

const getExplorerUrlByChain = (chainName: string): string => {
  switch (chainName) {
    case "BSC":
      return BSC_DEFAULT_EXPLORER_URL;
    case "Base":
      return BASE_DEFAULT_EXPLORER_URL;
    case "Arbitrum":
    default:
      return ARB_DEFAULT_EXPLORER_URL;
  }
};

const getChainIdByChainName = (chainName: string) => {
  switch (chainName) {
    case "BSC":
      return bsc.id;
    case "Base":
      return base.id;
    case "Arbitrum":
    default:
      return arbitrum.id;
  }
};

export const AssetHeader: FC<{
  pool: any;
  chainName: ICHAIN;
}> = observer(({ pool, chainName }) => {
  const location = usePathname();
  const pathName = getCurrentPath(location);
  const [media] = useMediaQuery(MEDIA_QUERY_MAX);
  const { activeChain } = useStore("poolsStore");
  const { isDemoMode } = useStore("demoStore");

  const chainIcon = useMemo(() => CHAIN_ICONS[getChainIdByChainName(activeChain)], [activeChain]);
  
  // Calculate total earnings for a year with compound interest
  const calculateYearEarnings = (avgApr: number) => {
    const SIMULATED_DEPOSIT = 1000000;
    const DAYS_IN_YEAR = 365;
    let balance = SIMULATED_DEPOSIT;
    
    // Compound daily for a year
    for (let i = 0; i < DAYS_IN_YEAR; i++) {
      const dailyRate = avgApr / 100 / 365;
      balance += balance * dailyRate;
    }
    
    return balance - SIMULATED_DEPOSIT; // Return only the earnings
  };
  
  // Add 1M demo deposit + year earnings to total supply in demo mode (only for DAI)
  const yearEarnings = (isDemoMode && pool?.token === 'DAI') ? calculateYearEarnings(pool?.avgApr || 0) : 0;
  const displayFunds = (isDemoMode && pool?.token === 'DAI')
    ? (pool?.funds || 0) + 1000000 + yearEarnings 
    : pool?.funds;

  const getTitle = () => {
    if (chainName === "Base" && pool.token === "USDC") {
      return "Morpho USDC";
    }

    return pool.token;
  };

  if (media) {
    return (
      <Flex w="100%" h="fit-content" flexDirection="column">
        <Flex gap="24px" flexDirection="column" className="step-3">
          <Flex gap="8px" align="inherit">
            <TokenIcon name={pool?.token} size="32px" sizeIcon="22px" />
            <Flex
              direction="row"
              gap="8px"
              alignItems="center"
              w="100%"
              justifyContent="space-between"
            >
              <Flex gap="10px" textStyle="h1" fontWeight="500" lineHeight="24px" align={"center"}>
                <Text>{getTitle()}</Text>
                <Link
                  href={getFinalExplorerUrl({
                    url: getExplorerUrlByChain(chainName),
                    address: pool.tokenAddress,
                    type: "token"
                  })}
                  isExternal
                >
                  <Icon name={ICON_NAMES?.assetFunction} size="sm" />
                </Link>
              </Flex>
            </Flex>
          </Flex>

          <Flex flexDirection="column" fontWeight="500">
            <Flex justifyContent="space-between" alignItems="center">
              <Text>Average 30D APY</Text>
              <Flex gap={1} alignItems="center">
                <Text variant="t22">{pool.avgApr.toFixed(2)} %</Text>
              </Flex>
            </Flex>
            <Flex justifyContent="space-between" alignItems="center">
              <Text>Total supply</Text>
              <Text variant="t22">$ {formatNumber(displayFunds.toFixed(2))}</Text>
            </Flex>
          </Flex>
        </Flex>

        {ROUTES_TYPE.lending === pathName && (
          <Flex gap="24px" mt="28px" justifyContent="space-between">
            <Flex direction="column" gap="8px">
              <Text>Risk Factor</Text>
              <Text
                p="0 10px"
                bg={riskBgColor[pool.risk]}
                w="fit-content"
                fontSize="xl"
                fontWeight="500"
                color={riskColor[pool.risk]}
                borderRadius="4px"
              >
                {pool.risk}/5
              </Text>
            </Flex>
            <Risk risk={pool.risk} w="12px" h="50px" gap="12px" />

            <Flex direction="column" gap="8px" color="#D2D2D2" justify="center" lineHeight="14px">
              <Text textStyle="text12">Asset risk - {pool?.risk}</Text>
              <Text textStyle="text12">Protocols risk - {pool?.risk}</Text>
            </Flex>
          </Flex>
        )}
      </Flex>
    );
  }

  return (
    <Flex w="100%" h="fit-content" align="center" justify="space-between">
      <Flex align="center" gap="48px" flexDirection={media ? "column" : "row"} className="step-3">
        <Flex gap="8px" align="inherit">
          <TokenIcon name={pool?.token} />
          <Flex direction="column" gap="8px">
            <Text>
              {getTitle()} ({chainName})
            </Text>
            <Flex gap="12px" align="center">
              <Flex align="center" gap="10px" fontSize="xl" fontWeight="500">
                <Text>{pool?.token}</Text>
              </Flex>
              <Link
                href={getFinalExplorerUrl({
                  url: getExplorerUrlByChain(chainName),
                  address: pool.tokenAddress,
                  type: "token"
                })}
                isExternal
              >
                <Icon name={ICON_NAMES.assetFunction} size="sm" />
              </Link>
            </Flex>
          </Flex>
        </Flex>

        <Flex direction="column" gap="8px">
          <Text>Average 30D APY</Text>
          <Flex gap={1} alignItems="center">
            <Text variant="t22">{pool?.avgApr?.toFixed(2)} %</Text>
          </Flex>
        </Flex>

        <Flex direction="column" gap="8px">
          <Text>Total supply</Text>
          <Text variant="t22">$ {formatNumber(displayFunds?.toFixed(2))}</Text>
        </Flex>
      </Flex>

      {ROUTES_TYPE.lending === pathName && (
        <Flex p="16px 24px" gap="24px" border="2px solid #0F0F0F" borderRadius="4px">
          <Flex direction="column" gap="8px">
            <Text>Risk Factor</Text>
            <Text
              p="0 10px"
              bg={riskBgColor[pool?.risk]}
              w="fit-content"
              fontSize="xl"
              fontWeight="500"
              color={riskColor[pool?.risk]}
              borderRadius="4px"
            >
              {pool?.risk}/5
            </Text>
          </Flex>
          <Risk risk={pool?.risk} w="12px" h="50px" gap="12px" />

          <Flex direction="column" gap="8px" color="#D2D2D2" justify="center">
            <Text textStyle="text12">Asset risk - {pool?.risk}</Text>
            <Text textStyle="text12">Protocols risk - {pool?.risk}</Text>
          </Flex>
        </Flex>
      )}
    </Flex>
  );
});
