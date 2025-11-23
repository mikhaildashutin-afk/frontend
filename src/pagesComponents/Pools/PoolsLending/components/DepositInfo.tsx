import { Flex, Skeleton, Text, TextProps } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";

import { useBalanceOfAsset } from "../../../../hooks/useBalanceOfAsset";
import { formatNumber } from "../../../../utils/formatNumber";
import { useAccount } from "wagmi";
import { getLocks } from "@/api/points/queries";
import { formatBigNumber } from "@/utils/formatBigNumber";
import { useStore } from "@/hooks/useStoreContext";
import { DEMO_DEPOSITS } from "@/consts";

interface DepositInfoProps {
  contractAddress: `0x${string}`;
  ownerAddress: `0x${string}`;
  tokenName: string;
  decimals: number;
  noTitle?: boolean;
  noSymbol?: boolean;
  TextProps?: TextProps;
}

const DepositInfo: React.FC<DepositInfoProps> = observer(({
  contractAddress,
  ownerAddress,
  tokenName,
  decimals,
  noTitle,
  noSymbol,
  TextProps
}) => {
  const { address } = useAccount();
  const { balance, isLoading } = useBalanceOfAsset(contractAddress, ownerAddress, decimals);
  const [lockedBalance, setLockedBalance] = useState(0);
  const [totalBalance, setTotalBalance] = useState(0);
  const { isDemoMode } = useStore("demoStore");

  useEffect(() => {
    if (address) {
      getLocks(address, tokenName).then(data => {
        const amountsBigInt = data.map(item => item.amount);
        const amountsNumbers = amountsBigInt.map(item => Number(formatBigNumber(item, decimals)));

        const totalLockedAmount = amountsNumbers.reduce((acc, item) => acc + item, 0);
        setLockedBalance(totalLockedAmount);
      });
    }
  }, [address, balance]);

  useEffect(() => {
    if (balance) {
      setTotalBalance(balance + lockedBalance);
    }
  }, [lockedBalance, balance]);

  // Show simulated deposit when demo mode is enabled
  const demoAmount = DEMO_DEPOSITS[tokenName] || 0;
  const displayBalance = (isDemoMode && demoAmount > 0) ? demoAmount : totalBalance;

  return (
    <Flex alignItems="center" justifyContent="space-between">
      {!noTitle && (
        <Text fontSize="md" fontWeight="500" color="whiteAlpha.70">
          Deposit
        </Text>
      )}
      {isLoading ? (
        <Skeleton height="20px" width="50px" />
      ) : (
        <Text textStyle="textMono16" {...TextProps}>
          {formatNumber(displayBalance.toFixed(2))} {!noSymbol && tokenName}
        </Text>
      )}
    </Flex>
  );
});

export default DepositInfo;
