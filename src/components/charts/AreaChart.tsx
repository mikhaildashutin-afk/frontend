import React, { FC, useMemo } from "react";
import {
  ComposedChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import { themes } from "../../themes";
import { CustomTooltip } from "./components/CustomTooltip";
import { IAreaChartProps } from "./types";

export const AreaChart: FC<IAreaChartProps> = ({
  data,
  gradient,
  lines,
  tickFormatter,
  legend,
  tooltipName,
  isLending,
  isConnected,
  showRightAxis
}) => {
  // Memoized data processing
  const filteredData = useMemo(() => {
    let lastValidValue: number | null = null;
    let hasNonZeroStarted = false;

    if (data === null) {
      return undefined;
    }

    return data?.reduce((acc: any[], item: any) => {
      if (item.lending !== 0 || hasNonZeroStarted) {
        hasNonZeroStarted = true;
        if (item.lending === 0 && lastValidValue !== null) {
          // Replace 0 with the last valid non-zero value
          acc.push({ ...item, lending: lastValidValue });
        } else {
          // Update last valid value and push the item
          lastValidValue = item.lending;
          acc.push(item);
        }
      }
      return acc;
    }, []);
  }, [data]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart
        data={filteredData}
        margin={{
          top: 0,
          right: showRightAxis ? 10 : 10,
          left: -25,
          bottom: 0
        }}
      >
        {gradient}
        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
        {legend}
        <Tooltip
          cursor={{ opacity: 0.1, strokeWidth: 1 }}
          content={<CustomTooltip name={tooltipName} isLending={isLending} />}
        />
        <XAxis
          dataKey="date"
          tickLine={false}
          tickSize={10}
          interval="preserveStartEnd"
          tickFormatter={tickFormatter}
          axisLine={false}
          stroke={themes.colors.darkGray}
          fontSize={themes.fontSizes.sm}
        />
        <YAxis
          axisLine={false}
          yAxisId={0}
          tickSize={5}
          tickLine={false}
          fontSize={themes.fontSizes.sm}
          stroke={themes.colors.darkGray}
          tickFormatter={(e: string) => `${e} %`}
        />
        {showRightAxis && (
          <YAxis
            yAxisId={1}
            orientation="right"
            dataKey="userEarning"
            axisLine={false}
            tickLine={false}
            axisType="yAxis"
            fontSize={themes.fontSizes.sm}
            stroke={themes.colors.darkGray}
            tickFormatter={(e: string) => `$${e}`}
            allowDataOverflow
          />
        )}
        {lines}
      </ComposedChart>
    </ResponsiveContainer>
  );
};
