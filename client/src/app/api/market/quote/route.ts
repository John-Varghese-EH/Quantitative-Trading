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

import { NextRequest, NextResponse } from 'next/server';
import yahooFinance from '@/lib/yahoo-finance';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const symbol = searchParams.get('symbol');

  if (!symbol) {
    return NextResponse.json({ error: "Missing symbol parameter" }, { status: 400 });
  }

  try {
    const q: any = await yahooFinance.quote(symbol);
    const mapped = {
      symbol: q.symbol,
      price: q.regularMarketPrice,
      change: q.regularMarketChange,
      change_pct: q.regularMarketChangePercent,
      volume: q.regularMarketVolume,
      high: q.regularMarketDayHigh,
      low: q.regularMarketDayLow,
      name: q.shortName || q.longName || q.symbol
    };
    return NextResponse.json(mapped, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' // Cache for 1 minute
      }
    });
  } catch (error: any) {
    console.error("Quote error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
