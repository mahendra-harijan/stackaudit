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

/**
 * Lead capture payload received from the landing page form
 */
export type LeadCapturePayload = {
  email: string;
  companyName?: string;
  role?: string;
  teamSize?: number;
  website?: string;
};

/**
 * Canonical lead record stored in PostgreSQL
 */
export type LeadRecord = {
  id: string;
  email: string;
  company_name: string | null;
  role: string | null;
  team_size: number | null;
  source: string;
  created_at: string;
};
