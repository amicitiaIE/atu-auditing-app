'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

interface AuditCreationFormProps {
  onAuditCreated: (auditId: number) => void;
}

export default function AuditCreationForm({ onAuditCreated }: AuditCreationFormProps) {
  const [formData, setFormData] = useState({
    centreName: '',
    auditDate: new Date().toISOString().split('T')[0], // Today's date
    auditorName: ''
  });
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  const communitycenters = [
    'Ballyfermot Community Centre',
    'Clondalkin Community Centre',
    'Inchicore Community Centre',
    'Cherry Orchard Community Centre'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!formData.centreName || !formData.auditDate || !formData.auditorName) {
      setError('All fields are required');
      return;
    }

    setIsCreating(true);

    try {
      // Create main audit record first
      const response = await fetch('/api/audit/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          centre_name: formData.centreName,
          audit_date: formData.auditDate,
          auditor_name: formData.auditorName
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create audit');
      }

      const result = await response.json();
      onAuditCreated(result.auditId);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create audit');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-xl">Start New Audit</CardTitle>
        <CardDescription>
          Begin a comprehensive waste management assessment
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Community Centre Selection */}
          <div className="space-y-2">
            <Label htmlFor="centre-select">Community Centre</Label>
            <Select
              value={formData.centreName}
              onValueChange={(value) => setFormData(prev => ({ ...prev, centreName: value }))}
              required
            >
              <SelectTrigger id="centre-select">
                <SelectValue placeholder="Select a centre..." />
              </SelectTrigger>
              <SelectContent>
                {communitycenters.map(centre => (
                  <SelectItem key={centre} value={centre}>
                    {centre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Audit Date */}
          <div className="space-y-2">
            <Label htmlFor="audit-date">Audit Date</Label>
            <Input
              id="audit-date"
              type="date"
              value={formData.auditDate}
              onChange={(e) => setFormData(prev => ({ ...prev, auditDate: e.target.value }))}
              required
            />
          </div>

          {/* Auditor Name */}
          <div className="space-y-2">
            <Label htmlFor="auditor-name">Auditor Name</Label>
            <Input
              id="auditor-name"
              type="text"
              value={formData.auditorName}
              onChange={(e) => setFormData(prev => ({ ...prev, auditorName: e.target.value }))}
              placeholder="Enter your full name"
              required
            />
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            disabled={isCreating} 
            className="w-full"
            size="lg"
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Audit...
              </>
            ) : (
              'Start Waste Audit'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}