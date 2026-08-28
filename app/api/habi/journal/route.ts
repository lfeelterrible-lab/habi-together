import { NextResponse } from 'next/server';
import { appendSessionCookies, createJournal, HabiDataError } from '../../../lib/habi-data';

export async function POST(request: Request) {
  try {
    const result = await createJournal(request);
    const response = NextResponse.json(result.state, { headers: { 'Cache-Control': 'no-store' } });
    return appendSessionCookies(response, result.cookies);
  } catch (error) {
    const status = error instanceof HabiDataError ? error.status : 500;
    return NextResponse.json({ error: error instanceof HabiDataError ? error.message : '保存日记失败。' }, { status });
  }
}
