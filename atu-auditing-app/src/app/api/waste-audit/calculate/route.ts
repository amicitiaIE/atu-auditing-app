import { NextRequest, NextResponse } from 'next/server';
import { WasteAuditData, WasteAuditCalculations, QuickWin } from '@/types/waste';

/**
 * POST /api/waste-audit/calculate
 * 
 * Calculates metrics and insights without saving
 * Returns auto-calculations, quick wins, and recommendations
 * 
 * Request body:
 * - wasteAuditData: Partial<WasteAuditData> - Current form data
 * - userCount?: number - Number of facility users for per-capita calculations
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      wasteAuditData: Partial<WasteAuditData>;
      userCount?: number;
    };
    
    if (!body.wasteAuditData) {
      return NextResponse.json(
        { error: 'Waste audit data is required' },
        { status: 400 }
      );
    }

    // Calculate metrics based on current data
    const calculations = calculateWasteMetrics(body.wasteAuditData, body.userCount || 100);
    
    // Generate quick wins based on current state
    const quickWins = generateQuickWins(body.wasteAuditData);
    
    // Generate compliance alerts
    const complianceAlerts = generateComplianceAlerts(body.wasteAuditData);
    
    // Generate grant opportunities
    const grantOpportunities = generateGrantOpportunities(body.wasteAuditData);
    
    // Calculate overall score
    const overallScore = calculateOverallScore(body.wasteAuditData);
    
    // Generate recommendations
    const recommendations = generateRecommendations(body.wasteAuditData);

    const response = {
      calculations,
      quickWins,
      complianceAlerts,
      grantOpportunities,
      overallScore,
      recommendations,
      calculatedAt: new Date().toISOString()
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Error calculating waste audit metrics:', error);
    
    return NextResponse.json(
      { error: 'Failed to calculate waste audit metrics' },
      { status: 500 }
    );
  }
}

/**
 * Calculate key waste management metrics
 */
function calculateWasteMetrics(data: Partial<WasteAuditData>, userCount: number): WasteAuditCalculations {
  let totalAnnualCost = 0;
  let totalWeeklyVolume = 0;
  let recyclableVolume = 0;
  let contaminationIssues = 0;

  // Calculate from waste streams assessment
  if (data.wasteStreamsAssessment?.assessments) {
    data.wasteStreamsAssessment.assessments.forEach(stream => {
      if (stream.annualCostEuros) {
        totalAnnualCost += stream.annualCostEuros;
      }
      
      totalWeeklyVolume += stream.estimatedWeeklyVolumeLitres || 0;
      
      if (stream.wasteStream === 'dry_recyclables' || stream.wasteStream === 'organic') {
        recyclableVolume += stream.estimatedWeeklyVolumeLitres || 0;
      }
      
      if (stream.contaminationLevel > 3) {
        contaminationIssues++;
      }
    });
  }

  // Calculate recycling rate
  const recyclingRate = totalWeeklyVolume > 0 ? (recyclableVolume / totalWeeklyVolume) * 100 : 0;

  // Calculate potential savings from contamination reduction (estimate 10-20% cost reduction)
  const potentialSavings = contaminationIssues > 0 ? totalAnnualCost * 0.15 : 0;

  // Calculate weekly waste per user (convert litres to approximate kg)
  const weeklyWastePerUser = userCount > 0 ? (totalWeeklyVolume * 0.5) / userCount : 0;

  // Estimate carbon footprint (rough calculation - 0.5kg CO2 per kg waste)
  const carbonFootprint = (totalWeeklyVolume * 0.5 * 52) * 0.5;

  return {
    estimatedAnnualWasteCost: totalAnnualCost,
    potentialSavingsFromContaminationReduction: potentialSavings,
    recyclingRateEstimate: Math.round(recyclingRate * 100) / 100,
    weeklyWastePerUser: Math.round(weeklyWastePerUser * 100) / 100,
    carbonFootprintEstimate: Math.round(carbonFootprint)
  };
}

