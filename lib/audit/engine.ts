import { getPlanDetails, getToolConfig } from '@/lib/config';
import { calculateAnnual } from '@/lib/utils';
import { AuditInput, SpendEntry } from '@/lib/types';

import {
  AuditRecommendation,
  AuditRecommendationConfidence,
  AuditResult,
  ToolAuditResult,
} from './types';

type ToolCategory = 'IDE' | 'Chat' | 'API';

type AuditContext = {
  entry: SpendEntry;
  toolName: string;
  category: ToolCategory;
  currentPlanCost: number;
  currentPlanLabel: string;
};

type AuditRule = {
  id: string;
  appliesTo: (context: AuditContext) => boolean;
  evaluate: (context: AuditContext) => AuditRecommendation[];
};

const SEAT_RIGHTSIZING_THRESHOLD = 3;
const ENTERPRISE_RIGHTSIZING_THRESHOLD = 25;
const MATERIAL_SAVINGS_THRESHOLD = 15;
const API_COMMITMENT_MIN_SPEND = 300;

const useCaseToolMap: Record<string, string[]> = {
  coding: ['cursor', 'github-copilot', 'windsurf', 'openai-api', 'anthropic-api'],
  writing: ['chatgpt', 'claude', 'gemini'],
  research: ['claude', 'chatgpt', 'gemini', 'openai-api', 'anthropic-api'],
  data: ['openai-api', 'anthropic-api', 'chatgpt', 'claude', 'gemini'],
  mixed: ['cursor', 'github-copilot', 'windsurf', 'chatgpt', 'claude', 'gemini'],
};

const confidenceWeight: Record<AuditRecommendationConfidence, number> = {
  high: 0.9,
  medium: 0.65,
  low: 0.4,
};

function formatId(prefix: string, value: string) {
  return `${prefix}_${value.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`;
}

function getToolCategory(toolId: string): ToolCategory {
  const toolConfig = getToolConfig(toolId);
  return toolConfig?.category ?? 'Chat';
}

function getToolName(toolId: string): string {
  return getToolConfig(toolId)?.name ?? toolId;
}

function estimatePlanMonthlyCost(toolId: string, planId: string, seats: number): number {
  const plan = getPlanDetails(toolId, planId);
  if (!plan) {
    return 0;
  }

  return plan.basePrice + (plan.perSeatPrice ?? 0) * seats;
}

function estimateAlternativeApiCost(currentSpend: number, currentPlanLabel: string): number {
  const isCommittedPlan = /committed|enterprise/i.test(currentPlanLabel);

  if (isCommittedPlan) {
    return currentSpend * (currentSpend <= 500 ? 0.72 : 0.84);
  }

  if (currentSpend < API_COMMITMENT_MIN_SPEND) {
    return currentSpend * 0.95;
  }

  if (currentSpend < 1500) {
    return currentSpend * 0.88;
  }

  return currentSpend * 0.8;
}

function isEnterpriseTier(planId: string, planName: string): boolean {
  return /enterprise/i.test(planId) || /enterprise/i.test(planName);
}

function isTeamTier(planId: string, planName: string): boolean {
  return /business|team/i.test(planId) || /business|team/i.test(planName);
}

function isSoloTier(planId: string, planName: string): boolean {
  return /individual|personal|pro/i.test(planId) || /individual|personal|pro/i.test(planName);
}

function isFreeTier(planId: string, planName: string): boolean {
  return /free/i.test(planId) || /free/i.test(planName);
}

function isViablePlan(entry: SpendEntry, planId: string, planName: string): boolean {
  if (isFreeTier(planId, planName)) {
    return entry.numberOfSeats === 1 && entry.teamSize === 1 && entry.monthlySpend <= 30;
  }

  if (isSoloTier(planId, planName)) {
    return entry.numberOfSeats <= 2 && entry.teamSize <= SEAT_RIGHTSIZING_THRESHOLD;
  }

  if (isTeamTier(planId, planName)) {
    return entry.teamSize <= ENTERPRISE_RIGHTSIZING_THRESHOLD;
  }

  if (isEnterpriseTier(planId, planName)) {
    return entry.teamSize > ENTERPRISE_RIGHTSIZING_THRESHOLD;
  }

  return true;
}

