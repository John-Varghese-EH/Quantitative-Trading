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

export const dynamic = 'force-dynamic';

export async function GET() {
  // Currently mocked to remove Python backend dependency.
  // In the future, this can be hydrated by querying Firebase Admin SDK directly from Next.js.
  return NextResponse.json(
    {
      portfolio_value: 10000.00,
      daily_pnl: 0,
      daily_pnl_pct: 0,
      ai_confidence: 85.5,
      model_accuracy: 82.0,
      risk_score: 45.2,
      open_positions: 0,
      total_trades: 0,
      win_rate: 0,
      total_models: 0,
      ready_models: 0,
      total_attacks: 0,
      best_strategy_return: 0
    },
    { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' } }
  );
}
