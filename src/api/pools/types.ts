export interface IPoolData {
  token: string;
  tokenAddress: string;
  rebalancerAddress: string;
  tokenPriceInUsd: number;
  tokenPrice24HrChangeInPercentages: number;
  tokenPrice24HrChangeInUsd: number;
  apr: number;
  funds: number;
  avgApr: number;
  earned: number;
  decimals: number;
  deposit: number;
  risk: number;
  borrowRate: number;
  borrowed: number;
}
export interface IPoolsData {
  token: string;
  vaultAddress: string;
  tokenAddress: string;
  tokenDecimals: number;
  tokenPrice: number;
  funds: number;
  earned: number;
  avgApr30D: number;
  highestMarket30DAvgAprDiffPercentage: number;
}

export interface ILendChartData {
  date: Date,
  lending: number | null
  [key: string]: number | null | Date
}

export interface IProviderAprTicks {
  address: string;
  name: string;
  ticks: IIntervalResponse[];
}

export interface IIntervalResponse {
  from: Date,
  to: Date,
  value: number | null
}

export interface IAreaChartData {
  poolChart: {
    [key: string]: {
      data: ILendChartData[],
      rebalanceAvg: number,
      aaveAvg: number,
    },
    '1m': {
      data: ILendChartData[],
      rebalanceAvg: number,
      aaveAvg: number,
    },
    '6m': {
      data: ILendChartData[],
      rebalanceAvg: number,
      aaveAvg: number,
    },
    '1y': {
      data: ILendChartData[],
      rebalanceAvg: number,
      aaveAvg: number,
    },
  },
  chartData: {
    [key: string]: ILendChartData[],
    '1m': ILendChartData[],
    '6m': ILendChartData[],
    '1y': ILendChartData[],
  },
  providers?: { address: string; name: string; key: string }[]
}

export interface ITotalProfit {
  totalProfit: number
}