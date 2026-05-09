import { AuditInput, AITool, UseCase } from '@/lib/types';

export type AuditRecommendationType =
  | 'plan-optimization'
  | 'seat-rightsizing'
  | 'tool-consolidation'
  | 'api-credit-optimization';

export type AuditRecommendationConfidence = 'low' | 'medium' | 'high';

export type AuditRecommendation = {
  id: string;
  type: AuditRecommendationType;
  scope: 'tool' | 'portfolio';
  tool: AITool;
  toolName: string;
  currentPlan: string;
  suggestedPlan: string;
  title: string;
  summary: string;
  reasoning: string[];
  currentMonthlyCost: number;
  suggestedMonthlyCost: number;
  estimatedMonthlySavings: number;
  estimatedAnnualSavings: number;
  confidence: AuditRecommendationConfidence;
  priority: number;
  actionable: boolean;
};

export type ToolAuditResult = {
  tool: AITool;
  toolName: string;
  category: 'IDE' | 'Chat' | 'API';
  useCase: UseCase;
  currentPlan: string;
  currentMonthlySpend: number;
  currentAnnualSpend: number;
  currentSeats: number;
  teamSize: number;
  estimatedRecommendedMonthlySpend: number;
  estimatedRecommendedAnnualSpend: number;
  potentialMonthlySavings: number;
  potentialAnnualSavings: number;
  recommendations: AuditRecommendation[];
  verdict: string;
};

export type AuditSummary = {
  totalTools: number;
  totalSeats: number;
  currentMonthlySpend: number;
  currentAnnualSpend: number;
  estimatedRecommendedMonthlySpend: number;
  estimatedRecommendedAnnualSpend: number;
  totalPotentialMonthlySavings: number;
  totalPotentialAnnualSavings: number;
  toolsWithSavings: number;
  toolsWithoutSavings: number;
  materialOpportunityCount: number;
  highestSavingsTool?: AITool;
};

export type AuditResult = {
  id: string;
  input: AuditInput;
  summary: AuditSummary;
  toolResults: ToolAuditResult[];
  recommendations: AuditRecommendation[];
  createdAt: string;
};