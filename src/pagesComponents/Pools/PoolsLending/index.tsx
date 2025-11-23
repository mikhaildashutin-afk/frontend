"use client";
import { Box, Divider, Flex, HStack, SimpleGrid, Text, Skeleton } from "@chakra-ui/react";
import { useAccount } from "wagmi";
import { CardPool } from "../../../components/card";
import { Risk } from "../../../components/risk";
import { Tooltip } from "../../../components/tooltip";
import { ICON_NAMES, ROUTE_PATHS, DEMO_DEPOSITS } from "../../../consts";
import { DepositLendingButton } from "../../../features/actions/deposit-or-withdraw-button/DepositLendingButton";
import { WithdrawLendingButton } from "../../../features/actions/deposit-or-withdraw-button/WithdrawLendingButton";
import { formatNumber, formatPercent, formatNeutralPercent } from "../../../utils/formatNumber";
import { IPoolData, IRowCard, RowCardNames, RowCardProccessType } from "../types";
import DepositInfo from "./components/DepositInfo";
import UserProfitPool from "./components/UserProfitPool";
import Icon from "@/components/icon";
import { useRouter } from "next/navigation";
import { useStore } from "@/hooks/useStoreContext";
import { getIdByToken } from "@/utils/analytics";
import { observer } from "mobx-react-lite";

type Protocol =
  | "AAVE"
  | "COMPOUND"
  | "DOLOMITE"
  | "FRAXLEND"
  | "KINZA"
  | "VENUS"
  | "MORPHO_SPARK"
  | "MORPHO_MOONWELL"
  | "MORPHO_SEAMLESS"
  | "MORPHO_STEAKHOUSE"
  | "MORPHO_GAUNTLET_PRIME"
  | "MORPHO_GAUNTLET_CORE"
  | "MORPHO_APOSTRO";

interface TokenProtocolMap {
  [chain: string]: {
    [token: string]: Protocol[];
  };
}

const YieldPoolList = ({ pools }: { pools: string[] }) => (
  <>
    {pools.map((pool, index) => (
      <span key={index}>
        <br />- {pool}
      </span>
    ))}
  </>
);

