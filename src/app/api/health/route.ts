import { NextResponse } from 'next/server';

/**
 * GET /api/health
 * Lightweight health-check endpoint used by the loading screen (waking-up.html)
 * to detect when the server has fully started after a cold start.
 */
export async function GET() {
  return NextResponse.json({ status: 'ok' }, { status: 200 });
}
