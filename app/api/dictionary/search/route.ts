import {NextRequest, NextResponse} from 'next/server';
import {getDictionaryOperations} from '@/lib/db/operations';

export async function GET(request: NextRequest) {
  try {
    const {searchParams} = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);

    if (!query || query.length < 1) {
      return NextResponse.json(
        {error: 'Query parameter is required'},
        {status: 400},
      );
    }

    const ops = getDictionaryOperations();
    const results = ops.searchWords(query, limit);

    return NextResponse.json({
      success: true,
      query,
      count: results.length,
      results,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({error: 'Internal server error'}, {status: 500});
  }
}
