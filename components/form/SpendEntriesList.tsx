/**
 * SpendEntriesList Component
 * 
 * Displays all submitted spend entries in a clean list/table format
 * Features:
 * - Shows all saved entries
 * - Edit and delete functionality
 * - Cost summary and totals
 * - Responsive design (mobile-friendly)
 */

'use client';

import React from 'react';
import { Edit2, Trash2, AlertCircle } from 'lucide-react';
import { SpendEntry } from '@/lib/types';
import { getToolConfig } from '@/lib/config';
import { formatCurrency, calculateAnnual } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface SpendEntriesListProps {
  entries: SpendEntry[];
  onEdit?: (entry: SpendEntry) => void;
  onDelete?: (entryId: string) => void;
  isEditing?: boolean;
}

export const SpendEntriesList: React.FC<SpendEntriesListProps> = ({
  entries,
  onEdit,
  onDelete,
  isEditing = false,
}) => {
  if (entries.length === 0) {
    return (
      <Card className="bg-slate-50 border-dashed">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="w-12 h-12 text-slate-400 mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            No tools added yet
          </h3>
          <p className="text-slate-600">
            Add your first AI tool to get started with the spend audit
          </p>
        </div>
      </Card>
    );
  }

  // Calculate totals
  const totalMonthlySpend = entries.reduce((sum, e) => sum + e.monthlySpend, 0);
  const totalAnnualSpend = calculateAnnual(totalMonthlySpend);
  const totalSeats = entries.reduce((sum, e) => sum + e.numberOfSeats, 0);

  return (
    <div className="space-y-4">
      {/* Entries List */}
      <div className="space-y-3">
        {entries.map((entry) => {
          const toolConfig = getToolConfig(entry.tool);
          const toolName = toolConfig?.name || entry.tool;
          const annualSpend = calculateAnnual(entry.monthlySpend);

          return (
            <Card
              key={entry.id}
              className="hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                {/* Entry Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-slate-900 text-lg">
                      {toolName}
                    </h4>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      {entry.plan}
                    </span>
                  </div>

                  {/* Grid of details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <p className="text-slate-600">Monthly Spend</p>
                      <p className="font-semibold text-slate-900">
                        {formatCurrency(entry.monthlySpend)}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-600">Annual Spend</p>
                      <p className="font-semibold text-slate-900">
                        {formatCurrency(annualSpend)}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-600">Seats</p>
                      <p className="font-semibold text-slate-900">
                        {entry.numberOfSeats}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-600">Use Case</p>
                      <p className="font-semibold text-slate-900 capitalize">
                        {entry.primaryUseCase}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-shrink-0">
                  {onEdit && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(entry)}
                      disabled={isEditing}
                      title="Edit entry"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => onDelete(entry.id)}
                      disabled={isEditing}
                      title="Delete entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Summary Card */}
      <Card className="bg-slate-50 border-slate-300">
        <div className="space-y-3">
          <h3 className="font-semibold text-slate-900">Spend Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-slate-600 text-sm">Total Monthly</p>
              <p className="text-2xl font-bold text-slate-900">
                {formatCurrency(totalMonthlySpend)}
              </p>
            </div>
            <div>
              <p className="text-slate-600 text-sm">Total Annual</p>
              <p className="text-2xl font-bold text-slate-900">
                {formatCurrency(totalAnnualSpend)}
              </p>
            </div>
            <div>
              <p className="text-slate-600 text-sm">Total Seats</p>
              <p className="text-2xl font-bold text-slate-900">{totalSeats}</p>
            </div>
            <div>
              <p className="text-slate-600 text-sm">Tools Added</p>
              <p className="text-2xl font-bold text-slate-900">
                {entries.length}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SpendEntriesList;
