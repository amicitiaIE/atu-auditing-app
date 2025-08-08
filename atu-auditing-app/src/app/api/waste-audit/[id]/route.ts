import { NextRequest, NextResponse } from 'next/server';
import { getWasteAudit, deleteWasteAudit } from '@/lib/database';

/**
 * GET /api/waste-audit/[id]
 * 
 * Retrieves a complete waste audit by audit ID
 * Returns the full WasteAuditData object or 404 if not found
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auditId = parseInt(params.id);
    
    if (isNaN(auditId)) {
      return NextResponse.json(
        { error: 'Invalid audit ID format' },
        { status: 400 }
      );
    }

    const wasteAudit = await getWasteAudit(auditId);
    
    if (!wasteAudit) {
      return NextResponse.json(
        { error: 'Waste audit not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(wasteAudit, { status: 200 });

  } catch (error) {
    console.error('Error retrieving waste audit:', error);
    
    return NextResponse.json(
      { error: 'Internal server error occurred while retrieving audit' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/waste-audit/[id]
 * 
 * Deletes a waste audit and all associated data
 * Cascading delete removes all related records
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auditId = parseInt(params.id);
    
    if (isNaN(auditId)) {
      return NextResponse.json(
        { error: 'Invalid audit ID format' },
        { status: 400 }
      );
    }

    // Check if waste audit exists before attempting to delete
    const existingAudit = await getWasteAudit(auditId);
    if (!existingAudit) {
      return NextResponse.json(
        { error: 'Waste audit not found' },
        { status: 404 }
      );
    }

    const deleteResult = await deleteWasteAudit(auditId);
    
    if (!deleteResult) {
      return NextResponse.json(
        { error: 'Failed to delete waste audit' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Waste audit deleted successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error deleting waste audit:', error);
    
    return NextResponse.json(
      { error: 'Internal server error occurred while deleting audit' },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS /api/waste-audit/[id]
 * 
 * Handle preflight requests for CORS
 */
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, { 
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}