"use client";
import { Flex, Text, useMediaQuery } from "@chakra-ui/react";
import React, { useMemo } from "react";
import { Area } from "recharts";

import { AreaChart } from "../../../components/charts/AreaChart";
import { DateSwitcher } from "../../../components/data-switcher";
import { useDateSwitcher } from "../../../components/data-switcher/hooks";
import { DATES } from "../../../components/data-switcher/utils";
import { MEDIA_QUERY_MAX } from "../../../consts";
import { LegendAreaChart } from "./components/LegendAreaChart";
import { areaLines, colorsArea, connectedAreaLines, tickFormatter } from "./utils";
import { IAreaChartData } from "@/api/pools/types";
import UserProfit from "@/pagesComponents/Pools/PoolsLending/components/UserProfit";
import { useAccount } from "wagmi";
import { IAreaLineProps } from "./types";
import { ROUTES_TYPE } from "@/consts/routes-type";
import { tokens } from "@/themes/styles/colors";

const providerColors = [
  "#38bdf8",
  "#f97316",
  "#a855f7",
  "#f43f5e",
  "#22c55e",
  "#eab308",
  "#14b8a6",
  "#fb7185"
];

export const providerColor = (index: number) => providerColors[index % providerColors.length];

const providerGradients = (providers: { key: string; name: string }[]) => (
  <defs>
    {providers.map((p, i) => (
      <linearGradient key={p.key} id={`color-${p.key}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor={providerColor(i)} stopOpacity={0.6} />
        <stop offset="95%" stopColor={providerColor(i)} stopOpacity={0} />
      </linearGradient>
    ))}
  </defs>
);

const areaGradient = (
  <defs>
    <linearGradient id="color-lending" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor={colorsArea.lending} stopOpacity={0.28} />
      <stop offset="95%" stopColor={colorsArea.lending} stopOpacity={0} />
    </linearGradient>
    {/* <linearGradient id="color-borrowing" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor={colorsArea.borrowing} stopOpacity={0.8} />
      <stop offset="95%" stopColor={colorsArea.borrowing} stopOpacity={0} />
    </linearGradient> */}
  </defs>
);

const getAreaLines = (
  areas: IAreaLineProps[],
  providers: { key: string; name: string }[] = []
) => {
  const arr = areas.map((area, i) => (
    <Area
      key={i}
      name={area.name}
      type="linear"
      dataKey={area.type}
      stroke={colorsArea[area.type]}
      activeDot={{ r: 3, stroke: colorsArea[area.type] }}
      fill={`url(#color-${area.type})`}
    />
  ));

  providers.forEach((provider, i) => {
    arr.push(
      <Area
        key={provider.key}
        name={`${provider.name}, %`}
        type="linear"
        dataKey={provider.key}
        connectNulls
        stroke={providerColor(i)}
        activeDot={{ r: 3, stroke: providerColor(i) }}
        fill={`url(#color-${provider.key})`}
      />
    );
  });

  if (areas.length !== 1) {
    arr.push(
      <Area
        key="userEarning"
        name={connectedAreaLines[1].name}
        type="linear"
        dataKey="userEarning"
        stroke={tokens.ink3}
        fillOpacity={1}
        yAxisId={1}
        fill={`url(#color-${ROUTES_TYPE.borrowing})`}
      />
    );
  }

  return [...arr, areaGradient];
};

export const LendChart = ({
  chartData,
  showRightAxis
}: {
  chartData: IAreaChartData;
  showRightAxis?: boolean;
}) => {
  const [media] = useMediaQuery(MEDIA_QUERY_MAX);
  const { selectedDate, setSelectDate } = useDateSwitcher(DATES[0]);
  const { address, isConnected } = useAccount();

  const providers = useMemo(() => chartData?.providers ?? [], [chartData]);

  const _areaLines = useMemo(() => {
    if (address && showRightAxis) {
      return connectedAreaLines;
    }
    return areaLines;
  }, [address, showRightAxis]);

  return (
    <Flex w="100%" direction="column" position="relative">
      {!media && providers.length > 0 && (
        <Flex alignItems="center" gap="12px" flexWrap="wrap" mb={{ base: "24px", md: "14px" }}>
          {providers.map((p, i) => (
            <LegendAreaChart key={p.key} text={p.name} color={providerColor(i)} />
          ))}
        </Flex>
      )}

      {address && (
        <Text
          textStyle="h2"
          color="white"
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={media ? "24px" : "14px"}
        >
          <span>My Total Profit</span>
          <UserProfit address={address} />
        </Text>
      )}
      <Flex w="100%" alignItems="center" justify="space-between" mb={{ base: "0", md: "10px" }}>
        {!media && (
          <Flex alignItems="center" gap="12px">
            {_areaLines.map(elem => (
              <LegendAreaChart key={elem.type} text={elem.name} color={colorsArea[elem.type]} />
            ))}
          </Flex>
        )}

        <Flex
          zIndex={{ base: 1, md: 0 }}
          position={{ base: "absolute", md: "relative" }}
          right={{ base: "0" }}
        >
          <DateSwitcher date={DATES} selectDate={setSelectDate} selectedDate={selectedDate} />
        </Flex>
      </Flex>

      <AreaChart
        data={chartData?.chartData[selectedDate.name]}
        lines={getAreaLines(_areaLines, providers)}
        gradient={providers.length > 0 ? providerGradients(providers) : areaGradient}
        tickFormatter={tickFormatter}
        isLending
        isConnected={!!address}
        showRightAxis={showRightAxis}
      />

      {media && (
        <Flex alignItems="center" gap="12px">
          {_areaLines.map(elem => (
            <LegendAreaChart key={elem.type} text={elem.name} color={colorsArea[elem.type]} />
          ))}
        </Flex>
      )}
    </Flex>
  );
};
