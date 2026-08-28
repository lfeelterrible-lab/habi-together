import { NextResponse } from 'next/server';
import { appendSessionCookies, HabiDataError, joinRoom } from '../../../lib/habi-data';
import { optionsResponse, withCors } from '../cors';

export async function POST(request: Request) {
  try {
    const result = await joinRoom(request);
    const response = NextResponse.json(result.state, { headers: { 'Cache-Control': 'no-store' } });
    return withCors(appendSessionCookies(response, result.cookies), request);
  } catch (error) {
    const status = error instanceof HabiDataError ? error.status : 500;
    return withCors(NextResponse.json({ error: error instanceof HabiDataError ? error.message : '加入花园失败。' }, { status }), request);
  }
}

export function OPTIONS(request: Request) {
  return optionsResponse(request);
}