function recommendationConfidence(
  savingsRatio: number,
  savingsAmount: number
): AuditRecommendationConfidence {
  if (savingsAmount >= 100 || savingsRatio >= 0.35) {
    return 'high';
  }

  if (savingsAmount >= MATERIAL_SAVINGS_THRESHOLD || savingsRatio >= 0.15) {
    return 'medium';
  }

  return 'low';
}

function createRecommendation(args: {
  entry: SpendEntry;
  type: AuditRecommendation['type'];
  title: string;
  summary: string;
  reasoning: string[];
  suggestedPlan: string;
  currentMonthlyCost: number;
  suggestedMonthlyCost: number;
  priority: number;
  actionable?: boolean;
}): AuditRecommendation {
  const estimatedMonthlySavings = Math.max(
    0,
    args.currentMonthlyCost - args.suggestedMonthlyCost
  );
  const estimatedAnnualSavings = calculateAnnual(estimatedMonthlySavings);
  const savingsRatio =
    args.currentMonthlyCost > 0
      ? estimatedMonthlySavings / args.currentMonthlyCost
      : 0;

  return {
    id: formatId(
      `${args.type}_${args.entry.tool}_${args.entry.id}`,
      args.suggestedPlan
    ),
    type: args.type,
    scope: 'tool',
    tool: args.entry.tool,
    toolName: getToolName(args.entry.tool),
    currentPlan: args.entry.plan,
    suggestedPlan: args.suggestedPlan,
    title: args.title,
    summary: args.summary,
    reasoning: args.reasoning,
    currentMonthlyCost: args.currentMonthlyCost,
    suggestedMonthlyCost: args.suggestedMonthlyCost,
    estimatedMonthlySavings,
    estimatedAnnualSavings,
    confidence: recommendationConfidence(savingsRatio, estimatedMonthlySavings),
    priority: args.priority,
    actionable: args.actionable ?? true,
  };
}

function pickCheapestSameToolPlan(context: AuditContext): AuditRecommendation[] {
  const toolConfig = getToolConfig(context.entry.tool);
  if (!toolConfig) {
    return [];
  }

  const currentMonthlyCost = Math.max(context.entry.monthlySpend, context.currentPlanCost);
  const candidates = toolConfig.plans
    .filter((plan) => plan.id !== context.entry.plan)
    .filter((plan) => isViablePlan(context.entry, plan.id, plan.name))
    .map((plan) => ({
      plan,
      monthlyCost: estimatePlanMonthlyCost(context.entry.tool, plan.id, context.entry.numberOfSeats),
    }))
    .filter(({ monthlyCost }) => monthlyCost >= 0 && monthlyCost < currentMonthlyCost);

  if (candidates.length === 0) {
    return [];
  }

  const bestCandidate = candidates.reduce((lowest, current) =>
    current.monthlyCost < lowest.monthlyCost ? current : lowest
  );

  const bestPlan = bestCandidate.plan;
  const planSavings = currentMonthlyCost - bestCandidate.monthlyCost;

  if (planSavings < MATERIAL_SAVINGS_THRESHOLD && planSavings / currentMonthlyCost < 0.1) {
    return [];
  }

  const reasoning = [
    context.entry.numberOfSeats <= SEAT_RIGHTSIZING_THRESHOLD
      ? 'The current seat count is small enough that a lower-tier plan should still cover usage.'
      : 'A lower tier still appears viable based on the current seat count and team size.',
    bestPlan.basePrice === 0
      ? 'The free tier is financially viable for this workload.'
      : 'The proposed plan has a lower published monthly cost than the current setup.',
  ];

  return [
    createRecommendation({
      entry: context.entry,
      type: 'plan-optimization',
      title: isEnterpriseTier(context.entry.plan, context.currentPlanLabel)
        ? 'Right-size away from enterprise pricing'
        : 'Downgrade to a cheaper plan tier',
      summary: `Switch to ${bestPlan.name} to reduce monthly spend while preserving the same core workflow.`,
      reasoning,
      suggestedPlan: bestPlan.name,
      currentMonthlyCost,
      suggestedMonthlyCost: bestCandidate.monthlyCost,
      priority: bestCandidate.monthlyCost <= 0 ? 100 : 80,
    }),
  ];
}

