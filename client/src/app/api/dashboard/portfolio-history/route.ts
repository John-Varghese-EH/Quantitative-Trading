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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get('days') || '30', 10);
  
  try {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - (days + 10)); // Extra days for weekends
    
    const result = await yahooFinance.chart('SPY', {
      period1: start,
      period2: end,
      interval: '1d'
    });
    
    const validQuotes = (result.quotes || []).filter((q: any) => q.close !== null && q.date);
    const spy = validQuotes.slice(-days);
    const initial = 10000.0;
    const history = [];
    
    if (spy.length > 0) {
      const basePrice = spy[0].close!;
      for (const row of spy) {
        if (row.close) {
          const ratio = row.close / basePrice;
          history.push({
            date: row.date.toISOString().split('T')[0],
            value: Number((initial * ratio).toFixed(2))
          });
        }
      }
    }
    
    return NextResponse.json(
      { history, initial, current: history.length > 0 ? history[history.length - 1].value : initial },
      { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' } }
    );
  } catch (error) {
    console.error('Portfolio history error:', error);
    // Fallback to flat history
    const history = [];
    for (let i = days; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      history.push({
        date: d.toISOString().split('T')[0],
        value: 10000.0
      });
    }
    return NextResponse.json({ history, initial: 10000, current: 10000 });
  }
}
