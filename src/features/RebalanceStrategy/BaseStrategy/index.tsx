import { Box, Flex, SimpleGrid, Text, useMediaQuery } from "@chakra-ui/react";
import React from "react";
import { useAccount } from "wagmi";
import { observer } from "mobx-react-lite";

import { MEDIA_QUERY_MAX } from "../../../consts";
import { useBalanceOfAsset } from "../../../hooks/useBalanceOfAsset";
import { DepositLendingButton } from "../../actions/deposit-or-withdraw-button/DepositLendingButton";
import { WithdrawLendingButton } from "../../actions/deposit-or-withdraw-button/WithdrawLendingButton";
import { BaseChart } from "./BaseChart";
import EarningsChart from "./EarningsChart";
import { formatNumber } from "@/utils/formatNumber";
import { useStore } from "@/hooks/useStoreContext";

const BaseStrategy: React.FC<any> = observer(({ pool, chartData }) => {
  const { address } = useAccount();
  const { balance } = useBalanceOfAsset(pool.rebalancerAddress, address ?? "0x", pool.decimals);
  const [media] = useMediaQuery(MEDIA_QUERY_MAX);
  const { isDemoMode } = useStore("demoStore");
  
  // Show $1M simulated deposit when demo mode is enabled (only for DAI)
  const displayBalance = (isDemoMode && pool.token === 'DAI') ? 1000000 : balance;
  const isDemo = isDemoMode && !address && pool.token === 'DAI';
  
  return (
    <SimpleGrid columns={media ? 1 : 2} gap="24px">
      <Flex direction="column">
        <Flex direction="column" bg="#17191C" borderRadius="8px" padding="24px">
          <Text fontSize="lg" color="white">
            My deposit
          </Text>
          <Box mt="16px" mb="24px" display="flex" flexDirection="row" alignItems="baseline">
            <Text fontWeight="400" fontSize="24px" lineHeight="24px" color="white">
              {formatNumber(displayBalance.toFixed(2))} {pool?.token}
            </Text>
            <Text textStyle="text14" color="#9FA2A8" ml="16px">
              {formatNumber(displayBalance.toFixed(2))} $
            </Text>
          </Box>
          <SimpleGrid columns={!media || displayBalance > 0 ? 2 : 1} gap="8px">
            <DepositLendingButton
              variant="primaryWhite"
              pool={pool}
              minHeight="40px"
              className="step-4"
            />
            {displayBalance > 0 && <WithdrawLendingButton pool={pool} minHeight="40px" />}
          </SimpleGrid>
        </Flex>

        <EarningsChart token={pool?.token} address={address} pool={pool} />
      </Flex>

      <Flex w="100%" bg="#17191C" borderRadius="8px" minH="319px" padding="24px">
        <BaseChart chartData={chartData} />
      </Flex>
    </SimpleGrid>
  );
});
export default BaseStrategy;