function estimateBestAlternativeTool(context: AuditContext): AuditRecommendation[] {
  const candidates = useCaseToolMap[context.entry.primaryUseCase] ?? [];

  const viableAlternatives = candidates
    .filter((toolId) => toolId !== context.entry.tool)
    .map((toolId) => {
      const toolConfig = getToolConfig(toolId);

      if (!toolConfig) {
        return null;
      }

      const bestPlan = toolConfig.plans
        .map((plan) => ({
          plan,
          monthlyCost: estimatePlanMonthlyCost(toolId, plan.id, context.entry.numberOfSeats),
        }))
        .filter(({ plan }) => isViablePlan(context.entry, plan.id, plan.name))
        .filter(({ monthlyCost }) => monthlyCost >= 0)
        .reduce<
          | {
              plan: (typeof toolConfig.plans)[number];
              monthlyCost: number;
            }
          | null
        >((lowest, current) => {
          if (!lowest || current.monthlyCost < lowest.monthlyCost) {
            return current;
          }

          return lowest;
        }, null);

      if (!bestPlan) {
        return null;
      }

      const savings = context.entry.monthlySpend - bestPlan.monthlyCost;
      if (savings < MATERIAL_SAVINGS_THRESHOLD) {
        return null;
      }

      return {
        toolId,
        toolConfig,
        plan: bestPlan.plan,
        monthlyCost: bestPlan.monthlyCost,
        savings,
      };
    })
    .filter((alternative): alternative is NonNullable<typeof alternative> => Boolean(alternative))
    .sort((left, right) => left.monthlyCost - right.monthlyCost);

  if (viableAlternatives.length === 0) {
    return [];
  }

  const bestAlternative = viableAlternatives[0];
  const currentMonthlyCost = Math.max(context.entry.monthlySpend, context.currentPlanCost);

  if (bestAlternative.monthlyCost >= currentMonthlyCost) {
    return [];
  }

  return [
    createRecommendation({
      entry: context.entry,
      type: 'tool-consolidation',
      title: `Consider ${bestAlternative.toolConfig.name} for this workflow`,
      summary: `${bestAlternative.toolConfig.name} has a lower-cost entry point for ${context.entry.primaryUseCase} work.`,
      reasoning: [
        `The current use case is ${context.entry.primaryUseCase}, which is well covered by ${bestAlternative.toolConfig.name}.`,
        `The cheapest viable plan is ${bestAlternative.plan.name}, and it is materially cheaper than the current spend.`,
      ],
      suggestedPlan: `${bestAlternative.toolConfig.name} - ${bestAlternative.plan.name}`,
      currentMonthlyCost,
      suggestedMonthlyCost: bestAlternative.monthlyCost,
      priority: 70,
    }),
  ];
}

