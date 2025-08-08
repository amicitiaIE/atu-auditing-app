// Seed data for testing the Community Audit Application
// Creates realistic sample audits for Irish community centers

import db, { saveWasteAudit } from './database';
import { 
  WasteAuditData,
  BinLocation,
  BinType,
  BinSize,
  BinColour,
  LidType,
  WasteStream,
  CollectionFrequency,
  DayOfWeek,
  ContaminationType,
  YesNoPlanned,
  FoodWasteDisposal,
  CompostingSystem,
  CompostUsage,
  ImplementationLevel,
  MonitoringFrequency,
  FeedbackMechanism
} from '@/types/waste';

/**
 * Seed the database with realistic test data
 * Creates sample audits for Irish community centers
 */
export async function seedDatabase() {
  console.log('Starting database seeding...');

  try {
    // Create sample main audits
    const auditIds = await createSampleAudits();
    
    // Create waste audits for each
    await Promise.all(auditIds.map(auditId => createSampleWasteAudit(auditId)));
    
    console.log(`Successfully seeded database with ${auditIds.length} sample audits`);
    return true;

  } catch (error) {
    console.error('Error seeding database:', error);
    return false;
  }
}

/**
 * Create sample main audit records
 */
async function createSampleAudits(): Promise<number[]> {
  const sampleAudits = [
    {
      centre_name: 'Ballyfermot Community Centre',
      audit_date: '2024-01-15',
      auditor_name: 'Sarah O\'Connor'
    },
    {
      centre_name: 'Clondalkin Community Centre',
      audit_date: '2024-01-20',
      auditor_name: 'Michael Murphy'
    },
    {
      centre_name: 'Inchicore Community Centre',
      audit_date: '2024-02-05',
      auditor_name: 'Emma Walsh'
    },
    {
      centre_name: 'Cherry Orchard Community Centre',
      audit_date: '2024-02-12',
      auditor_name: 'David Kelly'
    }
  ];

  const auditIds: number[] = [];

  const stmt = db.prepare(`
    INSERT INTO audits (centre_name, audit_date, auditor_name)
    VALUES (?, ?, ?)
  `);

  for (const audit of sampleAudits) {
    const result = stmt.run(audit.centre_name, audit.audit_date, audit.auditor_name);
    auditIds.push(result.lastInsertRowid as number);
  }

  return auditIds;
}

/**
 * Create a comprehensive sample waste audit
 */
