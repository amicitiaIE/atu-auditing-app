import { NextRequest, NextResponse } from 'next/server';
import { updateWasteAudit } from '@/lib/database';
import { SaveWasteAuditRequest } from '@/types/waste';

/**
 * POST /api/waste-audit/autosave
 * 
 * Auto-saves partial waste audit data without validation
 * Designed for frequent background saves to prevent data loss
 * More lenient than the main save endpoint
 * 
 * Request body:
 * - auditId: number - The main audit ID to associate with
 * - wasteAuditData: Partial<WasteAuditData> - The waste audit data to save
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as SaveWasteAuditRequest;
    
    // Validate required fields
    if (!body.auditId) {
      return NextResponse.json(
        { success: false, error: 'Audit ID is required' },
        { status: 400 }
      );
    }

    if (!body.wasteAuditData) {
      return NextResponse.json(
        { success: false, error: 'Waste audit data is required' },
        { status: 400 }
      );
    }

    // Update sync status for auto-save
    const dataToSave = {
      ...body.wasteAuditData,
      syncStatus: 'pending' as const,
      lastSaved: new Date().toISOString()
    };

    // Perform the partial update
    const updateResult = await updateWasteAudit(body.auditId, dataToSave);
    
    if (!updateResult) {
      return NextResponse.json(
        { success: false, error: 'Failed to auto-save waste audit data' },
        { status: 500 }
      );
    }

    // Return minimal success response for auto-save
    return NextResponse.json(
      { 
        success: true,
        timestamp: new Date().toISOString(),
        message: 'Auto-save completed'
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error in waste audit auto-save API:', error);
    
    // For auto-save, we don't want to show errors to the user
    // Log them but return success to prevent UI disruption
    return NextResponse.json(
      { 
        success: false,
        error: 'Auto-save failed, data stored locally'
      },
      { status: 200 } // Return 200 to avoid error states in UI
    );
  }
}

/**
 * OPTIONS /api/waste-audit/autosave
 * 
 * Handle preflight requests for CORS
 */
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, { 
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}