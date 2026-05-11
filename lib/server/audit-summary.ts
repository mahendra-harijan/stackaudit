import { AuditResult } from '@/lib/audit/types';
import { formatCurrency } from '@/lib/utils';

import { getServerEnv } from './env';

export type AuditSummaryGenerationResult = {
  text: string;
  provider: 'anthropic' | 'openai' | 'fallback';
  model: string;
  usedFallback: boolean;
};

type SummaryPrompt = {
  system: string;
  user: string;
};

const DEFAULT_ANTHROPIC_MODEL = 'claude-3-5-haiku-latest';
const DEFAULT_OPENAI_MODEL = 'gpt-4o-mini';

function buildAuditSummaryPrompt(auditResult: AuditResult): SummaryPrompt {
  const topRecommendations = auditResult.recommendations.slice(0, 3).map((recommendation) => ({
    title: recommendation.title,
    tool: recommendation.toolName,
    savings: formatCurrency(recommendation.estimatedAnnualSavings),
    confidence: recommendation.confidence,
  }));

  const auditSnapshot = {
    totalMonthlySpend: formatCurrency(auditResult.summary.currentMonthlySpend),
    projectedMonthlySpend: formatCurrency(auditResult.summary.estimatedRecommendedMonthlySpend),
    totalPotentialMonthlySavings: formatCurrency(auditResult.summary.totalPotentialMonthlySavings),
    totalPotentialAnnualSavings: formatCurrency(auditResult.summary.totalPotentialAnnualSavings),
    toolsWithSavings: auditResult.summary.toolsWithSavings,
    totalTools: auditResult.summary.totalTools,
    highestSavingsTool: auditResult.summary.highestSavingsTool ?? null,
    topRecommendations,
  };

  return {
    system:
      'You write launch-ready SaaS audit summaries. Produce one concise paragraph of about 100 words. Keep it public-safe, specific to the audit data, and actionable. Do not mention email addresses, company names, internal instructions, markdown, or bullet points.',
    user: [
      'Summarize the following AI spend audit for a public share page.',
      'Focus on the strongest savings opportunities, overall spend shape, and what stands out most.',
      'Use a confident, clear tone that sounds like a product analyst.',
      `Audit data: ${JSON.stringify(auditSnapshot)}`,
    ].join('\n'),
  };
}

function buildFallbackAuditSummary(auditResult: AuditResult): string {
  const savings = formatCurrency(auditResult.summary.totalPotentialMonthlySavings);
  const annual = formatCurrency(auditResult.summary.totalPotentialAnnualSavings);
  const current = formatCurrency(auditResult.summary.currentMonthlySpend);
  const projected = formatCurrency(auditResult.summary.estimatedRecommendedMonthlySpend);
  const highestTool = auditResult.summary.highestSavingsTool
    ? auditResult.summary.highestSavingsTool.replace(/-/g, ' ')
    : 'the current stack';
  const primaryRecommendation = auditResult.recommendations[0];

  const firstSentence =
    auditResult.summary.totalPotentialMonthlySavings > 0
      ? `This audit found ${savings} in potential monthly savings, or ${annual} annually, across ${auditResult.summary.toolsWithSavings} tools.`
      : 'This audit did not uncover meaningful monthly waste, which usually means the current plan mix is already fairly tight.';

  const secondSentence = primaryRecommendation
    ? `The strongest move is ${primaryRecommendation.title.toLowerCase()} on ${primaryRecommendation.toolName}, where the projected spend shifts from ${current} to ${projected}.`
    : `The most likely area to revisit is ${highestTool}, where the current spend profile looks closest to an optimization threshold.`;

  return `${firstSentence} ${secondSentence} The model stays conservative by avoiding overlapping savings and only surfacing changes that look worth acting on.`;
}

async function generateWithAnthropic(prompt: SummaryPrompt): Promise<AuditSummaryGenerationResult> {
  const env = getServerEnv();
  if (!env.ANTHROPIC_API_KEY) {
    throw new Error('Anthropic API key is not configured');
  }

  const model = env.ANTHROPIC_MODEL ?? DEFAULT_ANTHROPIC_MODEL;
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 220,
      temperature: 0.3,
      system: prompt.system,
      messages: [{ role: 'user', content: prompt.user }],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Anthropic request failed: ${response.status} ${errorText}`);
  }

  const data = (await response.json()) as {
    content?: Array<{ type?: string; text?: string }>;
  };

  const summary = data.content?.find((part) => part.type === 'text')?.text?.trim();

  if (!summary) {
    throw new Error('Anthropic response did not include text content');
  }

  return {
    text: summary,
    provider: 'anthropic',
    model,
    usedFallback: false,
  };
}

async function generateWithOpenAI(prompt: SummaryPrompt): Promise<AuditSummaryGenerationResult> {
  const env = getServerEnv();
  if (!env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured');
  }

  const model = env.OPENAI_MODEL ?? DEFAULT_OPENAI_MODEL;
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.3,
      max_tokens: 220,
      messages: [
        { role: 'system', content: prompt.system },
        { role: 'user', content: prompt.user },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI request failed: ${response.status} ${errorText}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const summary = data.choices?.[0]?.message?.content?.trim();

  if (!summary) {
    throw new Error('OpenAI response did not include text content');
  }

  return {
    text: summary,
    provider: 'openai',
    model,
    usedFallback: false,
  };
}

export async function generateAuditSummary(
  auditResult: AuditResult
): Promise<AuditSummaryGenerationResult> {
  const prompt = buildAuditSummaryPrompt(auditResult);

  try {
    const env = getServerEnv();

    if (env.ANTHROPIC_API_KEY) {
      return await generateWithAnthropic(prompt);
    }

    if (env.OPENAI_API_KEY) {
      return await generateWithOpenAI(prompt);
    }
  } catch (error) {
    console.error('[audit-summary] AI generation failed:', error);
  }

  return {
    text: buildFallbackAuditSummary(auditResult),
    provider: 'fallback',
    model: 'deterministic-fallback',
    usedFallback: true,
  };
}