export const PoolsLending = observer(
  ({ pools, loading, error, chartData }: { pools: IPoolData[]; loading: boolean; error: string | null; chartData?: any }) => {
    const { address } = useAccount();
    const router = useRouter();
    const { isDemoMode } = useStore("demoStore");
    
    // Calculate actual number of days from chart data based on visible data range
    const calculateActualDays = () => {
      const yearData = chartData?.chartData?.["1y"];
      if (!yearData || yearData.length === 0) return 365;
      
      // Filter only data points with non-zero lending (visible on chart)
      const visibleData = yearData.filter((d: any) => d.lending && d.lending !== 0);
      
      if (visibleData.length === 0) return 365;
      
      // Get all visible dates and sort them
      const dates = visibleData.map((d: any) => new Date(d.date).getTime()).sort((a: number, b: number) => a - b);
      
      // Get first (earliest) and last (latest) visible dates
      const firstDate = new Date(dates[0]);
      const lastDate = new Date(dates[dates.length - 1]);
      
      // Calculate difference in days
      const diffTime = lastDate.getTime() - firstDate.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      
      return Math.max(diffDays, 1);
    };
    
    const actualDays = calculateActualDays();
    
    // Calculate total demo funds with actual days earnings
    const calculateDemoFunds = (pool: IPoolData) => {
      const demoAmount = DEMO_DEPOSITS[pool.token] || 0;
      if (!isDemoMode || demoAmount === 0) return pool.funds;
      
      let balance = demoAmount;
      
      // Compound daily for actual number of days
      for (let i = 0; i < actualDays; i++) {
        const dailyRate = pool.avgApr / 100 / 365;
        balance += balance * dailyRate;
      }
      
      const yearEarnings = balance - demoAmount;
      return pool.funds + demoAmount + yearEarnings;
    };
    const poolStore = useStore("poolStore");
    const { activeChain } = useStore("poolsStore");

    const getChainRouteName = () => {
      if (activeChain === "BSC") return "bsc";
      if (activeChain === "Base") return "base";
      return "arb";
    };

    const handleCardClick = (event: any, pool: IPoolData) => {
      if ((event.target as HTMLElement).closest("button")) {
        return;
      }
      poolStore.setActivePool(pool);
      router.push(ROUTE_PATHS.lendingAssetPage(getChainRouteName(), pool.token), { scroll: false });
    };

    // Protocol mapping configuration based on token and chain
    const tokenProtocolMap: TokenProtocolMap = {
      Arbitrum: {
        USDT: ["AAVE", "COMPOUND", "DOLOMITE"],
        wETH: ["AAVE", "COMPOUND", "DOLOMITE"],
        USDC: ["AAVE", "COMPOUND", "DOLOMITE"],
        "USDC.e": ["AAVE", "COMPOUND", "DOLOMITE"],
        DAI: ["AAVE", "DOLOMITE"],
        FRAX: ["AAVE", "FRAXLEND"]
      },
      BSC: {
        USDT: ["AAVE", "KINZA", "VENUS"],
        USDC: ["AAVE", "KINZA", "VENUS"]
      },
      Base: {
        USDC: [
          "AAVE",
          "COMPOUND",
          "MORPHO_SPARK",
          "MORPHO_MOONWELL",
          "MORPHO_SEAMLESS",
          "MORPHO_STEAKHOUSE",
          "MORPHO_GAUNTLET_PRIME",
          "MORPHO_GAUNTLET_CORE",
          "MORPHO_APOSTRO"
        ]
      }
    };

    // Get pretty names for protocols in tooltip
    const getProtocolPrettyName = (protocol: Protocol): string => {
      const protocolDisplayMap: Record<Protocol, string> = {
        AAVE: "Aave V3",
        COMPOUND: "Compound V3",
        DOLOMITE: "Dolomite",
        FRAXLEND: "Fraxlend",
        KINZA: "Kinza",
        VENUS: "Venus",
        MORPHO_SPARK: "Morpho Spark USDC Vault",
        MORPHO_MOONWELL: "Morpho Moonwell Flagship USDC",
        MORPHO_SEAMLESS: "Morpho Seamless USDC Vault",
        MORPHO_STEAKHOUSE: "Morpho Steakhouse USDC",
        MORPHO_GAUNTLET_PRIME: "Morpho Gauntlet USDC Prime",
        MORPHO_GAUNTLET_CORE: "Morpho Gauntlet USDC Core",
        MORPHO_APOSTRO: "Morpho Apostro Resolv USDC"
      };
      return protocolDisplayMap[protocol];
    };

    const getYieldStrategy = (token: string) => {
      const baseMessage = `${token} Low-Risk Yield Strategy: Higher APY is achieved by automatic rebalance between the following pools:`;

      const protocols = tokenProtocolMap[activeChain]?.[token] || [];
      const pools = protocols.map(getProtocolPrettyName);

      return (
        <>
          <span>{baseMessage}</span>
          <YieldPoolList pools={pools} />
        </>
      );
    };

    const getProtocolIcons = (token: string) => {
      const protocols = tokenProtocolMap[activeChain]?.[token] || [];

      if (protocols.length === 0) return null;

      return (
        <Box ml="auto" display="flex">
          {protocols.map((protocol, idx) => {
            if (protocol.startsWith("MORPHO_")) {
              return (
                <Box
                  key={idx}
                  marginRight={idx < protocols.length - 1 ? "-4px" : 0}
                  zIndex={protocols.length - idx}
                >
                  <Icon name={protocol} width="14px" height="14px" />
                </Box>
              );
            }

            return (
              <Box
                key={idx}
                borderRadius={protocol === "DOLOMITE" ? "50%" : undefined}
                marginRight={idx < protocols.length - 1 ? "-4px" : 0}
                zIndex={protocols.length - idx}
              >
                <Icon
                  name={protocol}
                  width={protocol === "AAVE" ? "10px" : "14px"}
                  height={protocol === "AAVE" ? "10px" : "14px"}
                />
              </Box>
            );
          })}
        </Box>
      );
    };

    const rowCard: IRowCard[] = [
      {
        name: RowCardNames.header,
        proccess({ item }) {
          return (
            <Flex direction="column" alignItems="center">
              <Tooltip
                label={
                  <span>
                    Asset risk - 1<br />
                    Protocols risk - 1
                  </span>
                }
                color="white"
              >
                <Text textStyle="textMono12" letterSpacing="3px" color="gray.100">
                  RISK
                </Text>
              </Tooltip>
              <Risk risk={item.risk} />
            </Flex>
          );
        }
      },
      {
        name: RowCardNames.body,
        proccess({ item, type }) {
          switch (type) {
            case RowCardProccessType.metrics:
              const itemAsPoolMetrics = item as IPoolData;
              return (
                <>
                  <HStack justify="space-between">
                    <Text color="white">Funds in pool</Text>
                    <Tooltip label="Funds in pool" color="white">
                      <Text textStyle="textMono16" color="white">
                        {loading || error ? (
                          <Skeleton height="20px" width="50px" />
                        ) : (
                          formatNumber(calculateDemoFunds(item as IPoolData)) + " $"
                        )}
                      </Text>
                    </Tooltip>
                  </HStack>
                  <Divider borderColor="black.60" />
                  <HStack>
                    <Tooltip label={getYieldStrategy(item.token)}>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        w="100%"
                        alignItems="center"
                      >
                        <Text color="white" borderBottom={"dashed 1px gray"}>
                          Rebalance APY
                        </Text>
                        {getProtocolIcons(item.token)}
                        <Text textStyle="textMono16" ml={2}>
                          {loading || error ? (
                            <Skeleton height="20px" width="50px" />
                          ) : (
                            formatNeutralPercent(item.avgApr)
                          )}
                        </Text>
                      </Box>
                    </Tooltip>
                  </HStack>

                  <HStack justify="space-between">
                    <Tooltip label={(() => {
                      const marketAPY = item.avgApr - item.apr;
                      const advantage = marketAPY > 0 ? ((item.apr / marketAPY) * 100).toFixed(0) : 0;
                      return `Average market APY in last 30 days. Rebalance is ${advantage}% higher`;
                    })()}>
                      <Text borderBottom={"dashed 1px gray"} color="white">
                        Market av. APY
                      </Text>
                    </Tooltip>
                    <Text color="white" textStyle="textMono16">
                      {loading || error ? (
                        <Skeleton height="20px" width="50px" />
                      ) : (
                        formatNeutralPercent(item.avgApr - item.apr)
                      )}
                    </Text>
                  </HStack>
                </>
              );
            case RowCardProccessType.assets:
              const itemAsPool = item as IPoolData;
              const demoAmountAssets = DEMO_DEPOSITS[itemAsPool.token] || 0;
              const isDemo = isDemoMode && !address && demoAmountAssets > 0;
              
              // Calculate demo profit for actual number of days
              const calculateDemoProfit = () => {
                let balance = demoAmountAssets;
                
                for (let i = 0; i < actualDays; i++) {
                  const dailyRate = itemAsPool.avgApr / 100 / 365;
                  balance += balance * dailyRate;
                }
                
                const profit = balance - demoAmountAssets;
                return formatNumber(profit.toFixed(2));
              };
              
              return (
                <>
                  {(!!address || (isDemoMode && demoAmountAssets > 0)) ? (
                    <>
                      <Divider borderColor="black.60" />
                      <HStack justify="space-between">
                        <Text color="white">
                          Profit
                        </Text>
                        <Text textStyle="textMono16" color="white">
                          {loading || error ? (
                            <Skeleton height="20px" width="50px" />
                          ) : isDemo ? (
                            `$ ${calculateDemoProfit()}`
                          ) : address ? (
                            <UserProfitPool address={address} token={itemAsPool.token} />
                          ) : (
                            "0.00"
                          )}
                        </Text>
                      </HStack>
                      {isDemo ? (
                        <HStack justify="space-between">
                          <Text fontSize="md" fontWeight="500" color="white">
                            Deposit
                          </Text>
                          <Text textStyle="textMono16" color="white">
                            {formatNumber(demoAmountAssets)} {itemAsPool.token}
                          </Text>
                        </HStack>
                      ) : address ? (
                        <DepositInfo
                          contractAddress={itemAsPool.rebalancerAddress as `0x${string}`}
                          ownerAddress={address}
                          tokenName={itemAsPool.token}
                          decimals={itemAsPool.decimals}
                        />
                      ) : null}
                    </>
                  ) : null}
                </>
              );
            default:
              return <></>;
          }
        }
      },
      {
        name: RowCardNames.footer,
        proccess({ item }) {
          return (
            <>
              <DepositLendingButton
                pool={item}
                minHeight="40px"
                id={
                  address
                    ? `Click_Deposit_${getIdByToken(item.token)}`
                    : `Click_Deposit_start_${getIdByToken(item.token)}`
                }
              />
              <WithdrawLendingButton pool={item} minHeight="40px" />
            </>
          );
        }
      }
    ];

    return (
      <SimpleGrid
        columns={{ base: 1, md: 2, lg: 3, xl: 4 }}
        spacing="24px"
        alignItems="center"
        id="pools"
      >
        {loading || error
          ? Array.from({ length: 4 }).map((_, index) => (
              <Box key={index} padding="6" bg="#151619">
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Skeleton height="60px" mb="4" w="60px" borderRadius="100px" />
                  <Skeleton height="20px" mb="4" w="60px" />
                </Box>
                <Skeleton height="20px" mb="4" />
                <Skeleton height="20px" mb="4" />
                <Skeleton height="20px" mb="4" />
                <Skeleton height="20px" m="0 auto" />
              </Box>
            ))
          : pools?.map(elem => (
              <Box
                key={elem.token}
                onClick={event => handleCardClick(event, elem)}
                cursor="pointer"
              >
                <CardPool
                  key={elem.token}
                  rowCard={rowCard}
                  itemCard={elem}
                  isBaseChain={activeChain === "Base"}
                />
              </Box>
            ))}
      </SimpleGrid>
    );
  }
);
