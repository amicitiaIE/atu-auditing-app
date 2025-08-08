import { NextRequest, NextResponse } from 'next/server';
import { getWasteAuditsByCenter, getAllWasteAudits, getWasteAuditStats } from '@/lib/database';

/**
 * GET /api/waste-audit/list
 * 
 * Lists waste audits with optional filtering
 * Query parameters:
 * - center?: string - Filter by center name
 * - stats?: boolean - Include statistics summary
 * 
 * Returns array of WasteAuditSummary objects
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const centerName = searchParams.get('center');
    const includeStats = searchParams.get('stats') === 'true';

    let audits;
    let stats;

    // Get audits based on filter
    if (centerName) {
      audits = await getWasteAuditsByCenter(centerName);
    } else {
      audits = await getAllWasteAudits();
    }

    // Get statistics if requested
    if (includeStats) {
      stats = await getWasteAuditStats();
    }

    const response = {
      audits,
      stats,
      total: audits.length,
      filters: {
        center: centerName
      },
      retrievedAt: new Date().toISOString()
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Error listing waste audits:', error);
    
    return NextResponse.json(
      { error: 'Failed to retrieve waste audit list' },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS /api/waste-audit/list
 */
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, { 
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}