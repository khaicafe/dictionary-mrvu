import {NextRequest, NextResponse} from 'next/server';
import * as XLSX from 'xlsx';
import {getNhiepOperations, NhiepEntry} from '@/lib/db/operations';

function findColumn(row: Record<string, any>, names: string[]): string {
  const key = Object.keys(row).find((k) =>
    names.some(
      (name) =>
        k.toLowerCase().includes(name.toLowerCase()) ||
        name.toLowerCase().includes(k.toLowerCase()),
    ),
  );
  return key ? (row[key] ?? '').toString().trim() : '';
}

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

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer);
    const firstSheet = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheet];
    const rawData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);

    if (rawData.length === 0) {
      return NextResponse.json({error: 'Excel file is empty'}, {status: 400});
    }

    const entries: NhiepEntry[] = rawData
      .map((row, idx) => {
        const phap = findColumn(row, ['Pháp', 'phap', 'A', 'Phap']);
        const tang = findColumn(row, ['Tạng', 'tang', 'B', 'Tạng ngữ']);
        const tanh_tuong = findColumn(row, ['Tánh tướng', 'tanh tuong', 'C']);
        const phan_loai = findColumn(row, ['phân loại', 'phan loai', 'D']);

        if (idx < 3) {
          console.log('Nhiep row preview', {phap, tang, tanh_tuong, phan_loai});
        }

        if (!phap && !tang) return null;

        return {
          phap: phap || tang, // fallback to tang if missing
          tang: tang || phap,
          tanh_tuong,
          phan_loai,
          full_data: JSON.stringify(row),
        } as NhiepEntry;
      })
      .filter((e): e is NhiepEntry => !!e && !!e.phap);

    if (entries.length === 0) {
      return NextResponse.json(
        {error: 'No valid rows found (missing Pháp/Tạng)'},
        {status: 400},
      );
    }

    const ops = getNhiepOperations();
    const result = ops.import(entries, replaceMode);

    return NextResponse.json({
      success: true,
      message: `Import nhiếp thành công. Thêm: ${result.added}, Cập nhật: ${result.updated}`,
      stats: {...result, total: result.added + result.updated},
    });
  } catch (error) {
    console.error('Nhiep import error', error);
    return NextResponse.json(
      {
        error:
          'Import nhiếp failed: ' +
          (error instanceof Error ? error.message : 'Unknown error'),
      },
      {status: 500},
    );
  }
}

export async function GET() {
  try {
    const ops = getNhiepOperations();
    const stats = ops.stats();
    return NextResponse.json({success: true, stats});
  } catch (error) {
    return NextResponse.json({error: 'Failed to load stats'}, {status: 500});
  }
}
