/**
 * AI Tools and Pricing Configuration
 * This is the source of truth for all supported tools and their pricing plans
 * 
 * Architecture note: This configuration is client-side for demo purposes.
 * In production, this would be fetched from a database/API for dynamic updates.
 */

import { AIToolConfig, UseCaseOption } from './types';
import {SITE_NAME} from './constants'

export const APP_CONFIG = {
  name: SITE_NAME ?? 'Credex',
  analytics: false
}

/**
 * Complete configuration of supported AI tools with pricing
 */
export const AI_TOOLS_CONFIG: AIToolConfig[] = [
  {
    id: 'cursor',
    name: 'Cursor',
    category: 'IDE',
    description: 'AI-powered code editor built on VS Code',
    plans: [
      {
        id: 'cursor-pro',
        name: 'Cursor Pro',
        description: 'Unlimited requests, priority support',
        basePrice: 20,
        perSeatPrice: 20,
        currency: 'USD',
        features: ['Unlimited requests', 'Priority support', 'Advanced models'],
      },
      {
        id: 'cursor-business',
        name: 'Cursor Business',
        description: 'For teams, with admin controls',
        basePrice: 40,
        perSeatPrice: 40,
        currency: 'USD',
        features: [
          'Unlimited requests',
          'Team management',
          'Admin dashboard',
          'Priority support',
        ],
      },
    ],
  },
  {
    id: 'github-copilot',
    name: 'GitHub Copilot',
    category: 'IDE',
    description: 'AI pair programmer from GitHub',
    plans: [
      {
        id: 'copilot-individual',
        name: 'Copilot Individual',
        description: 'For individual developers',
        basePrice: 10,
        perSeatPrice: 10,
        currency: 'USD',
        features: ['Code completions', 'Chat support', 'IDE integration'],
      },
      {
        id: 'copilot-business',
        name: 'Copilot Business',
        description: 'For teams with licensing',
        basePrice: 19,
        perSeatPrice: 19,
        currency: 'USD',
        features: [
          'Code completions',
          'Chat support',
          'Team management',
          'Business support',
        ],
      },
      {
        id: 'copilot-enterprise',
        name: 'Copilot Enterprise',
        description: 'Enterprise with custom policies',
        basePrice: 0,
        perSeatPrice: 39,
        currency: 'USD',
        features: [
          'Unlimited requests',
          'Custom fine-tuning',
          'Enterprise support',
          'SSO',
        ],
      },
    ],
  },
  {
    id: 'claude',
    name: 'Claude (Web)',
    category: 'Chat',
    description: 'Anthropic Claude via web interface',
    plans: [
      {
        id: 'claude-free',
        name: 'Claude Free',
        description: 'Free tier with limits',
        basePrice: 0,
        currency: 'USD',
        features: ['Limited messages', 'Web access', 'Basic models'],
      },
      {
        id: 'claude-pro',
        name: 'Claude Pro',
        description: 'Unlimited with latest models',
        basePrice: 20,
        perSeatPrice: 20,
        currency: 'USD',
        features: ['Unlimited messages', 'Latest models', 'Priority access'],
      },
    ],
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT (Web)',
    category: 'Chat',
    description: 'OpenAI ChatGPT via web interface',
    plans: [
      {
        id: 'chatgpt-free',
        name: 'ChatGPT Free',
        description: 'Free tier with limits',
        basePrice: 0,
        currency: 'USD',
        features: ['Limited access', 'GPT-4 limited', 'Web access'],
      },
      {
        id: 'chatgpt-plus',
        name: 'ChatGPT Plus',
        description: 'Unlimited with priority',
        basePrice: 20,
        perSeatPrice: 20,
        currency: 'USD',
        features: ['Unlimited messages', 'GPT-4 access', 'Plugins', 'Priority'],
      },
      {
        id: 'chatgpt-team',
        name: 'ChatGPT Team',
        description: 'For teams',
        basePrice: 30,
        perSeatPrice: 30,
        currency: 'USD',
        features: [
          'Team workspace',
          'Shared conversations',
          'Admin controls',
          'Advanced features',
        ],
      },
    ],
  },
  {
    id: 'anthropic-api',
    name: 'Anthropic API',
    category: 'API',
    description: 'Claude API for developers',
    plans: [
      {
        id: 'anthropic-api-pay-as-you-go',
        name: 'Pay-as-you-go',
        description: 'No upfront costs',
        basePrice: 0,
        currency: 'USD',
        features: [
          'Per-token pricing',
          'No minimums',
          'Scalable',
          'API support',
        ],
      },
      {
        id: 'anthropic-api-committed',
        name: 'Committed Volume',
        description: 'Volume discounts with commitment',
        basePrice: 5000,
        currency: 'USD',
        features: [
          'Volume discounts',
          'Committed pricing',
          'Priority support',
          'SLA',
        ],
      },
    ],
  },
  {
    id: 'openai-api',
    name: 'OpenAI API',
    category: 'API',
    description: 'GPT-4 and other models via API',
    plans: [
      {
        id: 'openai-api-pay-as-you-go',
        name: 'Pay-as-you-go',
        description: 'No upfront costs',
        basePrice: 0,
        currency: 'USD',
        features: [
          'Per-token pricing',
          'All models',
          'No minimums',
          'API support',
        ],
      },
      {
        id: 'openai-api-committed',
        name: 'Committed Spend',
        description: 'Volume discounts',
        basePrice: 1000,
        currency: 'USD',
        features: [
          'Volume discounts',
          'Committed pricing',
          'Priority access',
          'Support',
        ],
      },
    ],
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    category: 'Chat',
    description: 'Google AI with Gemini models',
    plans: [
      {
        id: 'gemini-free',
        name: 'Gemini Free',
        description: 'Free tier limited access',
        basePrice: 0,
        currency: 'USD',
        features: ['Limited access', 'Basic models', 'Web access'],
      },
      {
        id: 'gemini-api',
        name: 'Gemini API',
        description: 'API access with pay-per-use',
        basePrice: 0,
        currency: 'USD',
        features: [
          'Per-token pricing',
          'Advanced models',
          'API support',
          'Scalable',
        ],
      },
    ],
  },
  {
    id: 'windsurf',
    name: 'Windsurf / v0',
    category: 'IDE',
    description: 'AI IDE and component generator',
    plans: [
      {
        id: 'windsurf-free',
        name: 'Windsurf Free',
        description: 'Free tier with limitations',
        basePrice: 0,
        currency: 'USD',
        features: [
          'Limited generations',
          'Community templates',
          'Basic support',
        ],
      },
      {
        id: 'windsurf-pro',
        name: 'Windsurf Pro',
        description: 'Unlimited with priority',
        basePrice: 25,
        perSeatPrice: 25,
        currency: 'USD',
        features: [
          'Unlimited generations',
          'Priority queue',
          'Advanced models',
          'Export options',
        ],
      },
    ],
  },
];

