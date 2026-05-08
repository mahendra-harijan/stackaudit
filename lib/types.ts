/**
 * Core type definitions for the Spend Audit platform
 * These types are used across the application for type safety
 */

/**
 * Supported AI tools
 */
export type AITool = 
  | 'cursor'
  | 'github-copilot'
  | 'claude'
  | 'chatgpt'
  | 'anthropic-api'
  | 'openai-api'
  | 'gemini'
  | 'windsurf';

/**
 * Pricing plans for each AI tool
 */
export type PricingPlan = {
  id: string;
  name: string;
  description?: string;
  basePrice: number; // USD per month
  perSeatPrice?: number; // USD per seat/month if applicable
  currency: 'USD' | 'EUR' | 'GBP';
  features: string[];
};

/**
 * AI tool configuration
 */
export type AIToolConfig = {
  id: AITool;
  name: string;
  category: 'IDE' | 'Chat' | 'API';
  plans: PricingPlan[];
  description?: string;
};

/**
 * Primary use case for AI tools
 */
export type UseCase = 
  | 'coding'
  | 'writing'
  | 'research'
  | 'data'
  | 'mixed';

/**
 * Spend entry submitted by user
 */
export type SpendEntry = {
  id: string;
  tool: AITool;
  plan: string;
  monthlySpend: number;
  numberOfSeats: number;
  teamSize: number;
  primaryUseCase: UseCase;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
};

/**
 * Audit input - all spend entries combined
 */
export type AuditInput = {
  entries: SpendEntry[];
  totalMonthlySpend: number;
  totalAnnualSpend: number;
  totalSeats: number;
  createdAt: string;
};

/**
 * Audit result (prepared for future implementation)
 */
export type AuditResult = {
  id: string;
  input: AuditInput;
  overspending: {
    tool: AITool;
    amount: number;
    reason: string;
  }[];
  recommendations: {
    tool: AITool;
    currentPlan: string;
    suggestedPlan: string;
    estimatedSavings: number;
  }[];
  alternatives: {
    currentTool: AITool;
    alternative: AITool;
    estimatedSavings: number;
  }[];
  totalPotentialSavings: number;
  createdAt: string;
};

/**
 * Form data structure for spend entry form
 */
export type SpendFormData = {
  tool: AITool | '';
  plan: string | '';
  monthlySpend: number | '';
  numberOfSeats: number | '';
  teamSize: number | '';
  primaryUseCase: UseCase | '';
};

/**
 * Extended use case with display info
 */
export type UseCaseOption = {
  value: UseCase;
  label: string;
  description?: string;
};
