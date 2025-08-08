// Database initialization and schema setup for the Community Audit App
// This module uses better-sqlite3 for local SQLite database management

import Database from 'better-sqlite3';
import path from 'path';

// Initialize the database connection
// The database file (audit.db) is stored in the project root directory
const dbPath = path.join(process.cwd(), 'audit.db');
const db = new Database(dbPath);

// Enable foreign key constraints for data integrity
db.pragma('foreign_keys = ON');

/**
 * Initialize the database schema
 * Creates all necessary tables if they don't already exist
 * This ensures the database is ready for use when the application starts
 */
export function initializeDatabase() {
  // Create the audits table
  // This is the main table that stores general audit information
  db.exec(`
    CREATE TABLE IF NOT EXISTS audits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      centre_name TEXT NOT NULL,
      audit_date TEXT NOT NULL,
      auditor_name TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create the waste_data table
  // Stores waste audit responses linked to specific audits
  db.exec(`
    CREATE TABLE IF NOT EXISTS waste_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      audit_id INTEGER NOT NULL,
      item_key TEXT NOT NULL,
      response TEXT,
      notes TEXT,
      FOREIGN KEY (audit_id) REFERENCES audits(id) ON DELETE CASCADE
    )
  `);

  // Create the water_data table
  // Stores water audit responses linked to specific audits
  db.exec(`
    CREATE TABLE IF NOT EXISTS water_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      audit_id INTEGER NOT NULL,
      item_key TEXT NOT NULL,
      response TEXT,
      notes TEXT,
      FOREIGN KEY (audit_id) REFERENCES audits(id) ON DELETE CASCADE
    )
  `);

  // Create the images table
  // Stores image metadata for photos taken during audits
  db.exec(`
    CREATE TABLE IF NOT EXISTS images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      audit_id INTEGER NOT NULL,
      related_item TEXT,
      image_path TEXT NOT NULL,
      uploaded_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (audit_id) REFERENCES audits(id) ON DELETE CASCADE
    )
  `);

  console.log('Database initialized successfully');
}

// Initialize the database when this module is imported
initializeDatabase();

// Import types for waste audit operations
import { 
  WasteAuditData, 
  WasteAuditSummary,
  SaveWasteAuditRequest,
  SaveWasteAuditResponse 
} from '@/types/waste';

/**
 * Comprehensive Waste Audit Database Operations
 * Handles all CRUD operations for waste audit data
 */

/**
 * Save or update a complete waste audit
 * Stores the audit data as JSON in the waste_data table with appropriate keys
 */
export async function saveWasteAudit(auditId: number, wasteAuditData: Partial<WasteAuditData>): Promise<SaveWasteAuditResponse> {
  const saveTransaction = db.transaction((auditId: number, data: Partial<WasteAuditData>) => {
    try {
      // First, delete existing waste audit data for this audit
      const deleteStmt = db.prepare('DELETE FROM waste_data WHERE audit_id = ?');
      deleteStmt.run(auditId);

      // Prepare insert statement for waste data
      const insertStmt = db.prepare(`
        INSERT INTO waste_data (audit_id, item_key, response, notes)
        VALUES (?, ?, ?, ?)
      `);

      // Save each section of the waste audit data
      const sections = [
        'facilityInfrastructure',
        'wasteStreamsAssessment', 
        'specialWasteManagement',
        'organicWasteComposting',
        'wastePreventionMeasures',
        'behavioralTraining'
      ];

      sections.forEach(section => {
        if (data[section as keyof WasteAuditData]) {
          insertStmt.run(
            auditId,
            section,
            JSON.stringify(data[section as keyof WasteAuditData]),
            `Waste audit section: ${section}`
          );
        }
      });

      // Save metadata
      if (data.completedSections !== undefined) {
        insertStmt.run(auditId, 'completedSections', data.completedSections.toString(), 'Number of completed sections');
      }

      if (data.isQuickMode !== undefined) {
        insertStmt.run(auditId, 'isQuickMode', data.isQuickMode.toString(), 'Quick mode flag');
      }

      if (data.syncStatus) {
        insertStmt.run(auditId, 'syncStatus', data.syncStatus, 'Synchronization status');
      }

      // Update last saved timestamp
      insertStmt.run(auditId, 'lastSaved', new Date().toISOString(), 'Last saved timestamp');

      return {
        success: true,
        wasteAuditId: auditId
      };

    } catch (error) {
      console.error('Error saving waste audit:', error);
      throw error;
    }
  });

  try {
    const result = saveTransaction(auditId, wasteAuditData);
    return result;
  } catch (error) {
    return {
      success: false,
      validationErrors: [`Failed to save waste audit: ${error instanceof Error ? error.message : 'Unknown error'}`]
    };
  }
}

/**
 * Retrieve a complete waste audit by audit ID
 * Reconstructs the full WasteAuditData object from database records
 */
export async function getWasteAudit(auditId: number): Promise<WasteAuditData | null> {
  try {
    // Get all waste data records for this audit
    const stmt = db.prepare('SELECT item_key, response FROM waste_data WHERE audit_id = ?');
    const records = stmt.all(auditId) as { item_key: string; response: string }[];

    if (records.length === 0) {
      return null;
    }

    // Reconstruct the waste audit data object
    const wasteAuditData: Partial<WasteAuditData> = {
      auditId
    };

    records.forEach(record => {
      const { item_key, response } = record;

      if (['facilityInfrastructure', 'wasteStreamsAssessment', 'specialWasteManagement', 
           'organicWasteComposting', 'wastePreventionMeasures', 'behavioralTraining'].includes(item_key)) {
        try {
          wasteAuditData[item_key as keyof WasteAuditData] = JSON.parse(response);
        } catch (error) {
          console.error(`Error parsing ${item_key}:`, error);
        }
      } else if (item_key === 'completedSections') {
        wasteAuditData.completedSections = parseInt(response);
      } else if (item_key === 'isQuickMode') {
        wasteAuditData.isQuickMode = response === 'true';
      } else if (item_key === 'syncStatus') {
        wasteAuditData.syncStatus = response as 'synced' | 'pending' | 'offline';
      } else if (item_key === 'lastSaved') {
        wasteAuditData.lastSaved = response;
      }
    });

    return wasteAuditData as WasteAuditData;

  } catch (error) {
    console.error('Error retrieving waste audit:', error);
    return null;
  }
}

/**
 * Update specific sections of a waste audit
 * Allows partial updates without overwriting the entire audit
 */
export async function updateWasteAudit(auditId: number, updates: Partial<WasteAuditData>): Promise<boolean> {
  try {
    const updateTransaction = db.transaction((auditId: number, updates: Partial<WasteAuditData>) => {
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO waste_data (audit_id, item_key, response, notes)
        VALUES (?, ?, ?, ?)
      `);

      Object.keys(updates).forEach(key => {
        const value = updates[key as keyof WasteAuditData];
        if (value !== undefined) {
          if (typeof value === 'object') {
            stmt.run(auditId, key, JSON.stringify(value), `Updated: ${key}`);
          } else {
            stmt.run(auditId, key, value.toString(), `Updated: ${key}`);
          }
        }
      });

      // Always update the last saved timestamp
      stmt.run(auditId, 'lastSaved', new Date().toISOString(), 'Last updated timestamp');
    });

    updateTransaction(auditId, updates);
    return true;

  } catch (error) {
    console.error('Error updating waste audit:', error);
    return false;
  }
}