function evaluateApiCredits(context: AuditContext): AuditRecommendation[] {
  if (context.category !== 'API') {
    return [];
  }

  const isCommittedPlan = /committed|enterprise/i.test(context.currentPlanLabel);
  const isPayGoPlan = /pay-as-you-go|payg|retail/i.test(context.currentPlanLabel);

  if (!isCommittedPlan && !isPayGoPlan) {
    return [];
  }

  const currentMonthlyCost = Math.max(context.entry.monthlySpend, context.currentPlanCost);

  if (isCommittedPlan && context.entry.monthlySpend < API_COMMITMENT_MIN_SPEND) {
    const suggestedMonthlyCost = estimateAlternativeApiCost(
      context.entry.monthlySpend,
      context.currentPlanLabel
    );

    if (currentMonthlyCost - suggestedMonthlyCost < MATERIAL_SAVINGS_THRESHOLD) {
      return [];
    }

    return [
      createRecommendation({
        entry: context.entry,
        type: 'api-credit-optimization',
        title: 'Committed API spend looks unnecessary',
        summary: 'A pay-as-you-go model should be cheaper at your current spend level.',
        reasoning: [
          'Your monthly API spend is below the conservative commitment threshold.',
          'Retail usage is often more efficient than committed credits when volume is inconsistent.',
        ],
        suggestedPlan: 'Pay-as-you-go / retail pricing',
        currentMonthlyCost,
        suggestedMonthlyCost,
        priority: 90,
      }),
    ];
  }

  if (isPayGoPlan && context.entry.monthlySpend >= API_COMMITMENT_MIN_SPEND) {
    const suggestedMonthlyCost = currentMonthlyCost * 0.88;

    if (currentMonthlyCost - suggestedMonthlyCost < MATERIAL_SAVINGS_THRESHOLD) {
      return [];
    }

    return [
      createRecommendation({
        entry: context.entry,
        type: 'api-credit-optimization',
        title: 'Your API volume may justify a commitment',
        summary: 'A committed volume plan could lower effective per-unit pricing if usage stays stable.',
        reasoning: [
          'Your current API spend is high enough to consider negotiated or committed pricing.',
          'This estimate assumes a conservative 12% volume discount for a steady usage pattern.',
        ],
        suggestedPlan: 'Committed volume / credits',
        currentMonthlyCost,
        suggestedMonthlyCost,
        priority: 60,
      }),
    ];
  }

  return [];
}

const RULES: AuditRule[] = [
  {
    id: 'same-tool-plan-optimization',
    appliesTo: () => true,
    evaluate: pickCheapestSameToolPlan,
  },
  {
    id: 'tool-consolidation',
    appliesTo: () => true,
    evaluate: estimateBestAlternativeTool,
  },
  {
    id: 'api-credit-optimization',
    appliesTo: (context) => context.category === 'API',
    evaluate: evaluateApiCredits,
  },
];

function evaluateEntry(entry: SpendEntry): ToolAuditResult {
  const toolConfig = getToolConfig(entry.tool);
  const toolName = toolConfig?.name ?? getToolName(entry.tool);
  const category = toolConfig?.category ?? getToolCategory(entry.tool);
  const currentPlan = getPlanDetails(entry.tool, entry.plan);
  const currentPlanCost = currentPlan
    ? currentPlan.basePrice + (currentPlan.perSeatPrice ?? 0) * entry.numberOfSeats
    : entry.monthlySpend;
  const currentPlanLabel = currentPlan?.name ?? entry.plan;

  const context: AuditContext = {
    entry,
    toolName,
    category,
    currentPlanCost,
    currentPlanLabel,
  };

  const recommendations = RULES.flatMap((rule) =>
    rule.appliesTo(context) ? rule.evaluate(context) : []
  )
    .filter((recommendation) => recommendation.estimatedMonthlySavings > 0)
    .sort((left, right) => {
      if (right.estimatedMonthlySavings !== left.estimatedMonthlySavings) {
        return right.estimatedMonthlySavings - left.estimatedMonthlySavings;
      }

      return right.priority - left.priority;
    });

  const primaryRecommendation = recommendations[0];
  const potentialMonthlySavings = primaryRecommendation?.estimatedMonthlySavings ?? 0;
  const estimatedRecommendedMonthlySpend = Math.max(
    0,
    entry.monthlySpend - potentialMonthlySavings
  );

  const verdict =
    potentialMonthlySavings >= MATERIAL_SAVINGS_THRESHOLD
      ? 'Material savings opportunity found.'
      : recommendations.length > 0
        ? 'Limited savings available, but the current setup is broadly aligned.'
        : 'No meaningful savings opportunity identified.';

  return {
    tool: entry.tool,
    toolName,
    category,
    useCase: entry.primaryUseCase,
    currentPlan: currentPlanLabel,
    currentMonthlySpend: entry.monthlySpend,
    currentAnnualSpend: calculateAnnual(entry.monthlySpend),
    currentSeats: entry.numberOfSeats,
    teamSize: entry.teamSize,
    estimatedRecommendedMonthlySpend,
    estimatedRecommendedAnnualSpend: calculateAnnual(estimatedRecommendedMonthlySpend),
    potentialMonthlySavings,
    potentialAnnualSavings: calculateAnnual(potentialMonthlySavings),
    recommendations,
    verdict,
  };
}

