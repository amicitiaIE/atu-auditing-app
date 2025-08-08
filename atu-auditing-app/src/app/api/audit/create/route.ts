import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/database';

/**
 * POST /api/audit/create
 * 
 * Creates a new main audit record
 * Returns the audit ID for use with waste audit forms
 * 
 * Request body:
 * - centre_name: string
 * - audit_date: string (YYYY-MM-DD)
 * - auditor_name: string
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.centre_name || !body.audit_date || !body.auditor_name) {
      return NextResponse.json(
        { error: 'All fields (centre_name, audit_date, auditor_name) are required' },
        { status: 400 }
      );
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(body.audit_date)) {
      return NextResponse.json(
        { error: 'audit_date must be in YYYY-MM-DD format' },
        { status: 400 }
      );
    }

    // Insert the new audit
    const stmt = db.prepare(`
      INSERT INTO audits (centre_name, audit_date, auditor_name)
      VALUES (?, ?, ?)
    `);

    const result = stmt.run(body.centre_name, body.audit_date, body.auditor_name);
    
    if (!result.lastInsertRowid) {
      return NextResponse.json(
        { error: 'Failed to create audit record' },
        { status: 500 }
      );
    }

    const auditId = result.lastInsertRowid as number;

    return NextResponse.json(
      {
        success: true,
        auditId: auditId,
        centreName: body.centre_name,
        auditDate: body.audit_date,
        auditorName: body.auditor_name,
        createdAt: new Date().toISOString()
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating audit:', error);
    
    return NextResponse.json(
      { error: 'Internal server error occurred while creating audit' },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS /api/audit/create
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