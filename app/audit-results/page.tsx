/**
 * Audit Results Page - Placeholder
 * 
 * Full implementation on Day 3
 * This page shows the audit analysis results and recommendations
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader } from 'lucide-react';
import { getStoredAuditInput } from '@/lib/storage';
import { AuditInput } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { formatCurrency, calculateAnnual } from '@/lib/utils';

export default function AuditResultsPage() {
  const router = useRouter();
  const [auditInput, setAuditInput] = useState<AuditInput | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const input = getStoredAuditInput();
    if (!input) {
      router.push('/spend-input');
    } else {
      setAuditInput(input);
    }
    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!auditInput) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <Card className="text-center">
          <p className="text-slate-600 mb-6">No audit data found. Redirecting...</p>
          <Button onClick={() => router.push('/spend-input')}>
            <ArrowLeft className="w-4 h-4" />
            Back to Spend Input
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="outline"
            className="mb-6"
            onClick={() => router.push('/spend-input')}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
            Your Spend Audit Results
          </h1>
          <p className="text-lg text-slate-600">
            📊 Analysis complete. See your spending insights below.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card>
            <h3 className="text-sm font-semibold text-slate-600 mb-2">Total Monthly Spend</h3>
            <p className="text-3xl font-bold text-slate-900">
              {formatCurrency(auditInput.totalMonthlySpend)}
            </p>
            <p className="text-sm text-slate-500 mt-2">
              Annual: {formatCurrency(auditInput.totalAnnualSpend)}
            </p>
          </Card>

          <Card>
            <h3 className="text-sm font-semibold text-slate-600 mb-2">Total Seats Across All Tools</h3>
            <p className="text-3xl font-bold text-slate-900">{auditInput.totalSeats}</p>
            <p className="text-sm text-slate-500 mt-2">
              {auditInput.entries.length} tool{auditInput.entries.length !== 1 ? 's' : ''}
            </p>
          </Card>
        </div>

        {/* Tools Summary */}
        <Card className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Tools Analyzed</h2>
          <div className="space-y-4">
            {auditInput.entries.map((entry) => (
              <div key={entry.id} className="border border-slate-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-slate-900">{entry.tool}</h4>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    {entry.plan}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-slate-600">Monthly</p>
                    <p className="font-semibold text-slate-900">
                      {formatCurrency(entry.monthlySpend)}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-600">Annual</p>
                    <p className="font-semibold text-slate-900">
                      {formatCurrency(calculateAnnual(entry.monthlySpend))}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-600">Seats</p>
                    <p className="font-semibold text-slate-900">{entry.numberOfSeats}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Use Case</p>
                    <p className="font-semibold text-slate-900 capitalize">{entry.primaryUseCase}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Coming Soon Alert */}
        <Card className="bg-blue-50 border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-3">🚀 Full Analysis Coming Soon</h3>
          <p className="text-blue-900 mb-4">
            Day 3 will include:
          </p>
          <ul className="list-disc list-inside space-y-2 text-blue-900">
            <li>Overspending analysis with detailed breakdowns</li>
            <li>Plan downgrade recommendations and savings estimates</li>
            <li>Alternative tool suggestions based on your use case</li>
            <li>Total potential savings calculation</li>
            <li>Interactive savings scenarios</li>
            <li>Export and share functionality</li>
          </ul>
        </Card>

        {/* Back Button */}
        <div className="mt-12">
          <Button
            onClick={() => router.push('/spend-input')}
            variant="outline"
            className="w-full"
            size="lg"
          >
            <ArrowLeft className="w-4 h-4" />
            Add More Tools or Start Over
          </Button>
        </div>
      </div>
    </div>
  );
}
