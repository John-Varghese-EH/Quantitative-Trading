import { NextResponse } from 'next/server';
import yahooFinance from '@/lib/yahoo-finance';

// Helper for Exponential Moving Average
function calcEMA(data: number[], period: number): number[] {
  const k = 2 / (period + 1);
  let ema = data[0];
  const res = [ema];
  for (let i = 1; i < data.length; i++) {
    ema = data[i] * k + ema * (1 - k);
    res.push(ema);
  }
  return res;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol') || 'AAPL';
  const interval = searchParams.get('interval') || '1d';
  const startParam = searchParams.get('start');
  const endParam = searchParams.get('end');

  // Determine if this is an intraday interval
  const isIntraday = ['1m', '2m', '5m', '15m', '30m', '60m', '90m', '1h'].includes(interval);

  try {
    // Use the start/end params if provided, otherwise default based on interval
    let period1: Date;
    let period2: Date | undefined;

    if (startParam) {
      period1 = new Date(startParam);
    } else {
      period1 = new Date();
      if (isIntraday) {
        period1.setDate(period1.getDate() - 7);
      } else {
        period1.setFullYear(period1.getFullYear() - 1);
      }
    }

    if (endParam) {
      period2 = new Date(endParam);
    }

    const chartOptions: any = {
      period1,
      interval: interval as any,
    };
    if (period2) chartOptions.period2 = period2;

    const result: any = await yahooFinance.chart(symbol, chartOptions);

    const validQuotes = (result.quotes || []).filter(
      (bar: any) => bar.date && bar.close !== null && bar.open !== null && bar.high !== null && bar.low !== null
    );

    const closes = validQuotes.map((q: any) => q.close!);
    
    // Compute MACD (12, 26, 9)
    let macd: (number | null)[] = closes.map(() => null);
    let macd_signal: (number | null)[] = closes.map(() => null);
    let macd_hist: (number | null)[] = closes.map(() => null);
    if (closes.length >= 26) {
      const ema12 = calcEMA(closes, 12);
      const ema26 = calcEMA(closes, 26);
      const macdLine = ema12.map((v: number, i: number) => v - ema26[i]);
      const signalLine = calcEMA(macdLine, 9);
      macd = macdLine;
      macd_signal = signalLine;
      macd_hist = macdLine.map((v: number, i: number) => v - signalLine[i]);
    }

    // Compute RSI 14
    let rsi: (number | null)[] = closes.map(() => null);
    if (closes.length > 14) {
      let avgGain = 0, avgLoss = 0;
      for (let i = 1; i <= 14; i++) {
        const diff = closes[i] - closes[i - 1];
        if (diff > 0) avgGain += diff;
        else avgLoss += Math.abs(diff);
      }
      avgGain /= 14;
      avgLoss /= 14;
      rsi[14] = avgLoss === 0 ? 100 : 100 - (100 / (1 + avgGain / avgLoss));
      
      for (let i = 15; i < closes.length; i++) {
        const diff = closes[i] - closes[i - 1];
        const gain = diff > 0 ? diff : 0;
        const loss = diff < 0 ? Math.abs(diff) : 0;
        avgGain = (avgGain * 13 + gain) / 14;
        avgLoss = (avgLoss * 13 + loss) / 14;
        rsi[i] = avgLoss === 0 ? 100 : 100 - (100 / (1 + avgGain / avgLoss));
      }
    }

    // Compute MA20, MA50
    const formattedData = validQuotes.map((bar: any, i: number) => {
      // For intraday, keep full ISO string so frontend can derive UNIX timestamps.
      // For daily, use YYYY-MM-DD.
      const dateStr = isIntraday
        ? bar.date.toISOString()
        : bar.date.toISOString().split('T')[0];
      
      let ma_20 = null;
      if (i >= 19) {
        ma_20 = closes.slice(i - 19, i + 1).reduce((a: number, b: number) => a + b, 0) / 20;
      }
      
      let ma_50 = null;
      if (i >= 49) {
        ma_50 = closes.slice(i - 49, i + 1).reduce((a: number, b: number) => a + b, 0) / 50;
      }

      return {
        time: dateStr,
        date: dateStr,
        open: bar.open,
        high: bar.high,
        low: bar.low,
        close: bar.close,
        volume: bar.volume,
        ma_20,
        ma_50,
        rsi: rsi[i],
        macd: macd[i],
        macd_signal: macd_signal[i],
        macd_hist: macd_hist[i],
      };
    });

    return NextResponse.json({
      symbol,
      interval,
      count: formattedData.length,
      data: formattedData
    }, {
      headers: {
        'Cache-Control': isIntraday
          ? 'public, s-maxage=60, stale-while-revalidate=120'
          : 'public, s-maxage=900, stale-while-revalidate=1800'
      }
    });
  } catch (error: any) {
    console.error("OHLCV error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
