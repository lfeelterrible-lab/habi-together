import { NextResponse } from 'next/server';
import { appendSessionCookies, HabiDataError, readState } from '../../../lib/habi-data';
import { optionsResponse, withCors } from '../cors';

export async function GET(request: Request) {
  try {
    const result = await readState(request);
    const response = NextResponse.json(result.state, { headers: { 'Cache-Control': 'no-store' } });
    return withCors(appendSessionCookies(response, result.cookies), request);
  } catch (error) {
    const status = error instanceof HabiDataError ? error.status : 500;
    return withCors(NextResponse.json({ error: error instanceof HabiDataError ? error.message : '读取花园数据失败。' }, { status, headers: { 'Cache-Control': 'no-store' } }), request);
  }
}

export function OPTIONS(request: Request) {
  return optionsResponse(request);
}
