'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  WasteAuditData,
  BinInventoryItem,
  WasteStreamAssessment,
  BinLocation,
  BinType,
  BinSize,
  BinColour,
  LidType,
  CollectionFrequency,
  DayOfWeek,
  ContaminationType,
  WasteStream,
  YesNoPlanned,
  FoodWasteDisposal,
  CompostingSystem,
  CompostUsage,
  ImplementationLevel,
  MonitoringFrequency,
  FeedbackMechanism,
  FormProgress
} from '@/types/waste';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AuditSection } from '@/components/ui/audit-section';
import { Trash2, Plus, Camera, Save, RotateCcw } from 'lucide-react';

interface WasteAuditFormProps {
  auditId: number;
  initialData?: Partial<WasteAuditData>;
  onSave?: (data: Partial<WasteAuditData>) => void;
  onAutoSave?: (data: Partial<WasteAuditData>) => void;
}

export default function WasteAuditForm({ auditId, initialData, onSave, onAutoSave }: WasteAuditFormProps) {
  // Form state management
  const [formData, setFormData] = useState<Partial<WasteAuditData>>({
    auditId,
    facilityInfrastructure: {
      binInventory: [],
      totalBins: 0,
      outdoorBinsPresent: false
    },
    wasteStreamsAssessment: {
      assessments: [],
      totalAnnualCost: 0
    },
    specialWasteManagement: {
      batteryCollection: { type: 'Battery Collection', status: YesNoPlanned.NO },
      weeeCollection: { type: 'WEEE Collection', status: YesNoPlanned.NO },
      printerCartridges: { type: 'Printer Cartridges', status: YesNoPlanned.NO },
      fluorescentTubes: { type: 'Fluorescent Tubes', status: YesNoPlanned.NO },
      chemicalPaintStorage: { type: 'Chemical/Paint Storage', status: YesNoPlanned.NO },
      confidentialWasteShredding: { type: 'Confidential Waste Shredding', status: YesNoPlanned.NO },
      textilesCollection: { type: 'Textiles Collection', status: YesNoPlanned.NO },
      mobilePhoneRecycling: { type: 'Mobile Phone Recycling', status: YesNoPlanned.NO }
    },
    organicWasteComposting: {
      kitchenPresent: false,
      compostingSystem: CompostingSystem.NONE
    },
    wastePreventionMeasures: {
      procurementPolicy: ImplementationLevel.NOT_IMPLEMENTED,
      reusableCupsBottles: ImplementationLevel.NOT_IMPLEMENTED,
      waterFountainsRefillStations: ImplementationLevel.NOT_IMPLEMENTED,
      paperlessCommunication: ImplementationLevel.NOT_IMPLEMENTED,
      donationSystem: ImplementationLevel.NOT_IMPLEMENTED,
      repairCafe: ImplementationLevel.NOT_IMPLEMENTED,
      bulkBuying: ImplementationLevel.NOT_IMPLEMENTED,
      eliminateSingleUse: ImplementationLevel.NOT_IMPLEMENTED
    },
    behavioralTraining: {
      wasteChampionAppointed: false,
      userEducationMaterialsDisplayed: false,
      wasteMonitoringRecordsKept: MonitoringFrequency.NEVER,
      feedbackMechanism: FeedbackMechanism.NONE
    },
    completedSections: 0,
    isQuickMode: false,
    syncStatus: 'offline'
  });

  const [currentSection, setCurrentSection] = useState(0);
  const [isQuickMode, setIsQuickMode] = useState(false);
  const [progress, setProgress] = useState<FormProgress>({
    sections: [],
    overallCompletion: 0,
    requiredPhotos: 0,
    uploadedPhotos: 0,
    estimatedTimeRemaining: 45,
    qualityScore: 0
  });

  // Initialize with any passed data
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  // Auto-save functionality
  useEffect(() => {
    const autoSaveTimer = setInterval(() => {
      if (onAutoSave && formData) {
        onAutoSave(formData);
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(autoSaveTimer);
  }, [formData, onAutoSave]);

  // Update form data helper
  const updateFormData = useCallback((section: keyof WasteAuditData, updates: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        ...updates
      }
    }));
  }, []);

  // Add new bin to inventory
  const addBinToInventory = () => {
    const newBin: BinInventoryItem = {
      id: `bin_${Date.now()}`,
      location: BinLocation.OTHER,
      binType: BinType.GENERAL_WASTE,
      sizeInLitres: BinSize.SIZE_120L,
      colour: BinColour.BLACK_GREY,
      lidType: LidType.OPEN_TOP,
      signagePresent: false,
      signageQuality: 1
    };

    const currentBins = formData.facilityInfrastructure?.binInventory || [];
    updateFormData('facilityInfrastructure', {
      binInventory: [...currentBins, newBin],
      totalBins: currentBins.length + 1
    });
  };

  // Remove bin from inventory
  const removeBinFromInventory = (binId: string) => {
    const currentBins = formData.facilityInfrastructure?.binInventory || [];
    const updatedBins = currentBins.filter(bin => bin.id !== binId);
    
    updateFormData('facilityInfrastructure', {
      binInventory: updatedBins,
      totalBins: updatedBins.length
    });
  };

  // Update bin in inventory
  const updateBinInInventory = (binId: string, updates: Partial<BinInventoryItem>) => {
    const currentBins = formData.facilityInfrastructure?.binInventory || [];
    const updatedBins = currentBins.map(bin => 
      bin.id === binId ? { ...bin, ...updates } : bin
    );
    
    updateFormData('facilityInfrastructure', {
      binInventory: updatedBins
    });
  };

  // Section navigation
  const sections = [
    'Facility Waste Infrastructure',
    'Waste Streams Assessment', 
    'Special Waste Management',
    'Organic Waste & Composting',
    'Waste Prevention Measures',
    'Behavioral & Training'
  ];

  const goToSection = (sectionIndex: number) => {
    setCurrentSection(sectionIndex);
  };

  const nextSection = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
    }
  };

  const previousSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  // Section A: Facility Waste Infrastructure
  const renderFacilityInfrastructure = () => (
    <div className="space-y-6">
      <AuditSection 
        variant="infrastructure"
        title="Section A: Facility Waste Infrastructure"
        description="Document all waste bins and their current setup"
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg">Bin Inventory</CardTitle>
          <Button 
            onClick={addBinToInventory}
            variant="default"
            size="sm"
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Bin
          </Button>
        </CardHeader>
        <CardContent>

      <div className="space-y-4">
        {formData.facilityInfrastructure?.binInventory?.map((bin, index) => (
          <Card key={bin.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-base">Bin #{index + 1}</CardTitle>
              <Button 
                onClick={() => removeBinFromInventory(bin.id!)}
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive/90 gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Remove
              </Button>
            </CardHeader>
            <CardContent>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor={`location-${bin.id}`}>Location</Label>
                <Select
                  value={bin.location}
                  onValueChange={(value) => updateBinInInventory(bin.id!, { location: value as BinLocation })}
                >
                  <SelectTrigger id={`location-${bin.id}`}>
                    <SelectValue placeholder="Select location..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={BinLocation.KITCHEN}>Kitchen</SelectItem>
                    <SelectItem value={BinLocation.MAIN_HALL}>Main Hall</SelectItem>
                    <SelectItem value={BinLocation.TOILETS}>Toilets</SelectItem>
                    <SelectItem value={BinLocation.OUTDOOR}>Outdoor</SelectItem>
                    <SelectItem value={BinLocation.OFFICE}>Office</SelectItem>
                    <SelectItem value={BinLocation.OTHER}>Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Bin Type */}
              <div className="space-y-2">
                <Label htmlFor={`type-${bin.id}`}>Bin Type</Label>
                <Select
                  value={bin.binType}
                  onValueChange={(value) => updateBinInInventory(bin.id!, { binType: value as BinType })}
                >
                  <SelectTrigger id={`type-${bin.id}`}>
                    <SelectValue placeholder="Select bin type..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={BinType.GENERAL_WASTE}>General Waste</SelectItem>
                    <SelectItem value={BinType.DRY_RECYCLABLES}>Dry Recyclables</SelectItem>
                    <SelectItem value={BinType.ORGANIC_COMPOST}>Organic/Compost</SelectItem>
                    <SelectItem value={BinType.GLASS}>Glass</SelectItem>
                    <SelectItem value={BinType.BATTERIES}>Batteries</SelectItem>
                    <SelectItem value={BinType.WEEE}>WEEE</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Size */}
              <div className="space-y-2">
                <Label htmlFor={`size-${bin.id}`}>Size (Litres)</Label>
                <Select
                  value={bin.sizeInLitres.toString()}
                  onValueChange={(value) => updateBinInInventory(bin.id!, { sizeInLitres: parseInt(value) })}
                >
                  <SelectTrigger id={`size-${bin.id}`}>
                    <SelectValue placeholder="Select size..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={BinSize.SIZE_60L.toString()}>60L</SelectItem>
                    <SelectItem value={BinSize.SIZE_120L.toString()}>120L</SelectItem>
                    <SelectItem value={BinSize.SIZE_240L.toString()}>240L</SelectItem>
                    <SelectItem value={BinSize.SIZE_660L.toString()}>660L</SelectItem>
                    <SelectItem value={BinSize.SIZE_1100L.toString()}>1100L</SelectItem>
                    <SelectItem value={BinSize.OTHER.toString()}>Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Colour */}
              <div className="space-y-2">
                <Label htmlFor={`colour-${bin.id}`}>Colour</Label>
                <Select
                  value={bin.colour}
                  onValueChange={(value) => updateBinInInventory(bin.id!, { colour: value as BinColour })}
                >
                  <SelectTrigger id={`colour-${bin.id}`}>
                    <SelectValue placeholder="Select colour..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={BinColour.BLACK_GREY}>Black/Grey</SelectItem>
                    <SelectItem value={BinColour.BLUE}>Blue</SelectItem>
                    <SelectItem value={BinColour.GREEN}>Green</SelectItem>
                    <SelectItem value={BinColour.BROWN}>Brown</SelectItem>
                    <SelectItem value={BinColour.OTHER}>Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Lid Type */}
              <div className="space-y-2">
                <Label htmlFor={`lid-${bin.id}`}>Lid Type</Label>
                <Select
                  value={bin.lidType}
                  onValueChange={(value) => updateBinInInventory(bin.id!, { lidType: value as LidType })}
                >
                  <SelectTrigger id={`lid-${bin.id}`}>
                    <SelectValue placeholder="Select lid type..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={LidType.OPEN_TOP}>Open Top</SelectItem>
                    <SelectItem value={LidType.FLIP_LID}>Flip Lid</SelectItem>
                    <SelectItem value={LidType.RESTRICTED_OPENING}>Restricted Opening</SelectItem>
                    <SelectItem value={LidType.LOCKED}>Locked</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Signage Present */}
              <div className="space-y-2">
                <Label>Signage Present</Label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name={`signage-${bin.id}`}
                      checked={bin.signagePresent === true}
                      onChange={() => updateBinInInventory(bin.id!, { signagePresent: true })}
                      className="h-4 w-4"
                    />
                    <span className="text-sm">Yes</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name={`signage-${bin.id}`}
                      checked={bin.signagePresent === false}
                      onChange={() => updateBinInInventory(bin.id!, { signagePresent: false })}
                      className="h-4 w-4"
                    />
                    <span className="text-sm">No</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Signage Quality - only show if signage present */}
            {bin.signagePresent && (
              <div className="mt-4 space-y-2">
                <Label>
                  Signage Quality (1=Poor/Missing, 5=Excellent/Multilingual)
                </Label>
                <div className="flex gap-4">
                  {[1, 2, 3, 4, 5].map(rating => (
                    <label key={rating} className="flex items-center space-x-1">
                      <input
                        type="radio"
                        name={`quality-${bin.id}`}
                        value={rating}
                        checked={bin.signageQuality === rating}
                        onChange={() => updateBinInInventory(bin.id!, { signageQuality: rating })}
                        className="h-4 w-4"
                      />
                      <span className="text-sm font-medium">{rating}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Photo Upload */}
            <div className="mt-6 space-y-2">
              <Label>Bin Photo</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                {bin.photoPath ? (
                  <div className="space-y-3">
                    <img src={bin.photoPath} alt={`Bin ${index + 1}`} className="max-w-32 max-h-32 mx-auto rounded-md" />
                    <Button 
                      onClick={() => updateBinInInventory(bin.id!, { photoPath: undefined })}
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive/90"
                    >
                      Remove Photo
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Camera className="h-8 w-8 mx-auto text-muted-foreground" />
                    <p className="text-muted-foreground text-sm">Upload photo of bin</p>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Camera className="h-4 w-4" />
                      Choose Photo
                    </Button>
                  </div>
                )}
              </div>
            </div>
            </CardContent>
          </Card>
        ))}

        {formData.facilityInfrastructure?.binInventory?.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8 text-center">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Plus className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">No bins added yet. Click "Add Bin" to start documenting your waste infrastructure.</p>
            </CardContent>
          </Card>
        )}
      </div>
      </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Infrastructure Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col space-y-2">
              <span className="text-sm text-muted-foreground">Total Bins</span>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-lg font-semibold">
                  {formData.facilityInfrastructure?.totalBins || 0}
                </Badge>
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              <span className="text-sm text-muted-foreground">General Waste</span>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {formData.facilityInfrastructure?.binInventory?.filter(b => b.binType === BinType.GENERAL_WASTE).length || 0}
                </Badge>
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              <span className="text-sm text-muted-foreground">Recyclables</span>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {formData.facilityInfrastructure?.binInventory?.filter(b => b.binType === BinType.DRY_RECYCLABLES).length || 0}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Section B: Waste Streams Assessment (simplified for now)
  const renderWasteStreamsAssessment = () => (
    <div className="space-y-6">
      <AuditSection 
        variant="assessment"
        title="Section B: Waste Streams Assessment"
        description="Assess each waste stream's volume, collection, and contamination"
      />
      
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-4">
          <div className="rounded-full bg-muted p-4">
            <RotateCcw className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <p className="text-muted-foreground font-medium">Waste streams assessment form coming next...</p>
            <p className="text-sm text-muted-foreground">Will include: General waste, Dry recyclables, Organic, Glass, Hazardous</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Other sections (simplified placeholders for now)
  const renderSpecialWasteManagement = () => (
    <div className="space-y-6">
      <AuditSection 
        variant="special"
        title="Section C: Special Waste Management"
        description="Document special waste collection arrangements"
      />
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-4">
          <div className="rounded-full bg-muted p-4">
            <RotateCcw className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground font-medium">Special waste management form coming next...</p>
        </CardContent>
      </Card>
    </div>
  );

  const renderOrganicWasteComposting = () => (
    <div className="space-y-6">
      <AuditSection 
        variant="organic"
        title="Section D: Organic Waste & Composting"
        description="Assess kitchen waste and composting systems"
      />
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-4">
          <div className="rounded-full bg-muted p-4">
            <RotateCcw className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground font-medium">Organic waste & composting form coming next...</p>
        </CardContent>
      </Card>
    </div>
  );

  const renderWastePreventionMeasures = () => (
    <div className="space-y-6">
      <AuditSection 
        variant="prevention"
        title="Section E: Waste Prevention Measures"
        description="Rate implementation of waste prevention initiatives"
      />
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-4">
          <div className="rounded-full bg-muted p-4">
            <RotateCcw className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground font-medium">Waste prevention measures form coming next...</p>
        </CardContent>
      </Card>
    </div>
  );

  const renderBehavioralTraining = () => (
    <div className="space-y-6">
      <AuditSection 
        variant="training"
        title="Section F: Behavioral & Training"
        description="Document training and user engagement efforts"
      />
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-4">
          <div className="rounded-full bg-muted p-4">
            <RotateCcw className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground font-medium">Behavioral & training form coming next...</p>
        </CardContent>
      </Card>
    </div>
  );

  // Render current section
  const renderCurrentSection = () => {
    switch (currentSection) {
      case 0: return renderFacilityInfrastructure();
      case 1: return renderWasteStreamsAssessment();
      case 2: return renderSpecialWasteManagement();
      case 3: return renderOrganicWasteComposting();
      case 4: return renderWastePreventionMeasures();
      case 5: return renderBehavioralTraining();
      default: return renderFacilityInfrastructure();
    }
  };

  return (
    <Card className="max-w-6xl mx-auto">
      {/* Header */}
      <CardHeader className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-t-lg">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <CardTitle className="text-2xl">Waste Management Audit</CardTitle>
            <p className="text-primary-foreground/90">Comprehensive facility assessment</p>
          </div>
          <div className="text-right">
            <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground border-0">
              Section {currentSection + 1} of {sections.length}
            </Badge>
          </div>
        </div>
      </CardHeader>

      {/* Progress Bar */}
      <CardContent className="pt-6 pb-0">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium">Overall Progress</span>
          <Badge variant="outline">{Math.round((currentSection / sections.length) * 100)}% Complete</Badge>
        </div>
        <Progress 
          value={(currentSection / sections.length) * 100} 
          className="w-full h-3"
        />
      </CardContent>

      {/* Section Navigation Tabs */}
      <Tabs value={currentSection.toString()} onValueChange={(value) => setCurrentSection(parseInt(value))} className="w-full">
        <TabsList className="grid w-full grid-cols-6 h-auto p-1">
          {sections.map((section, index) => (
            <TabsTrigger
              key={index}
              value={index.toString()}
              className="text-xs sm:text-sm px-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <span className="hidden sm:inline">{index + 1}. </span>
              <span className="truncate">{section}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Quick Mode Toggle */}
      <div className="px-6 py-4 bg-muted/50 border-b">
        <div className="flex items-center justify-between">
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={isQuickMode}
                onChange={(e) => setIsQuickMode(e.target.checked)}
                className="h-4 w-4 rounded border-input"
              />
              <span className="text-sm font-medium">Quick Mode</span>
            </label>
            <p className="text-xs text-muted-foreground mt-1">Show only essential fields for faster completion</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="link" size="sm" className="h-auto p-0">
              Save & Continue Later
            </Button>
            <Badge variant={formData.syncStatus === 'synced' ? 'default' : 'secondary'} className="text-xs">
              {formData.syncStatus === 'synced' ? '✓ Synced' : 
               formData.syncStatus === 'pending' ? '⏳ Syncing...' : '📴 Offline'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="p-6">
        {renderCurrentSection()}
      </div>

      {/* Navigation Footer */}
      <div className="px-6 py-4 bg-muted/50 rounded-b-lg border-t flex justify-between items-center">
        <Button
          onClick={previousSection}
          disabled={currentSection === 0}
          variant="secondary"
        >
          Previous
        </Button>

        <div className="text-sm text-muted-foreground">
          Estimated time remaining: {Math.max(0, 45 - (currentSection * 7))} minutes
        </div>

        <div className="flex space-x-2">
          <Button
            onClick={() => onSave && onSave(formData)}
            variant="outline"
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            Save Progress
          </Button>
          
          {currentSection < sections.length - 1 ? (
            <Button
              onClick={nextSection}
              className="gap-2"
            >
              Next Section
            </Button>
          ) : (
            <Button
              onClick={() => onSave && onSave(formData)}
              className="gap-2"
            >
              Complete Audit
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}