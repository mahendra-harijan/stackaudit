import { randomBytes } from 'crypto';

import { buildAuditResult } from '@/lib/audit';
import { AuditInput } from '@/lib/types';

import { generateAuditSummary } from './audit-summary';
import { insertAuditShare, getAuditShareByShareId, type AuditShareRecord } from './supabase';

export type PublicAuditSharePayload = {
  shareId: string;
  shareUrl: string;
  aiSummary: string;
  aiProvider: string;
  aiModel: string;
  usedFallback: boolean;
  createdAt: string;
  summary: ReturnType<typeof buildAuditResult>['summary'];
  toolResults: ReturnType<typeof buildAuditResult>['toolResults'];
  recommendations: ReturnType<typeof buildAuditResult>['recommendations'];
};

function getPublicAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
}

function buildShareId(): string {
  return randomBytes(9).toString('base64url');
}

function buildPublicShareUrl(shareId: string): string {
  return `${getPublicAppUrl().replace(/\/$/, '')}/audit/${shareId}`;
}

function buildPublicPayload(args: {
  shareId: string;
  shareUrl: string;
  aiSummary: string;
  aiProvider: string;
  aiModel: string;
  usedFallback: boolean;
  auditResult: ReturnType<typeof buildAuditResult>;
}): PublicAuditSharePayload {
  const { shareId, shareUrl, aiSummary, aiProvider, aiModel, usedFallback, auditResult } = args;

  return {
    shareId,
    shareUrl,
    aiSummary,
    aiProvider,
    aiModel,
    usedFallback,
    createdAt: new Date().toISOString(),
    summary: auditResult.summary,
    toolResults: auditResult.toolResults,
    recommendations: auditResult.recommendations,
  };
}

export type AuditShareResponse = {
  shareId: string;
  shareUrl: string;
  publicPayload: PublicAuditSharePayload;
  record: AuditShareRecord;
};

export async function createAuditShare(auditInput: AuditInput): Promise<AuditShareResponse> {
  const auditResult = buildAuditResult(auditInput);
  const aiSummary = await generateAuditSummary(auditResult);

  const shareId = buildShareId();
  const shareUrl = buildPublicShareUrl(shareId);
  const publicPayload = buildPublicPayload({
    shareId,
    shareUrl,
    aiSummary: aiSummary.text,
    aiProvider: aiSummary.provider,
    aiModel: aiSummary.model,
    usedFallback: aiSummary.usedFallback,
    auditResult,
  });

  const record = await insertAuditShare({
    share_id: shareId,
    ai_summary: aiSummary.text,
    ai_provider: aiSummary.provider,
    ai_model: aiSummary.model,
    public_payload: publicPayload,
  });

  return {
    shareId,
    shareUrl,
    publicPayload,
    record,
  };
}

export async function fetchAuditShareById(shareId: string): Promise<AuditShareRecord | null> {
  return getAuditShareByShareId(shareId);
}

export function getShareUrlFromId(shareId: string): string {
  return buildPublicShareUrl(shareId);
}
