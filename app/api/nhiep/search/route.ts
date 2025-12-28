import {NextRequest, NextResponse} from 'next/server';
import {getNhiepOperations} from '@/lib/db/operations';

export async function GET(request: NextRequest) {
  const {searchParams} = new URL(request.url);
  const query = (searchParams.get('q') || '').trim();
  const limit = Math.min(parseInt(searchParams.get('limit') || '30'), 100);

  if (!query) {
    return NextResponse.json(
      {error: 'Query parameter is required'},
      {status: 400},
    );
  }

  try {
    const ops = getNhiepOperations();
    const results = ops.search(query, limit);
    return NextResponse.json({
      success: true,
      query,
      count: results.length,
      results,
    });
  } catch (error) {
    console.error('Nhiep search error', error);
    return NextResponse.json({error: 'Internal server error'}, {status: 500});
  }
}
