// Type definitions for Waste Management Audit functionality
// Provides comprehensive typing for all form sections and database operations

// Enums for dropdown options
export enum BinLocation {
  KITCHEN = 'kitchen',
  MAIN_HALL = 'main_hall',
  TOILETS = 'toilets',
  OUTDOOR = 'outdoor',
  OFFICE = 'office',
  OTHER = 'other'
}

export enum BinType {
  GENERAL_WASTE = 'general_waste',
  DRY_RECYCLABLES = 'dry_recyclables',
  ORGANIC_COMPOST = 'organic_compost',
  GLASS = 'glass',
  BATTERIES = 'batteries',
  WEEE = 'weee'
}

export enum BinSize {
  SIZE_60L = 60,
  SIZE_120L = 120,
  SIZE_240L = 240,
  SIZE_660L = 660,
  SIZE_1100L = 1100,
  OTHER = 0
}

export enum BinColour {
  BLACK_GREY = 'black_grey',
  BLUE = 'blue',
  GREEN = 'green',
  BROWN = 'brown',
  OTHER = 'other'
}

export enum LidType {
  OPEN_TOP = 'open_top',
  FLIP_LID = 'flip_lid',
  RESTRICTED_OPENING = 'restricted_opening',
  LOCKED = 'locked'
}

export enum CollectionFrequency {
  DAILY = 'daily',
  TWICE_WEEKLY = 'twice_weekly',
  WEEKLY = 'weekly',
  FORTNIGHTLY = 'fortnightly',
  MONTHLY = 'monthly'
}

export enum DayOfWeek {
  MONDAY = 'monday',
  TUESDAY = 'tuesday',
  WEDNESDAY = 'wednesday',
  THURSDAY = 'thursday',
  FRIDAY = 'friday',
  SATURDAY = 'saturday',
  SUNDAY = 'sunday'
}

export enum ContaminationType {
  PLASTIC_BAGS = 'plastic_bags',
  FOOD_WASTE = 'food_waste',
  LIQUIDS = 'liquids',
  NON_RECYCLABLES = 'non_recyclables',
  OTHER = 'other'
}

export enum WasteStream {
  GENERAL = 'general',
  DRY_RECYCLABLES = 'dry_recyclables',
  ORGANIC = 'organic',
  GLASS = 'glass',
  HAZARDOUS = 'hazardous'
}

export enum FoodWasteDisposal {
  BROWN_BIN = 'brown_bin',
  COMPOSTER = 'composter',
  FOOD_DIGESTER = 'food_digester',
  WASTE_DISPOSAL_UNIT = 'waste_disposal_unit',
  GENERAL_WASTE = 'general_waste'
}

export enum CompostingSystem {
  NONE = 'none',
  TRADITIONAL = 'traditional',
  BOKASHI = 'bokashi',
  WORM_FARM = 'worm_farm',
  OTHER = 'other'
}

export enum CompostUsage {
  RARELY = 'rarely',
  MONTHLY = 'monthly',
  WEEKLY = 'weekly',
  DAILY = 'daily'
}

export enum ImplementationLevel {
  NOT_IMPLEMENTED = 'not_implemented',
  PLANNED = 'planned',
  PARTIAL = 'partial',
  FULL = 'full'
}

export enum YesNoPlanned {
  YES = 'yes',
  NO = 'no',
  PLANNED = 'planned'
}

export enum FeedbackMechanism {
  NONE = 'none',
  SUGGESTION_BOX = 'suggestion_box',
  EMAIL = 'email',
  REGULAR_MEETINGS = 'regular_meetings'
}

export enum MonitoringFrequency {
  NEVER = 'never',
  OCCASIONALLY = 'occasionally',
  MONTHLY = 'monthly',
  WEEKLY = 'weekly'
}

// Section A: Facility Waste Infrastructure
export interface BinInventoryItem {
  id?: string;
  location: BinLocation;
  binType: BinType;
  sizeInLitres: number;
  customSize?: number;
  colour: BinColour;
  lidType: LidType;
  signagePresent: boolean;
  signageQuality: number; // 1-5 scale
  photoPath?: string;
}

export interface FacilityWasteInfrastructure {
  binInventory: BinInventoryItem[];
  totalBins: number;
  outdoorBinsPresent: boolean;
  notes?: string;
}

// Section B: Waste Streams Assessment
export interface WasteStreamAssessment {
  wasteStream: WasteStream;
  estimatedWeeklyVolumeLitres: number;
  collectionFrequency: CollectionFrequency;
  collectionDays: DayOfWeek[];
  contaminationLevel: number; // 1-5 scale
  commonContaminants: ContaminationType[];
  contractorName?: string;
  annualCostEuros?: number;
  notes?: string;
  contaminationPhotoPath?: string;
}

export interface WasteStreamsAssessment {
  assessments: WasteStreamAssessment[];
  totalAnnualCost?: number;
  primaryContractor?: string;
}

// Section C: Special Waste Management
export interface SpecialWasteItem {
  type: string;
  status: YesNoPlanned;
  location?: string;
  collectionFrequency?: CollectionFrequency;
  notes?: string;
}

