import { NextRequest, NextResponse } from 'next/server';
import { saveWasteAudit, updateWasteAudit } from '@/lib/database';
import { SaveWasteAuditRequest, SaveWasteAuditResponse } from '@/types/waste';

/**
 * POST /api/waste-audit/save
 * 
 * Saves or updates a waste audit with validation
 * Handles both complete saves and partial updates
 * 
 * Request body:
 * - auditId: number - The main audit ID to associate with
 * - wasteAuditData: Partial<WasteAuditData> - The waste audit data to save
 * - isAutoSave?: boolean - Whether this is an auto-save operation
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as SaveWasteAuditRequest;
    
    // Validate required fields
    if (!body.auditId) {
      return NextResponse.json(
        { 
          success: false, 
          validationErrors: ['Audit ID is required'] 
        } satisfies SaveWasteAuditResponse,
        { status: 400 }
      );
    }

    if (!body.wasteAuditData) {
      return NextResponse.json(
        { 
          success: false, 
          validationErrors: ['Waste audit data is required'] 
        } satisfies SaveWasteAuditResponse,
        { status: 400 }
      );
    }

    // Perform basic validation on the waste audit data
    const validationErrors: string[] = [];
    
    // Check if facility infrastructure has bins when required
    if (body.wasteAuditData.facilityInfrastructure) {
      const infrastructure = body.wasteAuditData.facilityInfrastructure;
      if (infrastructure.binInventory && infrastructure.binInventory.length === 0 && !body.isAutoSave) {
        validationErrors.push('At least one bin must be documented in facility infrastructure');
      }
    }

    // Validate waste streams if present
    if (body.wasteAuditData.wasteStreamsAssessment) {
      const assessment = body.wasteAuditData.wasteStreamsAssessment;
      if (assessment.assessments) {
        assessment.assessments.forEach((stream, index) => {
          if (stream.estimatedWeeklyVolumeLitres < 0) {
            validationErrors.push(`Waste stream ${index + 1}: Volume cannot be negative`);
          }
          if (stream.contaminationLevel < 1 || stream.contaminationLevel > 5) {
            validationErrors.push(`Waste stream ${index + 1}: Contamination level must be between 1 and 5`);
          }
          if (stream.annualCostEuros && stream.annualCostEuros < 0) {
            validationErrors.push(`Waste stream ${index + 1}: Annual cost cannot be negative`);
          }
        });
      }
    }

    // Validate organic waste data
    if (body.wasteAuditData.organicWasteComposting) {
      const organic = body.wasteAuditData.organicWasteComposting;
      if (organic.foodWasteVolumeKgPerWeek && organic.foodWasteVolumeKgPerWeek < 0) {
        validationErrors.push('Food waste volume cannot be negative');
      }
      if (organic.compostingCapacityLitres && organic.compostingCapacityLitres < 0) {
        validationErrors.push('Composting capacity cannot be negative');
      }
    }

    // Return validation errors if any (unless auto-save)
    if (validationErrors.length > 0 && !body.isAutoSave) {
      return NextResponse.json(
        { 
          success: false, 
          validationErrors 
        } satisfies SaveWasteAuditResponse,
        { status: 400 }
      );
    }

    // Update sync status
    const dataToSave = {
      ...body.wasteAuditData,
      syncStatus: 'synced' as const,
      lastSaved: new Date().toISOString()
    };

    // Save the waste audit data
    const saveResult = await saveWasteAudit(body.auditId, dataToSave);
    
    if (!saveResult.success) {
      return NextResponse.json(saveResult, { status: 500 });
    }

    // Return success response
    const response: SaveWasteAuditResponse = {
      success: true,
      wasteAuditId: body.auditId,
      validationErrors: validationErrors.length > 0 ? validationErrors : undefined
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Error in waste audit save API:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        validationErrors: ['Internal server error occurred while saving audit'] 
      } satisfies SaveWasteAuditResponse,
      { status: 500 }
    );
  }
}

/**
 * OPTIONS /api/waste-audit/save
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