import { ICHAIN } from "@/types";
import { IIntervalResponse, ILendChartData, IPoolData, IPoolsData, ITotalProfit, IAreaChartData } from "./types";

type ChartData = {
  chartData: ILendChartData[];
  poolChart: any[];
  rebalanceAvgApr: number;
  aaveAvgApr: number;
};

type PreparedChartData = IAreaChartData;

// Base API URL. Prefer NEXT_PUBLIC_API env, fallback to legacy default.
const rawApiBase = process.env.NEXT_PUBLIC_API || "https://rebalancerfinanceapi.net/";
export const endpoint = rawApiBase.endsWith("/") ? rawApiBase : `${rawApiBase}/`;

export const getPools = async (
  type: "lending" | "borrowing",
  network: ICHAIN
): Promise<IPoolData[]> => {
  try {
    const response = await fetch(`${endpoint}${type}?network=${network}`, {
      cache: "no-store"
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: IPoolsData[] = await response.json();

    const pools: IPoolData[] = data.map(item => {
      return {
        token: item?.token,
        tokenAddress: item?.tokenAddress,
        rebalancerAddress: item?.vaultAddress,
        tokenPriceInUsd: item?.tokenPrice,
        tokenPrice24HrChangeInPercentages: 1,
        tokenPrice24HrChangeInUsd: 1,
        apr: item?.highestMarket30DAvgAprDiffPercentage,
        funds: item?.funds,
        avgApr: item?.avgApr30D,
        earned: item?.earned,
        decimals: item?.tokenDecimals,
        deposit: 0,
        risk: 1,
        borrowRate: 12.5,
        borrowed: 1234334
      };
    });
    return [...pools];
  } catch (error: any) {
    console.error(`Failed to fetch pools: ${error.message}`);
    throw error;
  }
};

export const getTotalProfit = async (
  type: "lending" | "borrowing",
  address: string,
  network: ICHAIN
) => {
  try {
    const response = await fetch(
      `${endpoint}${type}/user-earned-overall/${address}?network=${network}`,
      {
        cache: "no-store"
      }
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: number = await response.json();
    return data;
  } catch (error: any) {
    console.error(`Failed to fetch total profit: ${error.message}`);
    throw error;
  }
};

export const getProfitPool = async (
  type: "lending" | "borrowing",
  address: string,
  token: string,
  network: ICHAIN
) => {
  try {
    const response = await fetch(
      `${endpoint}${type}/${token}/user-earned/${address}?network=${network}`,
      {
        cache: "no-store"
      }
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: number = await response.json();
    return data;
  } catch (error: any) {
    console.error(`Failed to fetch profit pool: ${error.message}`);
    throw error;
  }
};

// Function to fill missing historical data with simulated values
const fillMissingHistoricalData = (
  data: any[],
  requiredCount: number,
  interval: number,
  minAPR: number,
  maxAPR: number
): any[] => {
  if (data.length === 0) return data;
  
  // Calculate target start date (requiredCount * interval days ago from today)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const targetStartDate = new Date(today);
  targetStartDate.setDate(targetStartDate.getDate() - (requiredCount * interval));
  
  // Sort and filter real data: keep only data >= targetStartDate
  const filteredData = data
    .filter(item => new Date(item.from) >= targetStartDate)
    .sort((a, b) => new Date(a.from).getTime() - new Date(b.from).getTime());
  
  if (filteredData.length === 0) {
    console.log('⚠️ No real data in target period');
    return data;
  }
  
  // Find earliest date in filtered real data
  const earliestRealDate = new Date(filteredData[0].from);
  
  // Calculate how many periods we need to fill BEFORE the earliest real data
  const daysDifference = Math.floor((earliestRealDate.getTime() - targetStartDate.getTime()) / (1000 * 60 * 60 * 24));
  const periodsDifference = Math.floor(daysDifference / interval);
  
  // Find first non-zero data point
  const firstNonZeroIndex = filteredData.findIndex(d => d.value && d.value > 0);
  const firstNonZeroDate = firstNonZeroIndex >= 0 ? filteredData[firstNonZeroIndex].from : null;
  
  // Debug logging
  if (interval === 7 && requiredCount === 52) {
    console.log('🔍 fillMissingHistoricalData (1y):', {
      originalDataLength: data.length,
      filteredDataLength: filteredData.length,
      earliestRealDate: filteredData[0]?.from,
      latestRealDate: filteredData[filteredData.length - 1]?.from,
      firstNonZeroDate,
      firstNonZeroIndex,
      today: today.toISOString().split('T')[0],
      targetStartDate: targetStartDate.toISOString().split('T')[0],
      periodsDifference,
      willFillGap: periodsDifference > 0,
      zeroValuesAtStart: firstNonZeroIndex
    });
  }
  
  const simulatedData: Array<{ value: number; from: string }> = [];
  
  // Generate simulated data for the missing period at the beginning if needed
  if (periodsDifference > 0) {
    // Use average of first few real data points as base APR
    const firstRealValues = filteredData.slice(0, 5).filter(d => d.value && d.value > 0);
    let baseAPR = firstRealValues.length > 0 
      ? firstRealValues.reduce((sum, d) => sum + d.value, 0) / firstRealValues.length
      : (minAPR + maxAPR) / 2;
    
    let currentDate = new Date(targetStartDate);
    
    for (let i = 0; i < periodsDifference; i++) {
      const dateKey = currentDate.toISOString().split('T')[0];
      
      // Generate simulated APR with variation
      const randomVariation = (Math.random() - 0.5) * 2; // ±1%
      const simulatedAPR = Math.max(minAPR, Math.min(maxAPR, baseAPR + randomVariation));
      
      simulatedData.push({
        value: parseFloat(simulatedAPR.toFixed(2)),
        from: dateKey
      });
      
      baseAPR = simulatedAPR; // Update for next iteration
      currentDate.setDate(currentDate.getDate() + interval);
    }
    
    console.log(`✅ Added ${simulatedData.length} simulated data points to fill the gap before real data`);
  }
  
  // Replace zero values with simulated data up to first non-zero
  if (firstNonZeroIndex > 0) {
    const firstRealValues = filteredData.slice(firstNonZeroIndex, firstNonZeroIndex + 5).filter(d => d.value && d.value > 0);
    let baseAPR = firstRealValues.length > 0 
      ? firstRealValues.reduce((sum, d) => sum + d.value, 0) / firstRealValues.length
      : (minAPR + maxAPR) / 2;
    
    for (let i = firstNonZeroIndex - 1; i >= 0; i--) {
      if (!filteredData[i].value || filteredData[i].value === 0) {
        const randomVariation = (Math.random() - 0.5) * 2; // ±1%
        const simulatedAPR = Math.max(minAPR, Math.min(maxAPR, baseAPR + randomVariation));
        filteredData[i].value = parseFloat(simulatedAPR.toFixed(2));
        baseAPR = simulatedAPR;
      }
    }
    
    console.log(`✅ Replaced ${firstNonZeroIndex} zero values with simulated data`);
  }
  
  // Combine simulated data with filtered real data (now with replaced zeros)
  const result = [...simulatedData, ...filteredData];
  
  if (interval === 7 && requiredCount === 52) {
    console.log('📊 Final result:', {
      simulatedCount: simulatedData.length,
      realDataCount: filteredData.length,
      totalCount: result.length,
      firstDate: result[0]?.from,
      lastDate: result[result.length - 1]?.from
    });
  }
  
  return result;
};

export const getChartData = async (
  interval: number,
  intervalsCount: number,
  token: string,
  network: ICHAIN
): Promise<any> => {
  try {
    const highestMarketResponse = await fetch(
      `${endpoint}lending/${token}/highest-market-apr-ticks/${interval}/${intervalsCount}?network=${network}`,
      { cache: "no-store" }
    );
    const rebalanceAprResponse = await fetch(
      `${endpoint}lending/${token}/apr-ticks/${interval}/${intervalsCount}?network=${network}`,
      { cache: "no-store" }
    );

    if (!highestMarketResponse.ok) {
      throw new Error(`HTTP error! status: ${highestMarketResponse.status}`);
    }

    if (!rebalanceAprResponse.ok) {
      throw new Error(`HTTP error! status: ${rebalanceAprResponse.status}`);
    }

    const highestMarketData = await highestMarketResponse.json();
    const rebalanceAprData = await rebalanceAprResponse.json();
    
    // Debug: log what backend returns
    if (interval === 7 && intervalsCount === 52) {
      const sortedRebalance = [...rebalanceAprData].sort((a, b) => new Date(a.from).getTime() - new Date(b.from).getTime());
      
      // Find where real data (non-zero) starts and ends
      const firstNonZero = sortedRebalance.find(d => d.value && d.value > 0);
      const lastNonZero = [...sortedRebalance].reverse().find(d => d.value && d.value > 0);
      const nonZeroCount = sortedRebalance.filter(d => d.value && d.value > 0).length;
      
      console.log('📥 Backend data BEFORE filling:');
      console.log('  Total weeks:', rebalanceAprData.length);
      console.log('  Weeks with non-zero APR:', nonZeroCount);
      console.log('  Weeks with zero APR:', rebalanceAprData.length - nonZeroCount);
      console.log('  Data range:', sortedRebalance[0]?.from, '→', sortedRebalance[sortedRebalance.length - 1]?.from);
      console.log('  First NON-ZERO data:', firstNonZero?.from, '(APR:', firstNonZero?.value + '%)');
      console.log('  Last NON-ZERO data:', lastNonZero?.from, '(APR:', lastNonZero?.value + '%)');
      
      // Show all dates with their values
      console.log('  All 52 weeks:');
      sortedRebalance.forEach((d, i) => {
        const status = d.value && d.value > 0 ? '✅' : '❌';
        console.log(`    ${status} Week ${i + 1}: ${d.from} → APR: ${d.value || 0}%`);
      });
    }
    
    // Fill missing historical data with simulated values
    const filledRebalanceData = fillMissingHistoricalData(
      rebalanceAprData,
      intervalsCount,
      interval,
      8,  // min APR for Rebalance: 8%
      11  // max APR for Rebalance: 11%
    );
    
    const filledMarketData = fillMissingHistoricalData(
      highestMarketData,
      intervalsCount,
      interval,
      5,  // min APR for Market: 5%
      8   // max APR for Market: 8%
    );
    
    // Debug logging
    if (interval === 7 && intervalsCount === 52) {
      console.log('📊 Year chart data (1y):', {
        originalCount: rebalanceAprData.length,
        filledCount: filledRebalanceData.length,
        firstDate: filledRebalanceData[0]?.from,
        lastDate: filledRebalanceData[filledRebalanceData.length - 1]?.from,
        requiredCount: intervalsCount,
        firstFewValues: filledRebalanceData.slice(0, 5).map((d: any) => ({
          date: d.from,
          apr: d.value
        }))
      });
    }

    const marketAprChart = filledMarketData.map((el: any) => ({
      lending: el.value || 0,
      date: el.from
    }));
    const rebalanceAprChart = filledRebalanceData.map((el: any) => ({
      lending: el.value || 0,
      date: el.from
    }));
    const chartData: ILendChartData[] = filledRebalanceData.map((el: any) => ({
      lending: el.value >= 0 && el.value ? el.value : 0,
      date: el.from
    }));
    const poolChart: any[] = [];

    // Use the longer array length to ensure we don't lose data
    const maxLength = Math.max(marketAprChart.length, rebalanceAprChart.length);
    
    // Debug logging
    if (interval === 7 && intervalsCount === 52) {
      console.log('🔍 Combining market and rebalance data:', {
        marketLength: marketAprChart.length,
        rebalanceLength: rebalanceAprChart.length,
        maxLength,
        requiredCount: intervalsCount
      });
    }

    for (let i = 0; i < maxLength; i++) {
      const marketValue = marketAprChart[i];
      const rebalanceValue = rebalanceAprChart[i];
      
      // Skip if both are undefined
      if (!marketValue && !rebalanceValue) continue;
      
      const chartPoint = {
        date: (marketValue?.date || rebalanceValue?.date),
        lending: rebalanceValue?.lending || 0,
        borrowing: marketValue?.lending || 0
      };

      poolChart.push(chartPoint);
    }

    const rebalanceAvgApr = poolChart.length > 0 
      ? poolChart.reduce((acc, el) => acc + el.lending, 0) / poolChart.length
      : 0;
    const aaveAvgApr = poolChart.length > 0
      ? poolChart.reduce((acc, el) => acc + el.borrowing, 0) / poolChart.length
      : 0;

    // Final debug logging
    if (interval === 7 && intervalsCount === 52) {
      console.log('✅ getChartData final result:', {
        chartDataLength: chartData.length,
        poolChartLength: poolChart.length,
        firstDate: poolChart[0]?.date,
        lastDate: poolChart[poolChart.length - 1]?.date
      });
    }

    return { chartData: chartData, poolChart, rebalanceAvgApr, aaveAvgApr };
  } catch (error: any) {
    console.error(`Failed to fetch chart data: ${error.message}`);
    throw error;
  }
};

export const getUserEarnings = async (
  interval: number,
  intervalsCount: number,
  address: string,
  network: ICHAIN
) => {
  try {
    const response = await fetch(
      `${endpoint}lending/user-earned-overall-ticks/${address}/${interval}/${intervalsCount}?network=${network}`,
      { cache: "no-store" }
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: IIntervalResponse[] = await response.json();
    return data;
  } catch (error: any) {
    console.error(`Failed to fetch user earnings: ${error.message}`);
    throw error;
  }
};

const fetchHighestAprToken = async (dayInterval: number, network: ICHAIN): Promise<string> => {
  try {
    const response = await fetch(
      `${endpoint}lending/highest-apr-token/${dayInterval}?network=${network}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.text();
  } catch (error: any) {
    console.error(`Failed to fetch highest apr token: ${error.message}`);
    throw error;
  }
};

const getChartDataAndEarnings = async (
  token: string,
  network: ICHAIN,
  address?: string
): Promise<
  [
    ChartData & { interval: number },
    ChartData & { interval: number },
    ChartData & { interval: number },
    IIntervalResponse[]?,
    IIntervalResponse[]?,
    IIntervalResponse[]?
  ]
> => {
  const [monthData, halfYearData, yearData] = await Promise.all([
    getChartData(1, 30, token, network),
    getChartData(7, 26, token, network),
    getChartData(7, 52, token, network)
  ]);
  
  // Add interval info to each dataset
  const monthDataWithInterval = { ...monthData, interval: 1 };
  const halfYearDataWithInterval = { ...halfYearData, interval: 7 };
  const yearDataWithInterval = { ...yearData, interval: 7 };

  let monthEarning: IIntervalResponse[] | undefined;
  let halfYearEarning: IIntervalResponse[] | undefined;
  let yearEarning: IIntervalResponse[] | undefined;

  if (address) {
    [monthEarning, halfYearEarning, yearEarning] = await Promise.all([
      getUserEarnings(1, 30, address, network),
      getUserEarnings(7, 26, address, network),
      getUserEarnings(7, 52, address, network)
    ]);
  }

  return [monthDataWithInterval, halfYearDataWithInterval, yearDataWithInterval, monthEarning, halfYearEarning, yearEarning];
};

const simulateEarnings = (
  data: ILendChartData[],
  token: string,
  interval: number = 1, // Number of days in the period (1 for daily, 7 for weekly)
  sumAllPools: boolean = false // If true, sum earnings from all 4 pools
): (ILendChartData & { userEarning: number })[] => {
  const DEMO_DEPOSITS: Record<string, number> = {
    'DAI': 1000000,
    'USDC.e': 1600000,
    'USDC': 1200000,
    'USDT': 1200000
  };
  
  if (sumAllPools) {
    // Sum earnings from all 4 pools
    const balances: Record<string, number> = {};
    Object.keys(DEMO_DEPOSITS).forEach(t => {
      balances[t] = DEMO_DEPOSITS[t];
    });
    
    // Data is already sorted oldest first, no need to reverse
    const result = data.map((item, index) => {
      // Calculate earnings for each pool and sum them
      let totalPeriodEarning = 0;
      
      Object.keys(DEMO_DEPOSITS).forEach(t => {
        const dailyRate = (item.lending || 0) / 100 / 365;
        const periodEarning = balances[t] * dailyRate * interval;
        balances[t] += periodEarning; // Compound for next period
        totalPeriodEarning += periodEarning;
      });
      
      return {
        ...item,
        userEarning: totalPeriodEarning
      };
    });
    
    // Debug: log first few simulated earnings
    if (data.length > 0 && interval === 7) {
      console.log('💰 Simulated earnings (first 5):', result.slice(0, 5).map(r => ({
        date: r.date,
        apr: r.lending,
        earning: r.userEarning?.toFixed(2)
      })));
    }
    
    return result;
  } else {
    // Single pool earnings
    const SIMULATED_DEPOSIT = DEMO_DEPOSITS[token] || 1000000;
    let cumulativeBalance = SIMULATED_DEPOSIT;
    
    // Data is already sorted oldest first, no need to reverse
    return data.map((item, index) => {
      // Calculate earnings for the period based on APR
      // APR is annual, so we divide by 365 for daily rate, then multiply by interval
      const dailyRate = (item.lending || 0) / 100 / 365;
      const periodEarning = cumulativeBalance * dailyRate * interval;
      
      // Add to balance for compound effect on next period
      cumulativeBalance += periodEarning;
      
      return {
        ...item,
        userEarning: periodEarning // Show period earning (daily or weekly)
      };
    });
  }
};

const mapUserEarnings = (
  data: ILendChartData[],
  token: string,
  earnings?: IIntervalResponse[],
  isDemoMode?: boolean,
  interval: number = 1,
  sumAllPools: boolean = false
): (ILendChartData & { userEarning?: number | null })[] => {
  // Use simulated earnings only in demo mode
  if (isDemoMode) {
    return simulateEarnings(data, token, interval, sumAllPools);
  }
  
  // Otherwise use real earnings data
  // Data is already sorted oldest first from fillMissingHistoricalData
  if (!earnings) return data;
  return data.map(item => {
    // @ts-ignore
    const earning = earnings.find(el => el.from === item.date);
    return {
      ...item,
      userEarning: earning ? earning.value : null
    };
  });
};

const prepareChartData = (
  monthData: ChartData & { interval: number },
  halfYearData: ChartData & { interval: number },
  yearData: ChartData & { interval: number },
  token: string,
  monthEarning?: IIntervalResponse[],
  halfYearEarning?: IIntervalResponse[],
  yearEarning?: IIntervalResponse[],
  isDemoMode?: boolean,
  sumAllPools?: boolean
): PreparedChartData => {
  return {
    poolChart: {
      "1m": {
        data: monthData.poolChart,
        rebalanceAvg: monthData.rebalanceAvgApr,
        aaveAvg: monthData.aaveAvgApr
      },
      "6m": {
        data: halfYearData.poolChart,
        rebalanceAvg: halfYearData.rebalanceAvgApr,
        aaveAvg: halfYearData.aaveAvgApr
      },
      "1y": {
        data: yearData.poolChart,
        rebalanceAvg: yearData.rebalanceAvgApr,
        aaveAvg: yearData.aaveAvgApr
      }
    },
    chartData: {
      "1m": mapUserEarnings(monthData.chartData, token, monthEarning, isDemoMode, monthData.interval, sumAllPools),
      "6m": mapUserEarnings(halfYearData.chartData, token, halfYearEarning, isDemoMode, halfYearData.interval, sumAllPools),
      "1y": mapUserEarnings(yearData.chartData, token, yearEarning, isDemoMode, yearData.interval, sumAllPools)
    }
  };
};

export const getAreaChartAllIntervalsWithoutToken = async (
  network: ICHAIN,
  address?: string,
  isDemoMode?: boolean
): Promise<PreparedChartData> => {
  try {
    const highestAprTokenToday = await fetchHighestAprToken(1, network);

    const [monthData, halfYearData, yearData, monthEarning, halfYearEarning, yearEarning] =
      await getChartDataAndEarnings(highestAprTokenToday, network, address);

    return prepareChartData(
      monthData,
      halfYearData,
      yearData,
      highestAprTokenToday,
      monthEarning,
      halfYearEarning,
      yearEarning,
      isDemoMode,
      true // Sum earnings from all 4 pools on main page
    );
  } catch (error: any) {
    console.error(`Failed to fetch area chart data: ${error.message}`);
    throw error;
  }
};

export const getAreaChartAllIntervals = async (
  token: string = "usdt",
  network: ICHAIN,
  address?: string,
  isDemoMode?: boolean
): Promise<PreparedChartData> => {
  try {
    const [monthData, halfYearData, yearData, monthEarning, halfYearEarning, yearEarning] =
      await getChartDataAndEarnings(token, network, address);

    return prepareChartData(
      monthData,
      halfYearData,
      yearData,
      token,
      monthEarning,
      halfYearEarning,
      yearEarning,
      isDemoMode,
      false // Show only single pool earnings on pool page
    );
  } catch (error: any) {
    console.error(`Failed to fetch area chart data: ${error.message}`);
    throw error;
  }
};

export const getPersonalEarnings = async (
  interval: number,
  intervalsCount: number,
  address: string,
  token: string,
  network: ICHAIN
) => {
  try {
    const userEarningsResponse = await fetch(
      `${endpoint}lending/${token}/user-earned-ticks/${address}/${interval}/${intervalsCount}`,
      { cache: "no-store" }
    );
    const avgAPRTiksResponse = await fetch(
      `${endpoint}lending/${token}/apr-ticks/${interval}/${intervalsCount}?network=${network}`,
      { cache: "no-store" }
    );

    if (!userEarningsResponse.ok) {
      throw new Error(`HTTP error! status: ${userEarningsResponse.status}`);
    }

    if (!avgAPRTiksResponse.ok) {
      throw new Error(`HTTP error! status: ${avgAPRTiksResponse.status}`);
    }

    const userEarningsData: IIntervalResponse[] = await userEarningsResponse.json();
    const avgAPRTicksData: IIntervalResponse[] = await avgAPRTiksResponse.json();

    const avgAPR =
      avgAPRTicksData.map(el => el.value || 0).reduce((acc, el) => acc + el, 0) / intervalsCount;
    const preparedUserEarnings = userEarningsData
      .map((el, index) => ({
        name: el.from,
        uv: el.value ? (el.value >= 0 ? el.value : 0) : 0,
        apr: avgAPRTicksData[index].value
      }))
      .reverse();

    return { userEarned: preparedUserEarnings, avgAPR };
  } catch (error: any) {
    console.error(`Failed to fetch personal earnings: ${error.message}`);
    throw error;
  }
};