/**
 * Get waste audit summaries for a specific center
 * Returns basic information about all audits for a center
 */
export async function getWasteAuditsByCenter(centerName: string): Promise<WasteAuditSummary[]> {
  try {
    const stmt = db.prepare(`
      SELECT 
        a.id,
        a.id as audit_id,
        a.centre_name,
        a.audit_date,
        a.auditor_name,
        a.created_at,
        wd_completed.response as completed_sections,
        wd_sync.response as sync_status,
        wd_saved.response as last_modified
      FROM audits a
      LEFT JOIN waste_data wd_completed ON a.id = wd_completed.audit_id AND wd_completed.item_key = 'completedSections'
      LEFT JOIN waste_data wd_sync ON a.id = wd_sync.audit_id AND wd_sync.item_key = 'syncStatus'  
      LEFT JOIN waste_data wd_saved ON a.id = wd_saved.audit_id AND wd_saved.item_key = 'lastSaved'
      WHERE a.centre_name = ?
      ORDER BY a.audit_date DESC, a.created_at DESC
    `);

    const results = stmt.all(centerName) as any[];

    return results.map(row => ({
      id: row.id,
      auditId: row.audit_id,
      centreName: row.centre_name,
      auditDate: row.audit_date,
      auditorName: row.auditor_name,
      completedSections: row.completed_sections ? parseInt(row.completed_sections) : 0,
      lastModified: row.last_modified || row.created_at,
      syncStatus: (row.sync_status as 'synced' | 'pending' | 'offline') || 'offline'
    }));

  } catch (error) {
    console.error('Error getting waste audits by center:', error);
    return [];
  }
}