export interface SpecialWasteManagement {
  batteryCollection: SpecialWasteItem;
  weeeCollection: SpecialWasteItem;
  printerCartridges: SpecialWasteItem;
  fluorescentTubes: SpecialWasteItem;
  chemicalPaintStorage: SpecialWasteItem;
  confidentialWasteShredding: SpecialWasteItem;
  textilesCollection: SpecialWasteItem;
  mobilePhoneRecycling: SpecialWasteItem;
}

// Section D: Organic Waste & Composting
export interface OrganicWasteComposting {
  kitchenPresent: boolean;
  foodWasteVolumeKgPerWeek?: number;
  foodWasteDisposalMethod?: FoodWasteDisposal;
  compostingSystem: CompostingSystem;
  compostingCapacityLitres?: number;
  compostingUsageLevel?: CompostUsage;
  coffeeGroundsDisposal?: string;
  cookingOilDisposal?: string;
  notes?: string;
}

// Section E: Waste Prevention Measures
export interface WastePreventionMeasures {
  procurementPolicy: ImplementationLevel;
  reusableCupsBottles: ImplementationLevel;
  waterFountainsRefillStations: ImplementationLevel;
  paperlessCommunication: ImplementationLevel;
  donationSystem: ImplementationLevel;
  repairCafe: ImplementationLevel;
  bulkBuying: ImplementationLevel;
  eliminateSingleUse: ImplementationLevel;
  notes?: string;
}

// Section F: Behavioral & Training
export interface BehavioralTraining {
  lastWasteTrainingDate?: string; // ISO date string
  wasteChampionAppointed: boolean;
  wasteChampionName?: string;
  userEducationMaterialsDisplayed: boolean;
  educationMaterialsPhotoPath?: string;
  wasteMonitoringRecordsKept: MonitoringFrequency;
  feedbackMechanism: FeedbackMechanism;
  additionalNotes?: string;
}

// Complete Waste Audit Data Structure
export interface WasteAuditData {
  id?: number;
  auditId: number; // Links to main audits table
  
  // Section A
  facilityInfrastructure: FacilityWasteInfrastructure;
  
  // Section B
  wasteStreamsAssessment: WasteStreamsAssessment;
  
  // Section C
  specialWasteManagement: SpecialWasteManagement;
  
  // Section D
  organicWasteComposting: OrganicWasteComposting;
  
  // Section E
  wastePreventionMeasures: WastePreventionMeasures;
  
  // Section F
  behavioralTraining: BehavioralTraining;
  
  // Meta information
  completedSections: number; // 0-6
  isQuickMode: boolean;
  lastSaved?: string; // ISO date string
  syncStatus: 'synced' | 'pending' | 'offline';
}

// Auto-calculations and insights
export interface WasteAuditCalculations {
  estimatedAnnualWasteCost: number;
  potentialSavingsFromContaminationReduction: number;
  recyclingRateEstimate: number; // percentage
  weeklyWastePerUser: number; // kg, requires user numbers
  carbonFootprintEstimate?: number; // kg CO2 equivalent
}

export interface QuickWin {
  id: string;
  title: string;
  description: string;
  estimatedCostEuros: number;
  estimatedSavingsEuros: number;
  impactLevel: 'low' | 'medium' | 'high';
  priority: number; // 1 = highest priority
  category: 'infrastructure' | 'contamination' | 'prevention' | 'training';
}

export interface WasteAuditInsights {
  calculations: WasteAuditCalculations;
  quickWins: QuickWin[];
  complianceAlerts: string[];
  grantOpportunities: string[];
  overallScore: number; // 0-100
  recommendations: string[];
}

// Database and API related types
export interface WasteAuditSummary {
  id: number;
  auditId: number;
  centreName: string;
  auditDate: string;
  auditorName: string;
  completedSections: number;
  overallScore?: number;
  lastModified: string;
  syncStatus: 'synced' | 'pending' | 'offline';
}

export interface SaveWasteAuditRequest {
  auditId: number;
  wasteAuditData: Partial<WasteAuditData>;
  isAutoSave?: boolean;
}

export interface SaveWasteAuditResponse {
  success: boolean;
  wasteAuditId?: number;
  validationErrors?: string[];
  calculations?: WasteAuditCalculations;
  quickWins?: QuickWin[];
}

// Form state management
export interface FormSection {
  id: string;
  title: string;
  completed: boolean;
  requiredFields: string[];
  hasErrors: boolean;
}

export interface FormProgress {
  sections: FormSection[];
  overallCompletion: number; // percentage
  requiredPhotos: number;
  uploadedPhotos: number;
  estimatedTimeRemaining: number; // minutes
  qualityScore: number; // 0-100
}

// Local storage types
export interface LocalStorageWasteAudit {
  auditId: number;
  formData: Partial<WasteAuditData>;
  lastSaved: string; // ISO date
  version: number;
  pendingUploads: string[]; // file paths
}

// Validation rules
export interface ValidationRule {
  field: string;
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  customValidation?: (value: any, formData: Partial<WasteAuditData>) => string | null;
}

export interface ValidationErrors {
  [fieldName: string]: string[];
}

// Export all types for easy importing
export type {
  WasteAuditData,
  WasteAuditCalculations,
  WasteAuditInsights,
  WasteAuditSummary,
  FormProgress,
  QuickWin,
  ValidationErrors
};