async function createSampleWasteAudit(auditId: number): Promise<void> {
  // Get the audit info to customize the sample data
  const auditInfo = db.prepare('SELECT * FROM audits WHERE id = ?').get(auditId) as any;
  const centreName = auditInfo?.centre_name || 'Unknown Centre';

  // Create realistic waste audit data based on center
  const wasteAuditData: WasteAuditData = {
    id: auditId,
    auditId,
    
    // Section A: Facility Waste Infrastructure
    facilityInfrastructure: {
      binInventory: createSampleBinInventory(centreName),
      totalBins: 0, // Will be calculated
      outdoorBinsPresent: true,
      notes: 'Generally good bin coverage. Some signage needs improvement.'
    },

    // Section B: Waste Streams Assessment
    wasteStreamsAssessment: {
      assessments: createSampleWasteStreams(centreName),
      totalAnnualCost: 0, // Will be calculated
      primaryContractor: 'Panda Waste Services'
    },

    // Section C: Special Waste Management
    specialWasteManagement: {
      batteryCollection: { 
        type: 'Battery Collection', 
        status: YesNoPlanned.YES,
        location: 'Reception desk',
        collectionFrequency: CollectionFrequency.MONTHLY
      },
      weeeCollection: { 
        type: 'WEEE Collection', 
        status: YesNoPlanned.PLANNED,
        notes: 'Arranging with local authority'
      },
      printerCartridges: { 
        type: 'Printer Cartridges', 
        status: YesNoPlanned.YES,
        location: 'Office area'
      },
      fluorescentTubes: { 
        type: 'Fluorescent Tubes', 
        status: YesNoPlanned.NO,
        notes: 'All LED lighting installed'
      },
      chemicalPaintStorage: { 
        type: 'Chemical/Paint Storage', 
        status: YesNoPlanned.YES,
        location: 'Secure storage room'
      },
      confidentialWasteShredding: { 
        type: 'Confidential Waste Shredding', 
        status: YesNoPlanned.YES,
        collectionFrequency: CollectionFrequency.MONTHLY
      },
      textilesCollection: { 
        type: 'Textiles Collection', 
        status: YesNoPlanned.PLANNED,
        notes: 'Community clothing bank planned'
      },
      mobilePhoneRecycling: { 
        type: 'Mobile Phone Recycling', 
        status: YesNoPlanned.NO,
        notes: 'Could partner with local electronics store'
      }
    },

    // Section D: Organic Waste & Composting
    organicWasteComposting: {
      kitchenPresent: true,
      foodWasteVolumeKgPerWeek: centreName.includes('Ballyfermot') ? 25 : 15,
      foodWasteDisposalMethod: FoodWasteDisposal.BROWN_BIN,
      compostingSystem: centreName.includes('Cherry Orchard') ? CompostingSystem.TRADITIONAL : CompostingSystem.NONE,
      compostingCapacityLitres: centreName.includes('Cherry Orchard') ? 300 : undefined,
      compostingUsageLevel: centreName.includes('Cherry Orchard') ? CompostUsage.WEEKLY : undefined,
      coffeeGroundsDisposal: 'Given to local gardening group',
      cookingOilDisposal: 'Collected by waste management company',
      notes: centreName.includes('Cherry Orchard') ? 'Active composting program with community garden' : 'Interest in starting composting'
    },

    // Section E: Waste Prevention Measures
    wastePreventionMeasures: {
      procurementPolicy: centreName.includes('Ballyfermot') ? ImplementationLevel.PARTIAL : ImplementationLevel.NOT_IMPLEMENTED,
      reusableCupsBottles: ImplementationLevel.FULL,
      waterFountainsRefillStations: ImplementationLevel.FULL,
      paperlessCommunication: ImplementationLevel.PARTIAL,
      donationSystem: centreName.includes('Inchicore') ? ImplementationLevel.FULL : ImplementationLevel.PLANNED,
      repairCafe: centreName.includes('Clondalkin') ? ImplementationLevel.FULL : ImplementationLevel.NOT_IMPLEMENTED,
      bulkBuying: ImplementationLevel.PARTIAL,
      eliminateSingleUse: ImplementationLevel.PLANNED,
      notes: 'Strong focus on reuse and community engagement'
    },

    // Section F: Behavioral & Training
    behavioralTraining: {
      lastWasteTrainingDate: '2024-01-10',
      wasteChampionAppointed: true,
      wasteChampionName: getRandomWasteChampion(),
      userEducationMaterialsDisplayed: true,
      educationMaterialsPhotoPath: undefined,
      wasteMonitoringRecordsKept: MonitoringFrequency.MONTHLY,
      feedbackMechanism: FeedbackMechanism.REGULAR_MEETINGS,
      additionalNotes: 'Weekly team meetings include waste management updates'
    },

    // Meta information
    completedSections: 6,
    isQuickMode: false,
    lastSaved: new Date().toISOString(),
    syncStatus: 'synced'
  };

  // Calculate totals
  wasteAuditData.facilityInfrastructure.totalBins = wasteAuditData.facilityInfrastructure.binInventory.length;
  wasteAuditData.wasteStreamsAssessment.totalAnnualCost = wasteAuditData.wasteStreamsAssessment.assessments
    .reduce((sum, stream) => sum + (stream.annualCostEuros || 0), 0);

  // Save the waste audit data
  await saveWasteAudit(auditId, wasteAuditData);
}

/**
 * Create sample bin inventory based on center characteristics
 */
function createSampleBinInventory(centreName: string): any[] {
  const baseBins = [
    {
      id: 'bin_1',
      location: BinLocation.KITCHEN,
      binType: BinType.GENERAL_WASTE,
      sizeInLitres: BinSize.SIZE_120L,
      colour: BinColour.BLACK_GREY,
      lidType: LidType.FLIP_LID,
      signagePresent: true,
      signageQuality: 4
    },
    {
      id: 'bin_2',
      location: BinLocation.KITCHEN,
      binType: BinType.DRY_RECYCLABLES,
      sizeInLitres: BinSize.SIZE_120L,
      colour: BinColour.BLUE,
      lidType: LidType.FLIP_LID,
      signagePresent: true,
      signageQuality: 4
    },
    {
      id: 'bin_3',
      location: BinLocation.KITCHEN,
      binType: BinType.ORGANIC_COMPOST,
      sizeInLitres: BinSize.SIZE_60L,
      colour: BinColour.BROWN,
      lidType: LidType.FLIP_LID,
      signagePresent: true,
      signageQuality: 3
    },
    {
      id: 'bin_4',
      location: BinLocation.MAIN_HALL,
      binType: BinType.GENERAL_WASTE,
      sizeInLitres: BinSize.SIZE_240L,
      colour: BinColour.BLACK_GREY,
      lidType: LidType.OPEN_TOP,
      signagePresent: true,
      signageQuality: 3
    },
    {
      id: 'bin_5',
      location: BinLocation.MAIN_HALL,
      binType: BinType.DRY_RECYCLABLES,
      sizeInLitres: BinSize.SIZE_240L,
      colour: BinColour.BLUE,
      lidType: LidType.OPEN_TOP,
      signagePresent: false,
      signageQuality: 1
    },
    {
      id: 'bin_6',
      location: BinLocation.TOILETS,
      binType: BinType.GENERAL_WASTE,
      sizeInLitres: BinSize.SIZE_60L,
      colour: BinColour.BLACK_GREY,
      lidType: LidType.FLIP_LID,
      signagePresent: false,
      signageQuality: 1
    },
    {
      id: 'bin_7',
      location: BinLocation.OUTDOOR,
      binType: BinType.GENERAL_WASTE,
      sizeInLitres: BinSize.SIZE_660L,
      colour: BinColour.BLACK_GREY,
      lidType: LidType.LOCKED,
      signagePresent: true,
      signageQuality: 2
    }
  ];

  // Add extra bins for larger centers
  if (centreName.includes('Ballyfermot') || centreName.includes('Clondalkin')) {
    baseBins.push(
      {
        id: 'bin_8',
        location: BinLocation.OFFICE,
        binType: BinType.DRY_RECYCLABLES,
        sizeInLitres: BinSize.SIZE_60L,
        colour: BinColour.BLUE,
        lidType: LidType.OPEN_TOP,
        signagePresent: true,
        signageQuality: 4
      },
      {
        id: 'bin_9',
        location: BinLocation.OUTDOOR,
        binType: BinType.DRY_RECYCLABLES,
        sizeInLitres: BinSize.SIZE_660L,
        colour: BinColour.BLUE,
        lidType: LidType.RESTRICTED_OPENING,
        signagePresent: true,
        signageQuality: 3
      }
    );
  }

  return baseBins;
}

