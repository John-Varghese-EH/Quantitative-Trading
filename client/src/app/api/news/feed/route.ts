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
  try {
    const result = await yahooFinance.search('SPY', { newsCount: 8 });
    const articles = result.news.map((item: any) => ({
      title: item.title,
      link: item.link,
      publisher: item.publisher,
      publishedAt: item.providerPublishTime 
        ? new Date(item.providerPublishTime * 1000).toISOString()
        : new Date().toISOString()
    }));

    return NextResponse.json(
      { articles },
      { headers: { 'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=3600' } }
    );
  } catch (error) {
    console.error('News error:', error);
    return NextResponse.json({ articles: [] }, { status: 500 });
  }
}