/**
 * Get all waste audit summaries across all centers
 * Useful for dashboard and reporting
 */
export async function getAllWasteAudits(): Promise<WasteAuditSummary[]> {
  try {
    const stmt = db.prepare(`
      SELECT 
        a.id,
        a.id as audit_id,
        a.centre_name,
        a.audit_date,
        a.auditor_name,
        a.created_at,
        wd_completed.response as completed_sections,
        wd_sync.response as sync_status,
        wd_saved.response as last_modified
      FROM audits a
      LEFT JOIN waste_data wd_completed ON a.id = wd_completed.audit_id AND wd_completed.item_key = 'completedSections'
      LEFT JOIN waste_data wd_sync ON a.id = wd_sync.audit_id AND wd_sync.item_key = 'syncStatus'
      LEFT JOIN waste_data wd_saved ON a.id = wd_saved.audit_id AND wd_saved.item_key = 'lastSaved'
      ORDER BY a.audit_date DESC, a.created_at DESC
    `);

    const results = stmt.all() as any[];

    return results.map(row => ({
      id: row.id,
      auditId: row.audit_id,
      centreName: row.centre_name,
      auditDate: row.audit_date,
      auditorName: row.auditor_name,
      completedSections: row.completed_sections ? parseInt(row.completed_sections) : 0,
      lastModified: row.last_modified || row.created_at,
      syncStatus: (row.sync_status as 'synced' | 'pending' | 'offline') || 'offline'
    }));

  } catch (error) {
    console.error('Error getting all waste audits:', error);
    return [];
  }
}

/**
 * Delete a waste audit and all associated data
 * Cascading delete removes all related records
 */
export async function deleteWasteAudit(auditId: number): Promise<boolean> {
  try {
    const deleteTransaction = db.transaction((auditId: number) => {
      // Delete waste data (this will be done automatically by cascade)
      // But we do it explicitly for clarity
      const deleteWasteStmt = db.prepare('DELETE FROM waste_data WHERE audit_id = ?');
      deleteWasteStmt.run(auditId);

      // Delete associated images
      const deleteImagesStmt = db.prepare('DELETE FROM images WHERE audit_id = ?');
      deleteImagesStmt.run(auditId);
    });

    deleteTransaction(auditId);
    return true;

  } catch (error) {
    console.error('Error deleting waste audit:', error);
    return false;
  }
}

/**
 * Check if a waste audit exists for a given audit ID
 */
export async function wasteAuditExists(auditId: number): Promise<boolean> {
  try {
    const stmt = db.prepare('SELECT COUNT(*) as count FROM waste_data WHERE audit_id = ?');
    const result = stmt.get(auditId) as { count: number };
    return result.count > 0;
  } catch (error) {
    console.error('Error checking waste audit existence:', error);
    return false;
  }
}

/**
 * Get waste audit completion statistics
 * Useful for progress tracking and reporting
 */
export async function getWasteAuditStats(): Promise<{
  totalAudits: number;
  completedAudits: number;
  averageCompletion: number;
  auditsWithPhotos: number;
}> {
  try {
    const totalStmt = db.prepare('SELECT COUNT(DISTINCT audit_id) as count FROM waste_data');
    const totalResult = totalStmt.get() as { count: number };

    const completedStmt = db.prepare(`
      SELECT COUNT(DISTINCT audit_id) as count 
      FROM waste_data 
      WHERE item_key = 'completedSections' AND CAST(response AS INTEGER) = 6
    `);
    const completedResult = completedStmt.get() as { count: number };

    const avgCompletionStmt = db.prepare(`
      SELECT AVG(CAST(response AS INTEGER)) as avg_completion
      FROM waste_data 
      WHERE item_key = 'completedSections'
    `);
    const avgResult = avgCompletionStmt.get() as { avg_completion: number };

    const photosStmt = db.prepare('SELECT COUNT(DISTINCT audit_id) as count FROM images');
    const photosResult = photosStmt.get() as { count: number };

    return {
      totalAudits: totalResult.count,
      completedAudits: completedResult.count,
      averageCompletion: avgResult.avg_completion || 0,
      auditsWithPhotos: photosResult.count
    };

  } catch (error) {
    console.error('Error getting waste audit statistics:', error);
    return {
      totalAudits: 0,
      completedAudits: 0,
      averageCompletion: 0,
      auditsWithPhotos: 0
    };
  }
}

// Export the database instance for use in other parts of the application
export default db;