/**
 * Create sample waste stream assessments
 */
function createSampleWasteStreams(centreName: string): any[] {
  const baseMultiplier = centreName.includes('Ballyfermot') ? 1.3 : 
                         centreName.includes('Clondalkin') ? 1.2 : 1.0;

  return [
    {
      wasteStream: WasteStream.GENERAL,
      estimatedWeeklyVolumeLitres: Math.round(500 * baseMultiplier),
      collectionFrequency: CollectionFrequency.WEEKLY,
      collectionDays: [DayOfWeek.TUESDAY],
      contaminationLevel: 2,
      commonContaminants: [ContaminationType.PLASTIC_BAGS],
      contractorName: 'Panda Waste Services',
      annualCostEuros: Math.round(2400 * baseMultiplier),
      notes: 'Generally well sorted'
    },
    {
      wasteStream: WasteStream.DRY_RECYCLABLES,
      estimatedWeeklyVolumeLitres: Math.round(200 * baseMultiplier),
      collectionFrequency: CollectionFrequency.FORTNIGHTLY,
      collectionDays: [DayOfWeek.FRIDAY],
      contaminationLevel: 3,
      commonContaminants: [ContaminationType.FOOD_WASTE, ContaminationType.PLASTIC_BAGS],
      contractorName: 'Panda Waste Services',
      annualCostEuros: Math.round(800 * baseMultiplier),
      notes: 'Some contamination from food packaging'
    },
    {
      wasteStream: WasteStream.ORGANIC,
      estimatedWeeklyVolumeLitres: Math.round(100 * baseMultiplier),
      collectionFrequency: CollectionFrequency.WEEKLY,
      collectionDays: [DayOfWeek.WEDNESDAY],
      contaminationLevel: 1,
      commonContaminants: [],
      contractorName: 'Panda Waste Services',
      annualCostEuros: Math.round(600 * baseMultiplier),
      notes: 'Excellent separation by kitchen staff'
    },
    {
      wasteStream: WasteStream.GLASS,
      estimatedWeeklyVolumeLitres: Math.round(30 * baseMultiplier),
      collectionFrequency: CollectionFrequency.MONTHLY,
      collectionDays: [DayOfWeek.FRIDAY],
      contaminationLevel: 2,
      commonContaminants: [ContaminationType.NON_RECYCLABLES],
      contractorName: 'Local Authority',
      annualCostEuros: 0,
      notes: 'Bring bank service'
    }
  ];
}

/**
 * Get a random waste champion name
 */
function getRandomWasteChampion(): string {
  const names = [
    'Mary Fitzgerald',
    'John O\'Brien',
    'Catherine Byrne',
    'Patrick Nolan',
    'Sinead McCarthy',
    'Declan Walsh',
    'Aileen Murphy',
    'Brendan Kelly'
  ];
  
  return names[Math.floor(Math.random() * names.length)];
}

/**
 * Clear all existing data (useful for re-seeding)
 */
export async function clearDatabase() {
  try {
    // Delete in correct order due to foreign key constraints
    db.exec('DELETE FROM images');
    db.exec('DELETE FROM waste_data');
    db.exec('DELETE FROM water_data');
    db.exec('DELETE FROM audits');
    
    console.log('Database cleared successfully');
    return true;
  } catch (error) {
    console.error('Error clearing database:', error);
    return false;
  }
}

/**
 * Reset and re-seed the database
 */
export async function resetDatabase() {
  console.log('Resetting database...');
  
  const cleared = await clearDatabase();
  if (!cleared) {
    return false;
  }
  
  return await seedDatabase();
}