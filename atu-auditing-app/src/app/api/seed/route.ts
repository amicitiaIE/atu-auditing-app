import { NextRequest, NextResponse } from 'next/server';
import { seedDatabase, clearDatabase, resetDatabase } from '@/lib/seedData';

/**
 * POST /api/seed
 * 
 * Seeds the database with sample data for testing
 * Query parameters:
 * - action: 'seed' | 'clear' | 'reset' (default: 'seed')
 */
export async function POST(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action') || 'seed';

    let result = false;
    let message = '';

    switch (action) {
      case 'seed':
        result = await seedDatabase();
        message = result ? 'Database seeded successfully' : 'Failed to seed database';
        break;
      
      case 'clear':
        result = await clearDatabase();
        message = result ? 'Database cleared successfully' : 'Failed to clear database';
        break;
      
      case 'reset':
        result = await resetDatabase();
        message = result ? 'Database reset and seeded successfully' : 'Failed to reset database';
        break;
      
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: seed, clear, or reset' },
          { status: 400 }
        );
    }

    if (result) {
      return NextResponse.json(
        { success: true, message, action },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { success: false, message, action },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error in seed API:', error);
    
    return NextResponse.json(
      { error: 'Internal server error during database seeding' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/seed
 * 
 * Returns information about available seeding operations
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Database seeding API',
    availableActions: [
      {
        action: 'seed',
        description: 'Add sample data to the database',
        method: 'POST /api/seed?action=seed'
      },
      {
        action: 'clear',
        description: 'Remove all data from the database',
        method: 'POST /api/seed?action=clear'
      },
      {
        action: 'reset',
        description: 'Clear and re-seed the database',
        method: 'POST /api/seed?action=reset'
      }
    ],
    note: 'Only use in development environment'
  });
}

/**
 * OPTIONS /api/seed
 */
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, { 
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}