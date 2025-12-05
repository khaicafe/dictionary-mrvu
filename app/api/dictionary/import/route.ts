import {NextRequest, NextResponse} from 'next/server';
import {getDictionaryOperations, Word} from '@/lib/db/operations';
import * as XLSX from 'xlsx';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const replaceMode = formData.get('replace') === 'true';

    if (!file) {
      return NextResponse.json({error: 'No file provided'}, {status: 400});
    }

    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
      return NextResponse.json(
        {error: 'Only .xlsx, .xls, or .csv files are allowed'},
        {status: 400},
      );
    }

    // Read file buffer
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer);
    const firstSheet = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheet];

    // Parse data - read with headers
    const rawData = XLSX.utils.sheet_to_json(worksheet) as any[];

    if (rawData.length === 0) {
      return NextResponse.json({error: 'Excel file is empty'}, {status: 400});
    }

    // Debug: log first row to see column names
    console.log('📋 First row columns:', Object.keys(rawData[0]));
    console.log('📋 First row data:', rawData[0]);

    // Map Excel columns to Word interface
    // The sheet_to_json will use header row to map columns
    const words: Word[] = rawData
      .map((row: any, idx: number) => {
        // Try to find the correct columns - be flexible with naming
        // Search by finding key that contains the text (case-insensitive)
        const findColumn = (possibleNames: string[]): string => {
          const key = Object.keys(row).find((k) =>
            possibleNames.some(
              (name) =>
                k.toLowerCase().includes(name.toLowerCase()) ||
                name.toLowerCase().includes(k.toLowerCase()),
            ),
          );
          return key ? (row[key] || '').toString().trim() : '';
        };

        const original =
          row.original || row['original']?.toString().trim() || '';

        const ndict = findColumn(['Ndict', 'ndict', 'NDICT']);

        const tdict = findColumn([
          'Tdict',
          'tdict',
          'TDICT',
          'Tổng hợp',
          'tổng hợp',
        ]);

        const phat_hc = findColumn([
          'Phát học',
          'phát học',
          'Phát âm',
          'phát âm',
          'phat_hc',
        ]);

        const mapped = {
          original: original.toString().trim(),
          ndict: ndict,
          tdict: tdict,
          phat_hc: phat_hc,
          full_data: JSON.stringify(row),
        };

        // Log first 3 rows to debug
        if (idx < 3) {
          console.log(`📍 Row ${idx + 1}:`, {
            original: mapped.original,
            ndict: mapped.ndict,
            tdict: mapped.tdict,
            phat_hc: mapped.phat_hc,
          });
        }

        return mapped;
      })
      .filter((w) => w.original); // Filter out empty words

    if (words.length === 0) {
      return NextResponse.json(
        {error: 'No valid words found in Excel file'},
        {status: 400},
      );
    }

    // Import to database
    const ops = getDictionaryOperations();
    const result = ops.importWords(words, replaceMode);

    return NextResponse.json({
      success: true,
      message: `Import successful. Added: ${result.added}, Updated: ${result.updated}`,
      stats: {
        added: result.added,
        updated: result.updated,
        total: result.added + result.updated,
      },
    });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      {
        error:
          'Import failed: ' +
          (error instanceof Error ? error.message : 'Unknown error'),
      },
      {status: 500},
    );
  }
}

// GET endpoint để check status import
export async function GET(request: NextRequest) {
  try {
    const ops = getDictionaryOperations();
    const stats = ops.getStats();

    return NextResponse.json({
      success: true,
      message: 'Import API ready',
      currentStats: stats,
    });
  } catch (error) {
    console.error('Status error:', error);
    return NextResponse.json({error: 'Failed to get status'}, {status: 500});
  }
}
