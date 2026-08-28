import { NextResponse } from 'next/server';
import { appendSessionCookies, HabiDataError, readState } from '../../../lib/habi-data';

export async function GET(request: Request) {
  try {
    const result = await readState(request);
    const response = NextResponse.json(result.state, { headers: { 'Cache-Control': 'no-store' } });
    return appendSessionCookies(response, result.cookies);
  } catch (error) {
    const status = error instanceof HabiDataError ? error.status : 500;
    return NextResponse.json({ error: error instanceof HabiDataError ? error.message : '读取花园数据失败。' }, { status, headers: { 'Cache-Control': 'no-store' } });
  }
}
