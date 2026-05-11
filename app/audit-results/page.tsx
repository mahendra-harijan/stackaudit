'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  BadgeDollarSign,
  CheckCircle2,
  CreditCard,
  Copy,
  ExternalLink,
  Loader,
  ShieldAlert,
  Sparkles,
  TrendingDown,
  AlertTriangle,
  Share2,
  Check,
} from 'lucide-react';

import { getStoredAuditInput } from '@/lib/storage';
import { AuditInput } from '@/lib/types';
import { buildAuditResult, getMaterialSavingsThreshold } from '@/lib/audit';
import { formatCurrency } from '@/lib/utils';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function AuditResultsPage() {
  const router = useRouter();
  const [auditInput, setAuditInput] = useState<AuditInput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareSummary, setShareSummary] = useState<string | null>(null);
  const [shareError, setShareError] = useState<string | null>(null);
  const [isCreatingShare, setIsCreatingShare] = useState(false);
  const [didCopyShareLink, setDidCopyShareLink] = useState(false);

  const auditResult = useMemo(() => {
    if (!auditInput) {
      return null;
    }

    return buildAuditResult(auditInput);
  }, [auditInput]);

  useEffect(() => {
    const input = getStoredAuditInput();
    if (!input) {
      router.push('/spend-input');
      return;
    }

    setAuditInput(input);
    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!auditInput || !auditResult) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center px-4">
        <Card className="text-center max-w-md w-full">
          <p className="text-slate-600 mb-6">No audit data found. Redirecting...</p>
          <Button onClick={() => router.push('/spend-input')}>
            <ArrowLeft className="w-4 h-4" />
            Back to Spend Input
          </Button>
        </Card>
      </div>
    );
  }

  const hasMaterialSavings =
    auditResult.summary.totalPotentialMonthlySavings >= getMaterialSavingsThreshold();
  const hasRecommendations = auditResult.recommendations.length > 0;

  const handleCreateShare = async () => {
    if (!auditInput) {
      return;
    }

    setIsCreatingShare(true);
    setShareError(null);

    try {
      const response = await fetch('/api/audit-shares', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({ auditInput }),
      });

      const payload = (await response.json()) as {
        shareUrl?: string;
        publicPayload?: { aiSummary?: string };
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? 'Unable to create share link');
      }

      setShareUrl(payload.shareUrl ?? null);
      setShareSummary(payload.publicPayload?.aiSummary ?? null);
      setDidCopyShareLink(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to create share link';
      setShareError(message);
    } finally {
      setIsCreatingShare(false);
    }
  };

  const handleCopyShareLink = async () => {
    if (!shareUrl || typeof navigator === 'undefined') {
      return;
    }

    await navigator.clipboard.writeText(shareUrl);
    setDidCopyShareLink(true);
    window.setTimeout(() => setDidCopyShareLink(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.14),_transparent_40%),linear-gradient(180deg,_#f8fafc_0%,_#ffffff_55%)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Button
            variant="outline"
            className="mb-6"
            onClick={() => router.push('/spend-input')}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700 mb-3">
              Audit Results
            </p>
            <h1 className="text-3xl sm:text-5xl font-bold text-slate-950 mb-4 leading-tight">
              Your AI spend audit is complete.
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl">
              The engine uses deterministic pricing rules, seat counts, and team size to surface only
              defensible savings opportunities. Estimates are intentionally conservative.
            </p>
          </div>
        </div>

        <Card className="mb-8 border-slate-200 bg-white/90 backdrop-blur shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr] items-start">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 mb-4">
                <Sparkles className="w-4 h-4" />
                Conservative savings estimate
              </div>
              <h2 className="text-2xl font-bold text-slate-950 mb-3">
                {hasMaterialSavings
                  ? 'There is meaningful waste to remove.'
                  : 'Your current setup looks fairly tight.'}
              </h2>
              <p className="text-slate-600 max-w-2xl">
                {hasMaterialSavings
                  ? 'The highest-confidence opportunities are a plan downgrade, seat right-sizing, or a lower-cost tool with the same workflow fit.'
                  : 'The engine did not find large dollar waste. That usually means the plan choice and team size are broadly aligned, or the savings would be too small to justify churn.'}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-950 text-white p-6">
              <p className="text-sm text-slate-300 mb-2">Estimated monthly savings</p>
              <div className="text-4xl font-bold mb-2">
                {formatCurrency(auditResult.summary.totalPotentialMonthlySavings)}
              </div>
              <p className="text-sm text-slate-300 mb-4">
                Annualized: {formatCurrency(auditResult.summary.totalPotentialAnnualSavings)}
              </p>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between border-t border-white/10 pt-3">
                  <span className="text-slate-300">Current monthly spend</span>
                  <span className="font-semibold">
                    {formatCurrency(auditResult.summary.currentMonthlySpend)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Projected monthly spend</span>
                  <span className="font-semibold">
                    {formatCurrency(auditResult.summary.estimatedRecommendedMonthlySpend)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 mb-10">
          <Card className="border-slate-200/80">
            <p className="text-sm font-medium text-slate-500 mb-2">Current monthly spend</p>
            <p className="text-3xl font-bold text-slate-950">
              {formatCurrency(auditResult.summary.currentMonthlySpend)}
            </p>
            <p className="text-sm text-slate-500 mt-2">
              Annual: {formatCurrency(auditResult.summary.currentAnnualSpend)}
            </p>
          </Card>
          <Card className="border-slate-200/80">
            <p className="text-sm font-medium text-slate-500 mb-2">Projected monthly spend</p>
            <p className="text-3xl font-bold text-slate-950">
              {formatCurrency(auditResult.summary.estimatedRecommendedMonthlySpend)}
            </p>
            <p className="text-sm text-slate-500 mt-2">After primary recommendations only</p>
          </Card>
          <Card className="border-slate-200/80">
            <p className="text-sm font-medium text-slate-500 mb-2">Tools with savings</p>
            <p className="text-3xl font-bold text-slate-950">{auditResult.summary.toolsWithSavings}</p>
            <p className="text-sm text-slate-500 mt-2">
              {auditResult.summary.materialOpportunityCount} material opportunities
            </p>
          </Card>
          <Card className="border-slate-200/80">
            <p className="text-sm font-medium text-slate-500 mb-2">Total seats reviewed</p>
            <p className="text-3xl font-bold text-slate-950">{auditResult.summary.totalSeats}</p>
            <p className="text-sm text-slate-500 mt-2">
              Across {auditResult.summary.totalTools} tools
            </p>
          </Card>
        </div>

        <Card className="mb-10 border-blue-200 bg-blue-50/70">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm font-medium text-blue-700 border border-blue-200 mb-4">
                <Share2 className="w-4 h-4" />
                Public-safe sharing
              </div>
              <h2 className="text-2xl font-bold text-slate-950 mb-3">
                Create a shareable public audit URL.
              </h2>
              <p className="text-slate-700 leading-7">
                The share action recomputes the audit server-side, generates a concise AI summary,
                and stores only the public-safe result snapshot. Email and company data stay out of
                the public page.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:min-w-[220px]">
              <Button loading={isCreatingShare} onClick={handleCreateShare} className="w-full">
                <Share2 className="w-4 h-4" />
                {shareUrl ? 'Refresh share link' : 'Create share link'}
              </Button>
              {shareUrl && (
                <>
                  <Button variant="outline" onClick={handleCopyShareLink} className="w-full">
                    {didCopyShareLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {didCopyShareLink ? 'Copied' : 'Copy link'}
                  </Button>
                  <a
                    href={shareUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-100"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open public page
                  </a>
                </>
              )}
            </div>
          </div>

          {shareError && (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
              {shareError}
            </div>
          )}

          {shareUrl && (
            <div className="mt-5 grid gap-4 xl:grid-cols-[1fr_0.95fr]">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-sm font-medium text-slate-500 mb-2">Share URL</p>
                <p className="break-all text-sm font-semibold text-slate-950">{shareUrl}</p>
              </div>
              <div className="rounded-2xl border border-blue-200 bg-white p-4">
                <p className="text-sm font-medium text-slate-500 mb-2">AI summary preview</p>
                <p className="text-sm text-slate-700 leading-6">
                  {shareSummary ?? 'A public-safe summary was generated for the share page.'}
                </p>
              </div>
            </div>
          )}
        </Card>

        <div className="grid gap-8 xl:grid-cols-[1.4fr_0.6fr]">
          <div className="space-y-6">
            <Card>
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-950">Recommendation breakdown</h2>
                  <p className="text-slate-600 mt-2">
                    Each card is based on a single primary recommendation to avoid double counting
                    overlapping savings.
                  </p>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                  <ShieldAlert className="w-4 h-4" />
                  Deterministic rules only
                </div>
              </div>

              <div className="space-y-4">
                {auditResult.toolResults.map((toolResult) => {
                  const primaryRecommendation = toolResult.recommendations[0];

                  return (
                    <div
                      key={toolResult.tool}
                      className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5"
                    >
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-xl font-semibold text-slate-950">
                              {toolResult.toolName}
                            </h3>
                            <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-700 border border-slate-200">
                              {toolResult.category}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600">{toolResult.verdict}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm min-w-[240px]">
                          <div className="rounded-xl bg-white p-3 border border-slate-200">
                            <p className="text-slate-500">Current spend</p>
                            <p className="font-semibold text-slate-950">
                              {formatCurrency(toolResult.currentMonthlySpend)}
                            </p>
                          </div>
                          <div className="rounded-xl bg-white p-3 border border-slate-200">
                            <p className="text-slate-500">Projected spend</p>
                            <p className="font-semibold text-slate-950">
                              {formatCurrency(toolResult.estimatedRecommendedMonthlySpend)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <div className="rounded-xl bg-white p-4 border border-slate-200">
                          <p className="text-slate-500 text-sm mb-1">Current plan</p>
                          <p className="font-semibold text-slate-950">{toolResult.currentPlan}</p>
                        </div>
                        <div className="rounded-xl bg-white p-4 border border-slate-200">
                          <p className="text-slate-500 text-sm mb-1">Seats reviewed</p>
                          <p className="font-semibold text-slate-950">{toolResult.currentSeats}</p>
                        </div>
                        <div className="rounded-xl bg-white p-4 border border-slate-200">
                          <p className="text-slate-500 text-sm mb-1">Potential monthly savings</p>
                          <p className="font-semibold text-emerald-700">
                            {formatCurrency(toolResult.potentialMonthlySavings)}
                          </p>
                        </div>
                        <div className="rounded-xl bg-white p-4 border border-slate-200">
                          <p className="text-slate-500 text-sm mb-1">Use case</p>
                          <p className="font-semibold text-slate-950 capitalize">{toolResult.useCase}</p>
                        </div>
                      </div>

                      {primaryRecommendation ? (
                        <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <TrendingDown className="w-4 h-4 text-blue-700" />
                                <h4 className="font-semibold text-blue-950">
                                  {primaryRecommendation.title}
                                </h4>
                              </div>
                              <p className="text-sm text-blue-950/90">
                                {primaryRecommendation.summary}
                              </p>
                            </div>
                            <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-blue-700 border border-blue-200">
                              {primaryRecommendation.confidence} confidence
                            </span>
                          </div>

                          <div className="mt-4 grid gap-3 lg:grid-cols-2 text-sm">
                            <div className="rounded-xl bg-white p-3 border border-blue-100">
                              <p className="text-slate-500">Suggested move</p>
                              <p className="font-semibold text-slate-950">
                                {primaryRecommendation.suggestedPlan}
                              </p>
                            </div>
                            <div className="rounded-xl bg-white p-3 border border-blue-100">
                              <p className="text-slate-500">Estimated annual savings</p>
                              <p className="font-semibold text-emerald-700">
                                {formatCurrency(primaryRecommendation.estimatedAnnualSavings)}
                              </p>
                            </div>
                          </div>

                          <ul className="mt-4 space-y-2 text-sm text-blue-950/90">
                            {primaryRecommendation.reasoning.map((reason) => (
                              <li key={reason} className="flex gap-2">
                                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                                <span>{reason}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
                          No material savings recommendation was found for this tool.
                        </div>
                      )}

                      {toolResult.recommendations.length > 1 && (
                        <div className="mt-4 text-sm text-slate-500">
                          Additional supporting recommendations exist, but they are not added to totals
                          so the savings model stays conservative.
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-slate-200 bg-slate-950 text-white">
              <div className="flex items-center gap-2 mb-4 text-slate-300">
                <BadgeDollarSign className="w-4 h-4" />
                Savings summary
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-400">Total potential monthly savings</p>
                  <p className="text-4xl font-bold">
                    {formatCurrency(auditResult.summary.totalPotentialMonthlySavings)}
                  </p>
                </div>
                <div className="grid gap-3 text-sm">
                  <div className="rounded-xl bg-white/5 p-4">
                    <p className="text-slate-400">Projected annual savings</p>
                    <p className="font-semibold">
                      {formatCurrency(auditResult.summary.totalPotentialAnnualSavings)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white/5 p-4">
                    <p className="text-slate-400">Savings coverage</p>
                    <p className="font-semibold">
                      {auditResult.summary.totalTools === 0
                        ? '0 tools'
                        : `${auditResult.summary.toolsWithSavings} of ${auditResult.summary.totalTools} tools`}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white/5 p-4">
                    <p className="text-slate-400">Highest opportunity</p>
                    <p className="font-semibold capitalize">
                      {auditResult.summary.highestSavingsTool ?? 'None'}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="border-slate-200 bg-white">
              <div className="flex items-center gap-2 mb-4 text-slate-700">
                <AlertTriangle className="w-4 h-4" />
                Notes
              </div>
              <div className="space-y-3 text-sm text-slate-600">
                <p>
                  Savings are estimated from published pricing and conservative heuristics. They are
                  not vendor quotes.
                </p>
                <p>
                  The engine intentionally avoids double counting overlapping recommendations so the
                  summary stays defensible.
                </p>
                <p>
                  If a recommendation is marked low confidence, treat it as a review prompt rather than
                  a direct action item.
                </p>
              </div>
            </Card>

            <Card className="border-slate-200 bg-white">
              <div className="flex items-center gap-2 mb-4 text-slate-700">
                <CreditCard className="w-4 h-4" />
                Honest read
              </div>
              <div className="space-y-3 text-sm text-slate-600">
                {hasRecommendations ? (
                  <>
                    <p>
                      The recommendations are limited to opportunities where the spend delta is large
                      enough to matter.
                    </p>
                    <p>
                      Smaller differences are intentionally ignored so the result does not overstate
                      savings.
                    </p>
                  </>
                ) : (
                  <>
                    <p>
                      No meaningful savings case was detected. That usually means the current plan mix
                      is already reasonable for the team size and current workload.
                    </p>
                    <p>
                      If your usage pattern changes, run the audit again with updated seat counts or
                      spend data.
                    </p>
                  </>
                )}
              </div>
            </Card>
          </div>
        </div>

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
