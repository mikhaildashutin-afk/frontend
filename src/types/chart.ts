interface ChartData {
  poolChart: {
    from: string;
    to: string;
  }[];
  rebalanceAvgApr: number;
  aaveAvgApr: number;
  chartData: {
    date: string;
    value: number;
  }[];
  providerLines?: { address: string; name: string; key: string }[];
}

interface PreparedChartData {
  poolChart: {
    "1m": {
      data: ChartData["poolChart"];
      rebalanceAvg: number;
      aaveAvg: number;
    };
    "6m": {
      data: ChartData["poolChart"];
      rebalanceAvg: number;
      aaveAvg: number;
    };
    "1y": {
      data: ChartData["poolChart"];
      rebalanceAvg: number;
      aaveAvg: number;
    };
  };
  chartData: {
    "1m": (ChartData["chartData"][0] & { userEarning?: number | null })[];
    "6m": (ChartData["chartData"][0] & { userEarning?: number | null })[];
    "1y": (ChartData["chartData"][0] & { userEarning?: number | null })[];
  };
  providers?: { address: string; name: string; key: string }[];
}
