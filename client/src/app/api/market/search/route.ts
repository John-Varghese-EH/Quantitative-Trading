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
  const q = searchParams.get('q');

  if (!q) {
    return NextResponse.json({ error: "Missing q parameter" }, { status: 400 });
  }

  try {
    const result: any = await yahooFinance.search(q);
    
    // Format to match the old backend structure expected by frontend
    const formatted = result.quotes.map((item: any) => ({
      symbol: item.symbol,
      shortname: item.shortname,
      longname: item.longname,
      exchange: item.exchange,
      typeDisp: item.typeDisp
    }));

    return NextResponse.json({ results: formatted }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' // Cache for 1 hour
      }
    });
  } catch (error: any) {
    console.error("Search error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
