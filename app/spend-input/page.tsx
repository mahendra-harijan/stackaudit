/**
 * Spend Input Page
 * 
 * The main workflow page for Day 2
 * 
 * Features:
 * - Dynamic spend entry form
 * - Real-time list of added tools
 * - Cost summary and analysis
 * - localStorage persistence
 * - Navigation to audit results
 * - Mobile-responsive design
 * 
 * Architecture:
 * - Manages form and list state
 * - Coordinates localStorage operations
 * - Prepares audit data for backend
 * - Clean separation of concerns
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, CheckCircle } from 'lucide-react';

import {
  getStoredEntries,
  removeSpendEntry,
  saveAuditInput,
  saveAuditMetadata,
  hasUnsavedData,
} from '@/lib/storage';
import { SpendEntryFormInput } from '@/lib/schemas';
import { SpendEntry } from '@/lib/types';
import { saveSpendEntry } from '@/lib/storage';
import { prepareAuditInput } from '@/lib/audit';

import SpendEntryForm from '@/components/form/SpendEntryForm';
import SpendEntriesList from '@/components/form/SpendEntriesList';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Card } from '@/components/ui/Card';

interface SpendInputPageState {
  entries: SpendEntry[];
  isSubmittingForm: boolean;
  showSuccessMessage: boolean;
  isDraftMode: boolean;
}

export default function SpendInputPage() {
  const router = useRouter();
  const [state, setState] = useState<SpendInputPageState>({
    entries: [],
    isSubmittingForm: false,
    showSuccessMessage: false,
    isDraftMode: false,
  });

  // Load entries from localStorage on mount
  useEffect(() => {
    const storedEntries = getStoredEntries();
    setState((prev) => ({
      ...prev,
      entries: storedEntries,
      isDraftMode: hasUnsavedData(),
    }));
  }, []);

  /**
   * Handle form submission - add new entry
   */
  const handleFormSubmit = async (formData: SpendEntryFormInput) => {
    setState((prev) => ({
      ...prev,
      isSubmittingForm: true,
    }));

    try {
      // Save the entry to localStorage
      const newEntry = saveSpendEntry(formData);

      // Update local state
      setState((prev) => ({
        ...prev,
        entries: [...prev.entries, newEntry],
        showSuccessMessage: true,
        isDraftMode: true,
      }));

      // Clear success message after 3 seconds
      setTimeout(() => {
        setState((prev) => ({
          ...prev,
          showSuccessMessage: false,
        }));
      }, 3000);

      // Update metadata
      saveAuditMetadata({
        totalEntries: state.entries.length + 1,
        lastUpdated: new Date().toISOString(),
        status: 'draft',
      });
    } catch (error) {
      console.error('Failed to save entry:', error);
    } finally {
      setState((prev) => ({
        ...prev,
        isSubmittingForm: false,
      }));
    }
  };

  /**
   * Handle entry deletion
   */
  const handleDeleteEntry = (entryId: string) => {
    if (window.confirm('Are you sure you want to remove this entry?')) {
      removeSpendEntry(entryId);
      const updated = state.entries.filter((e) => e.id !== entryId);
      setState((prev) => ({
        ...prev,
        entries: updated,
      }));

      // Update metadata
      saveAuditMetadata({
        totalEntries: updated.length,
        lastUpdated: new Date().toISOString(),
        status: updated.length > 0 ? 'draft' : 'draft',
      });
    }
  };

  /**
   * Handle proceeding to audit results
   */
  const handleProceedToAudit = async () => {
    if (state.entries.length === 0) {
      alert('Please add at least one AI tool before proceeding.');
      return;
    }

    const auditInput = prepareAuditInput(state.entries);

    // Save audit input to localStorage
    saveAuditInput(auditInput);

    // Update metadata as submitted
    saveAuditMetadata({
      totalEntries: state.entries.length,
      lastUpdated: new Date().toISOString(),
      status: 'submitted',
    });

    // Navigate to audit results page
    // (Will be created on Day 3)
    router.push('/audit-results');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
            Start Your Spend Audit
          </h1>
          <p className="text-lg text-slate-600">
            Tell us about your AI tool spending. We&apos;ll analyze and find savings opportunities.
          </p>
        </div>

        {/* Success Alert */}
        {state.showSuccessMessage && (
          <Alert variant="success" className="mb-6" closable>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>Tool added successfully!</span>
            </div>
          </Alert>
        )}

        {/* Unsaved Changes Alert */}
        {state.isDraftMode && state.entries.length > 0 && (
          <Alert variant="info" className="mb-6" closable={false}>
            <span>📝 You have unsaved changes. Your data is being saved automatically.</span>
          </Alert>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form Column */}
          <div className="lg:col-span-2">
            <Card>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                Add AI Tool
              </h2>
              <SpendEntryForm
                onSubmit={handleFormSubmit}
                isLoading={state.isSubmittingForm}
                showCostCalculator={true}
              />
            </Card>
          </div>

          {/* Sidebar Column - Entries List */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-6">
              {/* Entries Summary */}
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-4">
                  Added Tools ({state.entries.length})
                </h2>
                <SpendEntriesList
                  entries={state.entries}
                  onDelete={handleDeleteEntry}
                  isEditing={state.isSubmittingForm}
                />
              </div>

              {/* CTA Button */}
              {state.entries.length > 0 && (
                <div className="space-y-3">
                  <Button
                    onClick={handleProceedToAudit}
                    disabled={state.isSubmittingForm}
                    className="w-full"
                    size="lg"
                  >
                    <ArrowRight className="w-4 h-4" />
                    Get Audit Results
                  </Button>
                  <p className="text-xs text-slate-500 text-center">
                    {state.entries.length} tool{state.entries.length !== 1 ? 's' : ''} added
                  </p>
                </div>
              )}

              {/* Info Card */}
              <Card className="bg-blue-50 border-blue-200">
                <h3 className="font-semibold text-blue-900 text-sm mb-3">
                  💡 Tip
                </h3>
                <p className="text-sm text-blue-900">
                  Add multiple tools to get comprehensive savings recommendations. The more data you provide, the more accurate the analysis.
                </p>
              </Card>
            </div>
          </div>
        </div>

        {/* FAQ Section - Future expansion point */}
        <div className="mt-16 pt-12 border-t border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">
            Common Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">
                Is my data secure?
              </h3>
              <p className="text-slate-600">
                Yes. All data is processed locally and never stored on our servers during the demo.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">
                Can I edit my entries?
              </h3>
              <p className="text-slate-600">
                You can delete entries and add new ones. We&apos;ll add full editing in the next release.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">
                What if I use multiple plans?
              </h3>
              <p className="text-slate-600">
                Add each plan as a separate entry. We&apos;ll analyze them individually and combined.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">
                How accurate are the recommendations?
              </h3>
              <p className="text-slate-600">
                Our analysis is based on current pricing. We continuously update as pricing changes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