export function prepareAuditInput(entries: SpendEntry[]): AuditInput {
  const totalMonthlySpend = entries.reduce((sum, entry) => sum + entry.monthlySpend, 0);

  return {
    entries,
    totalMonthlySpend,
    totalAnnualSpend: calculateAnnual(totalMonthlySpend),
    totalSeats: entries.reduce((sum, entry) => sum + entry.numberOfSeats, 0),
    createdAt: new Date().toISOString(),
  };
}

export function buildAuditResult(input: AuditInput): AuditResult {
  const toolResults = input.entries.map(evaluateEntry);
  const recommendations = toolResults
    .flatMap((toolResult) => toolResult.recommendations)
    .sort((left, right) => {
      if (right.estimatedAnnualSavings !== left.estimatedAnnualSavings) {
        return right.estimatedAnnualSavings - left.estimatedAnnualSavings;
      }

      if (right.priority !== left.priority) {
        return right.priority - left.priority;
      }

      return left.toolName.localeCompare(right.toolName);
    });

  const totalPotentialMonthlySavings = Math.min(
    input.totalMonthlySpend,
    toolResults.reduce((sum, toolResult) => sum + toolResult.potentialMonthlySavings, 0)
  );
  const estimatedRecommendedMonthlySpend = Math.max(
    0,
    input.totalMonthlySpend - totalPotentialMonthlySavings
  );

  const summary = {
    totalTools: input.entries.length,
    totalSeats: input.totalSeats,
    currentMonthlySpend: input.totalMonthlySpend,
    currentAnnualSpend: input.totalAnnualSpend,
    estimatedRecommendedMonthlySpend,
    estimatedRecommendedAnnualSpend: calculateAnnual(estimatedRecommendedMonthlySpend),
    totalPotentialMonthlySavings,
    totalPotentialAnnualSavings: calculateAnnual(totalPotentialMonthlySavings),
    toolsWithSavings: toolResults.filter((toolResult) => toolResult.potentialMonthlySavings > 0)
      .length,
    toolsWithoutSavings: toolResults.filter((toolResult) => toolResult.potentialMonthlySavings <= 0)
      .length,
    materialOpportunityCount: recommendations.filter(
      (recommendation) => recommendation.estimatedMonthlySavings >= MATERIAL_SAVINGS_THRESHOLD
    ).length,
    highestSavingsTool:
      toolResults.length > 0
        ? toolResults.reduce((best, current) =>
            current.potentialAnnualSavings > best.potentialAnnualSavings ? current : best
          ).tool
        : undefined,
  };

  return {
    id: `audit_${input.createdAt.replace(/[:.]/g, '-')}`,
    input,
    summary,
    toolResults,
    recommendations,
    createdAt: new Date().toISOString(),
  };
}

export function getRecommendationConfidenceWeight(
  confidence: AuditRecommendationConfidence
): number {
  return confidenceWeight[confidence];
}

export function getMaterialSavingsThreshold(): number {
  return MATERIAL_SAVINGS_THRESHOLD;
}