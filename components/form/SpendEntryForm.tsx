/**
 * SpendEntryForm Component
 * 
 * Main form for submitting a single AI tool spend entry
 * Features:
 * - Dynamic plan selection based on tool choice
 * - Real-time cost calculation
 * - Form validation with Zod
 * - localStorage persistence
 * - Accessible form with proper error handling
 * 
 * Architecture:
 * - Separates form logic from presentation
 * - Uses React Hook Form for state management
 * - Validates with Zod schemas
 * - Persists drafts to localStorage
 */

'use client';

import React, { useEffect, useMemo } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Trash2, Plus } from 'lucide-react';

import { SpendEntryFormSchema, SpendEntryFormInput } from '@/lib/schemas';
import {
  AI_TOOLS_CONFIG,
  USE_CASES,
  getToolPlans,
  calculateMonthlyCost,
} from '@/lib/config';
import { saveFormDraft, getFormDraft, clearFormDraft } from '@/lib/storage';
import { formatCurrency, cn } from '@/lib/utils';

import { Label } from '@/components/ui/Label';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { FormField } from './FormField';

interface SpendEntryFormProps {
  onSubmit: (data: SpendEntryFormInput) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  showCostCalculator?: boolean;
}

export const SpendEntryForm: React.FC<SpendEntryFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
  showCostCalculator = true,
}) => {
  const methods = useForm<SpendEntryFormInput>({
    resolver: zodResolver(SpendEntryFormSchema),
    mode: 'onChange',
    defaultValues: {
      tool: '',
      plan: '',
      monthlySpend: '' as any,
      numberOfSeats: '' as any,
      teamSize: '' as any,
      primaryUseCase: '' as any,
    },
  });

  const { watch, reset, handleSubmit, formState: { isValid, isDirty } } = methods;

  // Watch form values for dynamic updates
  const selectedTool = watch('tool');
  const numberOfSeats = watch('numberOfSeats');
  const monthlySpend = watch('monthlySpend');
  const plan = watch('plan');

  // Get available plans based on selected tool
  const availablePlans = useMemo(() => {
    if (!selectedTool) return [];
    return getToolPlans(selectedTool);
  }, [selectedTool]);

  // Calculate estimated monthly cost
  const estimatedCost = useMemo(() => {
    if (!selectedTool || !plan || !numberOfSeats) return null;
    return calculateMonthlyCost(
      selectedTool,
      plan,
      parseInt(numberOfSeats as unknown as string, 10)
    );
  }, [selectedTool, plan, numberOfSeats]);

  // Load form draft on mount
  useEffect(() => {
    const draft = getFormDraft();
    if (draft) {
      reset(draft as any);
    }
  }, [reset]);

  // Save form draft on change (debounce by using a useEffect with isDirty)
  useEffect(() => {
    if (isDirty) {
      const timer = setTimeout(() => {
        const currentValues = methods.getValues();
        saveFormDraft(currentValues);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isDirty, methods]);

  const handleFormSubmit = handleSubmit((data) => {
    onSubmit(data);
    // Don't clear draft until successful submission
  });

  const handleReset = () => {
    reset();
    clearFormDraft();
  };

  // Convert tool config to Select options
  const toolOptions = AI_TOOLS_CONFIG.map((tool) => ({
    value: tool.id,
    label: tool.name,
    description: tool.description,
  }));

  // Convert use cases to Select options
  const useCaseOptions = USE_CASES.map((useCase) => ({
    value: useCase.value,
    label: useCase.label,
    description: useCase.description,
  }));

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleFormSubmit} className="space-y-6">
        {/* AI Tool Selection */}
        <FormField
          name="tool"
          label="AI Tool"
          required
          description="Select the AI tool your team uses"
        >
          <Select
            {...methods.register('tool')}
            options={toolOptions}
            placeholder="Select an AI tool..."
            error={!!methods.formState.errors.tool}
            errorMessage={methods.formState.errors.tool?.message}
          />
        </FormField>

        {/* Plan Selection - only shows when tool is selected */}
        {selectedTool && (
          <FormField
            name="plan"
            label="Pricing Plan"
            required
            description="Select the plan your team is currently using"
          >
            <Select
              {...methods.register('plan')}
              options={availablePlans.map((p) => ({
                value: p.id,
                label: p.name,
                description: p.description,
              }))}
              placeholder="Select a plan..."
              error={!!methods.formState.errors.plan}
              errorMessage={methods.formState.errors.plan?.message}
            />
          </FormField>
        )}

        {/* Monthly Spend */}
        <FormField
          name="monthlySpend"
          label="Monthly Spend"
          required
          description="Enter your current monthly spending (USD)"
        >
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
              $
            </span>
            <Input
              {...methods.register('monthlySpend')}
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              className="pl-7"
              error={!!methods.formState.errors.monthlySpend}
              errorMessage={methods.formState.errors.monthlySpend?.message}
            />
          </div>
        </FormField>

        {/* Number of Seats */}
        <FormField
          name="numberOfSeats"
          label="Number of Seats"
          required
          description="How many team members use this tool"
        >
          <Input
            {...methods.register('numberOfSeats')}
            type="number"
            min="1"
            placeholder="1"
            error={!!methods.formState.errors.numberOfSeats}
            errorMessage={methods.formState.errors.numberOfSeats?.message}
          />
        </FormField>

        {/* Team Size */}
        <FormField
          name="teamSize"
          label="Total Team Size"
          required
          description="Total number of people in your organization"
        >
          <Input
            {...methods.register('teamSize')}
            type="number"
            min="1"
            placeholder="1"
            error={!!methods.formState.errors.teamSize}
            errorMessage={methods.formState.errors.teamSize?.message}
          />
        </FormField>

        {/* Primary Use Case */}
        <FormField
          name="primaryUseCase"
          label="Primary Use Case"
          required
          description="What is the main use case for this tool in your team"
        >
          <Select
            {...methods.register('primaryUseCase')}
            options={useCaseOptions}
            placeholder="Select a use case..."
            error={!!methods.formState.errors.primaryUseCase}
            errorMessage={methods.formState.errors.primaryUseCase?.message}
          />
        </FormField>

        {/* Cost Calculator - Shows estimated vs reported spend */}
        {showCostCalculator && selectedTool && plan && numberOfSeats && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-3">Cost Analysis</h4>
            <div className="space-y-2 text-sm text-blue-900">
              <div className="flex justify-between">
                <span>Calculated monthly cost:</span>
                <span className="font-semibold">
                  {estimatedCost
                    ? formatCurrency(estimatedCost)
                    : formatCurrency(0)}
                </span>
              </div>
              {monthlySpend && estimatedCost && (
                <>
                  <div className="flex justify-between">
                    <span>Your reported spend:</span>
                    <span className="font-semibold">
                      {formatCurrency(parseInt(monthlySpend as unknown as string, 10))}
                    </span>
                  </div>
                  <div
                    className={cn('flex justify-between pt-2 border-t border-blue-200', {
                      'text-green-700': parseInt(monthlySpend as unknown as string, 10) === estimatedCost,
                      'text-orange-700': parseInt(monthlySpend as unknown as string, 10) > estimatedCost,
                      'text-blue-700': parseInt(monthlySpend as unknown as string, 10) < estimatedCost,
                    })}
                  >
                    <span className="font-semibold">Difference:</span>
                    <span className="font-semibold">
                      {estimatedCost && monthlySpend
                        ? formatCurrency(
                          parseInt(monthlySpend as unknown as string, 10) - estimatedCost
                        )
                        : formatCurrency(0)}
                    </span>
                  </div>
                  {parseInt(monthlySpend as unknown as string, 10) > estimatedCost && (
                    <p className="text-xs pt-2 text-orange-700">
                      ⚠️ You may be overpaying. Consider reviewing your plan options.
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex gap-3 pt-6">
          <Button
            type="submit"
            disabled={!isValid || isLoading}
            loading={isLoading}
            className="flex-1"
          >
            <Plus className="w-4 h-4" />
            Add Tool
          </Button>

          {isDirty && (
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={isLoading}
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </Button>
          )}

          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </FormProvider>
  );
};

export default SpendEntryForm;