/**
 * Generate quick wins based on current audit state
 */
function generateQuickWins(data: Partial<WasteAuditData>): QuickWin[] {
  const quickWins: QuickWin[] = [];
  let priority = 1;

  // Check for missing recycling bins
  const binInventory = data.facilityInfrastructure?.binInventory || [];
  const hasRecyclingBins = binInventory.some(bin => bin.binType === 'dry_recyclables');
  
  if (!hasRecyclingBins) {
    quickWins.push({
      id: 'add-recycling-bins',
      title: 'Add Recycling Bins',
      description: 'No recycling bins detected. Adding clearly labelled recycling bins can reduce general waste costs.',
      estimatedCostEuros: 150,
      estimatedSavingsEuros: 500,
      impactLevel: 'high',
      priority: priority++,
      category: 'infrastructure'
    });
  }

  // Check for poor signage
  const poorSignageBins = binInventory.filter(bin => bin.signagePresent && bin.signageQuality < 3);
  if (poorSignageBins.length > 0) {
    quickWins.push({
      id: 'improve-signage',
      title: 'Improve Bin Signage',
      description: `${poorSignageBins.length} bins have poor signage quality. Clear signage reduces contamination.`,
      estimatedCostEuros: 50,
      estimatedSavingsEuros: 200,
      impactLevel: 'medium',
      priority: priority++,
      category: 'infrastructure'
    });
  }

  // Check for contamination issues
  const contaminatedStreams = data.wasteStreamsAssessment?.assessments?.filter(
    stream => stream.contaminationLevel > 3
  ) || [];
  
  if (contaminatedStreams.length > 0) {
    quickWins.push({
      id: 'contamination-training',
      title: 'Staff Waste Training',
      description: 'High contamination levels detected. Staff training can reduce collection costs.',
      estimatedCostEuros: 100,
      estimatedSavingsEuros: 400,
      impactLevel: 'high',
      priority: priority++,
      category: 'training'
    });
  }

  // Check for waste champion
  if (!data.behavioralTraining?.wasteChampionAppointed) {
    quickWins.push({
      id: 'appoint-champion',
      title: 'Appoint Waste Champion',
      description: 'Designate a staff member as waste champion to drive improvements.',
      estimatedCostEuros: 0,
      estimatedSavingsEuros: 300,
      impactLevel: 'medium',
      priority: priority++,
      category: 'training'
    });
  }

  // Check for composting opportunity
  if (data.organicWasteComposting?.kitchenPresent && 
      data.organicWasteComposting.compostingSystem === 'none') {
    quickWins.push({
      id: 'start-composting',
      title: 'Start Composting System',
      description: 'Kitchen present but no composting. A simple system could reduce organic waste costs.',
      estimatedCostEuros: 200,
      estimatedSavingsEuros: 600,
      impactLevel: 'high',
      priority: priority++,
      category: 'prevention'
    });
  }

  // Sort by priority and return top 5
  return quickWins.sort((a, b) => a.priority - b.priority).slice(0, 5);
}

/**
 * Generate compliance alerts
 */
function generateComplianceAlerts(data: Partial<WasteAuditData>): string[] {
  const alerts: string[] = [];

  // Check for hazardous waste handling
  const hasHazardous = data.wasteStreamsAssessment?.assessments?.some(
    stream => stream.wasteStream === 'hazardous'
  );
  
  if (hasHazardous && !data.specialWasteManagement?.weeeCollection) {
    alerts.push('Hazardous waste detected but no WEEE collection arrangement documented');
  }

  // Check for large facilities without organic separation
  const totalVolume = data.wasteStreamsAssessment?.assessments?.reduce(
    (sum, stream) => sum + (stream.estimatedWeeklyVolumeLitres || 0), 0
  ) || 0;
  
  if (totalVolume > 1000 && data.organicWasteComposting?.compostingSystem === 'none') {
    alerts.push('Large facility (>1000L/week) should consider organic waste separation');
  }

  return alerts;
}