/**
 * Use case options with display labels
 */
export const USE_CASES: UseCaseOption[] = [
  {
    value: 'coding',
    label: 'Software Development',
    description: 'Code completion, debugging, architecture',
  },
  {
    value: 'writing',
    label: 'Writing & Content',
    description: 'Documentation, copywriting, editing',
  },
  {
    value: 'research',
    label: 'Research & Analysis',
    description: 'Data analysis, research synthesis',
  },
  {
    value: 'data',
    label: 'Data Processing',
    description: 'Data transformation, querying, analysis',
  },
  {
    value: 'mixed',
    label: 'Mixed Use Cases',
    description: 'Multiple use cases across the team',
  },
];

/**
 * Helper to get tool config by ID
 */
export function getToolConfig(toolId: string): AIToolConfig | undefined {
  return AI_TOOLS_CONFIG.find((tool) => tool.id === toolId);
}

/**
 * Helper to get plans for a specific tool
 */
export function getToolPlans(toolId: string) {
  const tool = getToolConfig(toolId);
  return tool?.plans || [];
}

/**
 * Helper to get plan details
 */
export function getPlanDetails(toolId: string, planId: string) {
  const plans = getToolPlans(toolId);
  return plans.find((p) => p.id === planId);
}

/**
 * Helper to get all tool names for display
 */
export function getAllToolNames(): { id: string; name: string }[] {
  return AI_TOOLS_CONFIG.map((tool) => ({
    id: tool.id,
    name: tool.name,
  }));
}

/**
 * Helper to calculate monthly costs
 */
export function calculateMonthlyCost(
  toolId: string,
  planId: string,
  numberOfSeats: number
): number {
  const plan = getPlanDetails(toolId, planId);
  if (!plan) return 0;

  const baseCost = plan.basePrice;
  const seatCost = (plan.perSeatPrice || 0) * numberOfSeats;
  return baseCost + seatCost;
}

/**
 * Validation constants
 */
export const VALIDATION_RULES = {
  MONTHLY_SPEND: {
    MIN: 0,
    MAX: 1000000,
    STEP: 0.01,
  },
  TEAM_SIZE: {
    MIN: 1,
    MAX: 10000,
  },
  SEATS: {
    MIN: 1,
    MAX: 10000,
  },
};
