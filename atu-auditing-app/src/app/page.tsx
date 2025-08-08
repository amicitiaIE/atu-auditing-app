'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import AuditCreationForm from '@/components/AuditCreationForm';
import WasteAuditForm from '@/components/WasteAuditForm';
import { WasteAuditData, SaveWasteAuditRequest } from '@/types/waste';

/**
 * Main Page Component
 * The entry point of the Community Audit Application
 * Handles the flow from audit creation to waste audit completion
 */
export default function Home() {
  const [currentAuditId, setCurrentAuditId] = useState<number | null>(null);
  const [auditInfo, setAuditInfo] = useState<{
    centreName: string;
    auditDate: string;
    auditorName: string;
  } | null>(null);

  // Handle audit creation
  const handleAuditCreated = (auditId: number) => {
    setCurrentAuditId(auditId);
  };

  // Handle saving waste audit data
  const handleSaveWasteAudit = async (wasteAuditData: Partial<WasteAuditData>) => {
    if (!currentAuditId) return;

    try {
      const request: SaveWasteAuditRequest = {
        auditId: currentAuditId,
        wasteAuditData,
        isAutoSave: false
      };

      const response = await fetch('/api/waste-audit/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      });

      const result = await response.json();

      if (result.success) {
        alert('Audit saved successfully!');
      } else {
        alert('Error saving audit: ' + (result.validationErrors?.join(', ') || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error saving waste audit:', error);
      alert('Failed to save audit. Please try again.');
    }
  };

  // Handle auto-saving waste audit data
  const handleAutoSaveWasteAudit = async (wasteAuditData: Partial<WasteAuditData>) => {
    if (!currentAuditId) return;

    try {
      const request: SaveWasteAuditRequest = {
        auditId: currentAuditId,
        wasteAuditData,
        isAutoSave: true
      };

      await fetch('/api/waste-audit/autosave', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      });

      // Auto-save is silent - no user notification
    } catch (error) {
      console.error('Auto-save failed:', error);
      // Store in localStorage as fallback
      if (typeof window !== 'undefined') {
        localStorage.setItem(`audit_${currentAuditId}_backup`, JSON.stringify({
          auditId: currentAuditId,
          wasteAuditData,
          timestamp: new Date().toISOString()
        }));
      }
    }
  };

  // Reset to start new audit
  const handleStartNewAudit = () => {
    setCurrentAuditId(null);
    setAuditInfo(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Application Header */}
      <Header />
      
      {/* Main Content Container */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Community Center Environmental Audit
              </h1>
              <p className="text-gray-600">
                Comprehensive waste management assessment for community centers
              </p>
              {auditInfo && (
                <div className="mt-3 text-sm text-blue-600">
                  <p><strong>Center:</strong> {auditInfo.centreName}</p>
                  <p><strong>Date:</strong> {auditInfo.auditDate}</p>
                  <p><strong>Auditor:</strong> {auditInfo.auditorName}</p>
                </div>
              )}
            </div>
            {currentAuditId && (
              <button
                onClick={handleStartNewAudit}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Start New Audit
              </button>
            )}
          </div>
        </div>

        {/* Conditional Content Based on Audit State */}
        {!currentAuditId ? (
          // Show audit creation form
          <div className="space-y-6">
            <div className="text-center py-8">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">
                Ready to begin your waste audit?
              </h2>
              <p className="text-gray-600 mb-8">
                Our comprehensive audit tool will guide you through documenting your facility's
                waste infrastructure, streams, and management practices.
              </p>
            </div>
            
            <AuditCreationForm onAuditCreated={handleAuditCreated} />
            
            {/* Features Preview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-blue-600 text-2xl mb-3">🗂️</div>
                <h3 className="font-semibold text-gray-800 mb-2">Infrastructure Assessment</h3>
                <p className="text-sm text-gray-600">
                  Document all waste bins, signage quality, and facility setup
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-green-600 text-2xl mb-3">📊</div>
                <h3 className="font-semibold text-gray-800 mb-2">Waste Stream Analysis</h3>
                <p className="text-sm text-gray-600">
                  Track volumes, costs, and contamination levels across all waste types
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-purple-600 text-2xl mb-3">💡</div>
                <h3 className="font-semibold text-gray-800 mb-2">Smart Recommendations</h3>
                <p className="text-sm text-gray-600">
                  Get personalized quick wins and improvement suggestions
                </p>
              </div>
            </div>
          </div>
        ) : (
          // Show waste audit form
          <WasteAuditForm
            auditId={currentAuditId}
            onSave={handleSaveWasteAudit}
            onAutoSave={handleAutoSaveWasteAudit}
          />
        )}
      </main>
    </div>
  );
}