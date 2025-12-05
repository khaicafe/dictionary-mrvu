import {NextRequest, NextResponse} from 'next/server';
import {getDictionaryOperations} from '@/lib/db/operations';

export async function GET(request: NextRequest) {
  try {
    const ops = getDictionaryOperations();
    const stats = ops.getStats();

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json({error: 'Internal server error'}, {status: 500});
  }
}
