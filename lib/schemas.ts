/**
 * Zod validation schemas for form inputs and data validation
 * 
 * These schemas ensure type safety and provide runtime validation
 * for all form inputs and data transformations
 */

import { z } from 'zod';
import { VALIDATION_RULES, AI_TOOLS_CONFIG } from './config';

/**
 * AI Tool enum schema - validates that the selected tool exists
 */
const AIToolSchema = z.enum(
  AI_TOOLS_CONFIG.map((tool) => tool.id) as [string, ...string[]]
);

/**
 * Use case enum schema
 */
const UseCaseSchema = z.enum(['coding', 'writing', 'research', 'data', 'mixed']);

/**
 * Individual spend entry validation schema
 * Used when submitting a single tool's spend data
 */
export const SpendEntryFormSchema = z.object({
  tool: AIToolSchema.pipe(z.string().min(1, 'Please select an AI tool')),
  plan: z.string().min(1, 'Please select a plan for this tool'),
  monthlySpend: z.coerce
    .number()
    .min(
      VALIDATION_RULES.MONTHLY_SPEND.MIN,
      `Monthly spend must be at least $${VALIDATION_RULES.MONTHLY_SPEND.MIN}`
    )
    .max(
      VALIDATION_RULES.MONTHLY_SPEND.MAX,
      `Monthly spend cannot exceed $${VALIDATION_RULES.MONTHLY_SPEND.MAX}`
    ),
  numberOfSeats: z.coerce
    .number()
    .int('Must be a whole number')
    .min(
      VALIDATION_RULES.SEATS.MIN,
      `You must have at least ${VALIDATION_RULES.SEATS.MIN} seat`
    )
    .max(
      VALIDATION_RULES.SEATS.MAX,
      `Cannot exceed ${VALIDATION_RULES.SEATS.MAX} seats`
    ),
  teamSize: z.coerce
    .number()
    .int('Must be a whole number')
    .min(
      VALIDATION_RULES.TEAM_SIZE.MIN,
      `Team size must be at least ${VALIDATION_RULES.TEAM_SIZE.MIN}`
    )
    .max(
      VALIDATION_RULES.TEAM_SIZE.MAX,
      `Team size cannot exceed ${VALIDATION_RULES.TEAM_SIZE.MAX}`
    ),
  primaryUseCase: UseCaseSchema.or(z.literal('')).refine(
    (val) => val !== '',
    {
      message: 'Please select a primary use case',
    }
  ),
});

/**
 * Type derived from the schema - used for form component props
 */
export type SpendEntryFormInput = z.infer<typeof SpendEntryFormSchema>;

/**
 * Audit initialization schema
 * Validates the initial audit setup with basic team info
 */
export const AuditSetupSchema = z.object({
  teamName: z
    .string()
    .min(1, 'Team name is required')
    .min(2, 'Team name must be at least 2 characters')
    .max(100, 'Team name must be less than 100 characters'),
  teamSize: z.coerce
    .number()
    .int('Must be a whole number')
    .min(1, 'Team size must be at least 1 person')
    .max(10000, 'Team size cannot exceed 10,000'),
});

export type AuditSetupInput = z.infer<typeof AuditSetupSchema>;

/**
 * Complete audit submission schema
 * Validates the entire audit workflow
 */
export const AuditSubmissionSchema = z.object({
  entries: z
    .array(SpendEntryFormSchema)
    .min(1, 'Please add at least one AI tool'),
  teamSize: z
    .number()
    .int()
    .min(1),
});

export type AuditSubmissionInput = z.infer<typeof AuditSubmissionSchema>;

/**
 * Safe schema parser with error handling
 * Returns null if validation fails, otherwise returns parsed data
 */
export function parseSpendEntry(
  data: unknown
): SpendEntryFormInput | null {
  try {
    return SpendEntryFormSchema.parse(data);
  } catch {
    return null;
  }
}

/**
 * Safe parser for audit setup
 */
export function parseAuditSetup(
  data: unknown
): AuditSetupInput | null {
  try {
    return AuditSetupSchema.parse(data);
  } catch {
    return null;
  }
}

/**
 * Validates a single field against the schema
 * Useful for inline validation feedback
 */
export function validateField(
  fieldName: keyof SpendEntryFormInput,
  value: unknown
): { valid: boolean; error?: string } {
  try {
    // Validate just the field by creating a minimal object
    const testObj: Record<string, unknown> = {
      tool: '',
      plan: '',
      monthlySpend: '',
      numberOfSeats: '',
      teamSize: '',
      primaryUseCase: '',
      [fieldName]: value,
    };
    
    SpendEntryFormSchema.parse(testObj);
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors = error.errors.filter(e => e.path[0] === fieldName);
      if (fieldErrors.length > 0) {
        return {
          valid: false,
          error: fieldErrors[0].message,
        };
      }
    }
    return { valid: false, error: 'Validation error' };
  }
}
