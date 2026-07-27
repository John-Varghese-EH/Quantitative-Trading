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

export const dynamic = 'force-dynamic';

export async function GET() {
  const sectorEtfs = [
    { name: "Technology", ticker: "XLK", symbols: ["AAPL", "MSFT", "NVDA"] },
    { name: "Healthcare", ticker: "XLV", symbols: ["JNJ", "PFE", "UNH"] },
    { name: "Finance", ticker: "XLF", symbols: ["JPM", "BAC", "GS"] },
    { name: "Energy", ticker: "XLE", symbols: ["XOM", "CVX", "BP"] },
    { name: "Consumer", ticker: "XLY", symbols: ["AMZN", "TSLA", "NKE"] },
    { name: "Industrials", ticker: "XLI", symbols: ["BA", "CAT", "GE"] },
    { name: "Real Estate", ticker: "XLRE", symbols: ["AMT", "PLD", "SPG"] },
    { name: "Crypto", ticker: "BTC-USD", symbols: ["BTC-USD", "ETH-USD"] }
  ];

  try {
    const sectors = await Promise.all(
      sectorEtfs.map(async (sector) => {
        try {
          const quotes = await yahooFinance.quote(sector.ticker);
          const changePct = quotes.regularMarketChangePercent || 0;
          return {
            sector: sector.name,
            change: Number(changePct.toFixed(2)),
            symbols: sector.symbols
          };
        } catch {
          return {
            sector: sector.name,
            change: 0.0,
            symbols: sector.symbols
          };
        }
      })
    );

    return NextResponse.json(
      { sectors },
      { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } }
    );
  } catch (error) {
    console.error('Heatmap error:', error);
    return NextResponse.json({ sectors: [] }, { status: 500 });
  }
}
