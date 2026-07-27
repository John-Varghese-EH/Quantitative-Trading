/**
 * QuantAdv - Quantitative Trading Platform
 * Copyright (C) 2026 John Varghese (J0X)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import { NextResponse } from 'next/server';
import yahooFinance from '@/lib/yahoo-finance';

// List of popular symbols for the ticker
const TICKER_SYMBOLS = ["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "META", "TSLA", "BTC-USD", "ETH-USD"];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbolsParam = searchParams.get('symbols');
    
    let symbolsToFetch = TICKER_SYMBOLS;
    if (symbolsParam) {
      symbolsToFetch = symbolsParam.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
      // Fallback if empty array after split
      if (symbolsToFetch.length === 0) symbolsToFetch = TICKER_SYMBOLS;
    }

    const results = await Promise.allSettled(
      symbolsToFetch.map(symbol => yahooFinance.quote(symbol))
    );
    
    const prices = results
      .filter((result: any) => result.status === 'fulfilled')
      .map((result: any) => {
        const change_pct = result.value.regularMarketChangePercent;
        return {
          symbol: result.value.symbol,
          price: result.value.regularMarketPrice,
          change: result.value.regularMarketChange,
          change_pct: change_pct != null ? parseFloat(change_pct.toFixed(2)) : 0,
          positive: change_pct != null && change_pct >= 0
        };
      })
      .filter(p => p.price != null);

    return NextResponse.json({ prices }, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=59'
      }
    });
  } catch (error) {
    console.error("Live prices error:", error);
    return NextResponse.json({ prices: [] }, { status: 500 });
  }
}
