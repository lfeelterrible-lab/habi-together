import { NextResponse } from 'next/server';
import { appendSessionCookies, HabiDataError, joinRoom } from '../../../lib/habi-data';

export async function POST(request: Request) {
  try {
    const result = await joinRoom(request);
    const response = NextResponse.json(result.state, { headers: { 'Cache-Control': 'no-store' } });
    return appendSessionCookies(response, result.cookies);
  } catch (error) {
    const status = error instanceof HabiDataError ? error.status : 500;
    return NextResponse.json({ error: error instanceof HabiDataError ? error.message : '加入花园失败。' }, { status });
  }
}
