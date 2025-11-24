"use client";

import { Flex, Link, Image, useMediaQuery, Skeleton, Switch, Text } from "@chakra-ui/react";
import React, { useState } from "react";
import NextLink from "next/link";
import { useAccount } from "wagmi";
import { observer } from "mobx-react-lite";
import LogoDesc from "/public/assets/logo/logo-long.svg";
import LogoMob from "/public/assets/logo/logo-short.svg";
import { MEDIA_QUERY_MAX, MOCKED_ADDRESS, ROUTE_PATHS } from "../consts";
import { ConnectWallet } from "../features/ConnectWallet";
import { WalletProfile } from "../features/WalletProfile";
import { AppNav } from "./AppNav";
import MaintenanceBlock from "@/components/maintenance-block";
import { useStore } from "@/hooks/useStoreContext";

export const AppHeader = observer(() => {
  const [media] = useMediaQuery(MEDIA_QUERY_MAX);
  const { isConnected, address } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const isUnderMaintenance = process.env.NEXT_PUBLIC_IS_UNDER_MAINTENANCE === "true";
  const [isDesktop] = useMediaQuery("(min-width: 1130px)");
  const { isDemoMode, toggleDemoMode, setDemoMode } = useStore("demoStore");
  
  // Auto-manage demo mode: disable when wallet connects, enable when disconnects
  React.useEffect(() => {
    if (address) {
      setDemoMode(false);
    } else {
      setDemoMode(true);
    }
  }, [address, setDemoMode]);

  return (
    <Flex
      flexDir="column"
      w="100%"
      maxW={"1300px"}
      position="sticky"
      top={0}
      zIndex={100}
      bg="black.100"
      minH={isUnderMaintenance ? { base: "120px", md: "160px" } : { base: "56px", md: "56px" }}
    >
      {isUnderMaintenance && <MaintenanceBlock />}
      <Flex
        alignItems="center"
        p={{ base: "6px 16px", xl: "24px 0px" }}
        justifyContent="space-between"
        w="100%"
      >
        <Link as={NextLink} href={ROUTE_PATHS.lending}>
          <Text
            fontFamily="Georgia, serif"
            fontSize={{ base: "18px", lg: "22px" }}
            fontWeight="500"
            color="white"
            letterSpacing="0.5px"
          >
            Predictus Fund I
          </Text>
        </Link>

        {!media && <AppNav />}

        <Flex gap="12px" alignItems="center">
          {!!address && isDesktop && isLoading && <Skeleton height="24px" width="60px" />}
          {/* {isConnected && <AppNotification />} */}
          {!!address ? <WalletProfile className="step-1" /> : <ConnectWallet className="step-1" />}
          {media && <AppNav />}
        </Flex>
      </Flex>
    </Flex>
  );
});