/**
 * Generate grant opportunities
 */
function generateGrantOpportunities(data: Partial<WasteAuditData>): string[] {
  const opportunities: string[] = [];

  // Check for SEAI Community Grant eligibility
  const preventionScore = calculatePreventionScore(data.wastePreventionMeasures);
  if (preventionScore < 50) {
    opportunities.push('Eligible for SEAI Community Grant - waste prevention measures scoring low');
  }

  // Check for circular economy initiatives
  if (data.wastePreventionMeasures?.repairCafe === 'not_implemented') {
    opportunities.push('Circular Economy Programme funding available for repair initiatives');
  }

  // Check for community composting grants
  if (data.organicWasteComposting?.kitchenPresent && 
      data.organicWasteComposting.compostingSystem === 'none') {
    opportunities.push('Community Foundation grants available for composting projects');
  }

  return opportunities;
}

/**
 * Calculate prevention score
 */
function calculatePreventionScore(prevention?: any): number {
  if (!prevention) return 0;
  
  const measures = [
    'procurementPolicy', 'reusableCupsBottles', 'waterFountainsRefillStations',
    'paperlessCommunication', 'donationSystem', 'repairCafe', 'bulkBuying', 'eliminateSingleUse'
  ];
  
  let score = 0;
  measures.forEach(measure => {
    const value = prevention[measure];
    if (value === 'full') score += 4;
    else if (value === 'partial') score += 2;
    else if (value === 'planned') score += 1;
  });
  
  return (score / (measures.length * 4)) * 100;
}

/**
 * Calculate overall audit score
 */
function calculateOverallScore(data: Partial<WasteAuditData>): number {
  let score = 0;
  let maxScore = 0;

  // Infrastructure score (0-20 points)
  const binCount = data.facilityInfrastructure?.binInventory?.length || 0;
  const recyclingBins = data.facilityInfrastructure?.binInventory?.filter(
    bin => bin.binType === 'dry_recyclables'
  ).length || 0;
  
  score += Math.min(binCount * 2, 10); // Up to 10 points for bins
  score += recyclingBins > 0 ? 10 : 0; // 10 points for having recycling
  maxScore += 20;

  // Prevention score (0-30 points)
  const preventionScore = calculatePreventionScore(data.wastePreventionMeasures);
  score += (preventionScore / 100) * 30;
  maxScore += 30;

  // Training score (0-25 points)
  if (data.behavioralTraining) {
    if (data.behavioralTraining.wasteChampionAppointed) score += 10;
    if (data.behavioralTraining.userEducationMaterialsDisplayed) score += 10;
    if (data.behavioralTraining.wasteMonitoringRecordsKept !== 'never') score += 5;
    maxScore += 25;
  }

  // Contamination score (0-25 points)
  const streams = data.wasteStreamsAssessment?.assessments || [];
  if (streams.length > 0) {
    const avgContamination = streams.reduce((sum, s) => sum + (s.contaminationLevel || 5), 0) / streams.length;
    score += ((5 - avgContamination) / 4) * 25; // Lower contamination = higher score
    maxScore += 25;
  }

  return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
}

/**
 * Generate recommendations
 */
function generateRecommendations(data: Partial<WasteAuditData>): string[] {
  const recommendations: string[] = [];

  const overallScore = calculateOverallScore(data);
  
  if (overallScore < 40) {
    recommendations.push('Priority: Focus on basic infrastructure - ensure adequate bins and signage');
    recommendations.push('Consider appointing a waste champion to drive improvements');
  } else if (overallScore < 70) {
    recommendations.push('Good foundation - focus on contamination reduction through training');
    recommendations.push('Implement waste prevention measures to reduce overall volumes');
  } else {
    recommendations.push('Excellent waste management - consider sharing best practices with other centers');
    recommendations.push('Explore advanced initiatives like circular economy projects');
  }

  return recommendations;
}

/**
 * OPTIONS /api/waste-audit/calculate
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