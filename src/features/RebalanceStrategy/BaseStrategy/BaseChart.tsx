import { Flex, Text, useMediaQuery } from "@chakra-ui/react";
import React, { useState } from "react";
import { Area } from "recharts";

import { AreaChart } from "../../../components/charts/AreaChart";
import { DateSwitcher } from "../../../components/data-switcher";
import { useDateSwitcher } from "../../../components/data-switcher/hooks";
import { DATES } from "../../../components/data-switcher/utils";
import { colorsArea, tickFormatter } from "../utils";
import { LegendAreaChart } from "./components/LegendAreaChart";
import { IAreaLineProps } from "./types";
import { MEDIA_QUERY_MAX } from "../../../consts";
import { ILendChartData } from "@/api/pools/types";
import { ROUTES_TYPE } from "@/consts/routes-type";

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

const providerColor = (index: number) => providerColors[index % providerColors.length];

const areaGradient = (
  <defs>
    <linearGradient id="color-lending" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor={colorsArea.lending} stopOpacity={0.8} />
      <stop offset="95%" stopColor={colorsArea.lending} stopOpacity={0} />
    </linearGradient>
    <linearGradient id="color-borrowing" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor={"transparent"} stopOpacity={0.8} />
      <stop offset="95%" stopColor={"transparent"} stopOpacity={0} />
    </linearGradient>
  </defs>
);

const getAreaLines = (areas: IAreaLineProps[], providers: { key: string; name: string }[] = []) => {
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

  return [...arr, areaGradient];
};

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

interface IChartData {
  chartData: ILendChartData[];
  poolChart: any[];
}

export const BaseChart = ({
  chartData
}: {
  chartData: IChartData & { providers?: { address: string; name: string; key: string }[] };
}) => {
  const [media] = useMediaQuery(MEDIA_QUERY_MAX);
  const { selectedDate, setSelectDate } = useDateSwitcher(DATES[0]);
  const [smDown] = useMediaQuery("(max-width: 420px)");

  // Aave V3 и остальные провайдеры приходят отдельными линиями из provider-apr-ticks.
  const areaLines = [
    {
      name: "Rebalance APY\n",
      subtext: `(${chartData.poolChart[selectedDate.name as any].rebalanceAvg.toFixed(
        2
      )}% average)`,
      type: ROUTES_TYPE.lending
    }
  ];

  return (
    <Flex w="100%" direction="column" position="relative">
      <Flex
        w="100%"
        alignItems="center"
        justify="space-between"
        mb={{ base: "40px", md: "10px" }}
        mt={{ base: "24px", md: "0px" }}
      >
        <Flex
          w="100%"
          justifyContent="space-between"
          alignItems="center"
          zIndex={{ base: 1, md: 0 }}
          position={{ base: "absolute", md: "relative" }}
          right={{ base: "0" }}
        >
          <Text fontSize={smDown ? "md" : "lg"}>Strategy Profitability</Text>
          <DateSwitcher date={DATES} selectDate={setSelectDate} selectedDate={selectedDate} />
        </Flex>
      </Flex>

      <AreaChart
        data={chartData.poolChart[selectedDate.name as any].data}
        lines={getAreaLines(areaLines, chartData.providers ?? [])}
        gradient={
          (chartData.providers ?? []).length > 0
            ? providerGradients(chartData.providers ?? [])
            : areaGradient
        }
        tickFormatter={tickFormatter}
        tooltipName
      />

      <Flex
        alignItems="center"
        gap="12px"
        mt="28px"
        flexDirection={media ? "column" : "row"}
        mr={media ? "auto" : "0"}
      >
        {areaLines.map(elem => (
          <LegendAreaChart
            key={elem.type}
            text={elem.name}
            subText={elem.subtext}
            color={colorsArea[elem.type]}
          />
        ))}
        {(chartData.providers ?? []).map((provider, i) => (
          <LegendAreaChart
            key={provider.key}
            text={`${provider.name}, %`}
            color={providerColor(i)}
          />
        ))}
      </Flex>
    </Flex>
  );
};
