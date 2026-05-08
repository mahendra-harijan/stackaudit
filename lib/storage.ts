/**
 * localStorage utilities for persisting audit data
 * 
 * Provides type-safe persistence with automatic serialization/deserialization
 * and error handling for localStorage operations
 */

import { SpendEntryFormInput } from './schemas';
import { AuditInput, SpendEntry } from './types';

/**
 * Storage keys for all persisted data
 */
const STORAGE_KEYS = {
  CURRENT_ENTRIES: 'stackaudit_current_entries',
  AUDIT_INPUT: 'stackaudit_audit_input',
  AUDIT_METADATA: 'stackaudit_audit_metadata',
  FORM_DRAFT: 'stackaudit_form_draft',
  LAST_VISIT: 'stackaudit_last_visit',
} as const;

/**
 * Type-safe JSON stringify with fallback
 */
function safeStringify<T>(data: T): string {
  try {
    return JSON.stringify(data);
  } catch (error) {
    console.error('Failed to stringify data:', error);
    return '';
  }
}

/**
 * Type-safe JSON parse with fallback
 */
function safeParse<T = unknown>(json: string | null): T | null {
  if (!json) return null;
  try {
    return JSON.parse(json) as T;
  } catch (error) {
    console.error('Failed to parse stored data:', error);
    return null;
  }
}

/**
 * Save a spend entry with unique ID and timestamps
 */
export function saveSpendEntry(entry: SpendEntryFormInput): SpendEntry {
  const spendEntry: SpendEntry = {
    id: `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    tool: entry.tool as any,
    plan: entry.plan,
    monthlySpend: entry.monthlySpend as number,
    numberOfSeats: entry.numberOfSeats as number,
    teamSize: entry.teamSize as number,
    primaryUseCase: entry.primaryUseCase as any,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    const currentEntries = getStoredEntries();
    const updated = [...currentEntries, spendEntry];
    localStorage.setItem(STORAGE_KEYS.CURRENT_ENTRIES, safeStringify(updated));
    return spendEntry;
  } catch (error) {
    console.error('Failed to save spend entry:', error);
    throw new Error('Could not save data. Storage may be full.');
  }
}

/**
 * Retrieve all stored spend entries
 */
export function getStoredEntries(): SpendEntry[] {
  const stored = safeParse<SpendEntry[]>(
    localStorage.getItem(STORAGE_KEYS.CURRENT_ENTRIES)
  );
  return stored && Array.isArray(stored) ? stored : [];
}

/**
 * Remove a single entry by ID
 */
export function removeSpendEntry(entryId: string): void {
  try {
    const entries = getStoredEntries();
    const filtered = entries.filter((e) => e.id !== entryId);
    localStorage.setItem(STORAGE_KEYS.CURRENT_ENTRIES, safeStringify(filtered));
  } catch (error) {
    console.error('Failed to remove entry:', error);
  }
}

/**
 * Update an existing entry
 */
export function updateSpendEntry(
  entryId: string,
  updates: Partial<Omit<SpendEntry, 'id' | 'createdAt'>>
): SpendEntry | null {
  try {
    const entries = getStoredEntries();
    const index = entries.findIndex((e) => e.id === entryId);

    if (index === -1) return null;

    const updated = {
      ...entries[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    entries[index] = updated;
    localStorage.setItem(STORAGE_KEYS.CURRENT_ENTRIES, safeStringify(entries));
    return updated;
  } catch (error) {
    console.error('Failed to update entry:', error);
    return null;
  }
}

/**
 * Save the complete audit input
 */
export function saveAuditInput(auditInput: AuditInput): void {
  try {
    localStorage.setItem(STORAGE_KEYS.AUDIT_INPUT, safeStringify(auditInput));
  } catch (error) {
    console.error('Failed to save audit input:', error);
    throw new Error('Could not save audit data');
  }
}

/**
 * Retrieve the saved audit input
 */
export function getStoredAuditInput(): AuditInput | null {
  return safeParse<AuditInput>(
    localStorage.getItem(STORAGE_KEYS.AUDIT_INPUT)
  );
}

/**
 * Save form draft state (for mid-form recovery)
 */
export function saveFormDraft(formData: Partial<SpendEntryFormInput>): void {
  try {
    localStorage.setItem(STORAGE_KEYS.FORM_DRAFT, safeStringify(formData));
  } catch (error) {
    console.error('Failed to save form draft:', error);
  }
}

/**
 * Retrieve form draft
 */
export function getFormDraft(): Partial<SpendEntryFormInput> | null {
  return safeParse<Partial<SpendEntryFormInput>>(
    localStorage.getItem(STORAGE_KEYS.FORM_DRAFT)
  );
}

/**
 * Clear form draft after submission
 */
export function clearFormDraft(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.FORM_DRAFT);
  } catch (error) {
    console.error('Failed to clear form draft:', error);
  }
}

/**
 * Save metadata about the current audit session
 */
export function saveAuditMetadata(metadata: {
  totalEntries: number;
  lastUpdated: string;
  status: 'draft' | 'submitted';
}): void {
  try {
    localStorage.setItem(STORAGE_KEYS.AUDIT_METADATA, safeStringify(metadata));
  } catch (error) {
    console.error('Failed to save audit metadata:', error);
  }
}

/**
 * Retrieve audit metadata
 */
export function getAuditMetadata(): {
  totalEntries: number;
  lastUpdated: string;
  status: 'draft' | 'submitted';
} | null {
  return safeParse(localStorage.getItem(STORAGE_KEYS.AUDIT_METADATA));
}

/**
 * Check if there's unsaved data
 */
export function hasUnsavedData(): boolean {
  const entries = getStoredEntries();
  const metadata = getAuditMetadata();
  return entries.length > 0 && metadata?.status === 'draft';
}

/**
 * Clear all audit data (use with caution)
 */
export function clearAllAuditData(): void {
  try {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('Failed to clear all data:', error);
  }
}

/**
 * Export audit data as JSON (for download or backup)
 */
export function exportAuditData(): string {
  const entries = getStoredEntries();
  const auditInput = getStoredAuditInput();
  const metadata = getAuditMetadata();

  return safeStringify({
    entries,
    auditInput,
    metadata,
    exportedAt: new Date().toISOString(),
  });
}

/**
 * Import audit data from JSON
 */
export function importAuditData(jsonData: string): boolean {
  try {
    const data = safeParse<{
      entries: SpendEntry[];
      auditInput: AuditInput;
      metadata: any;
    }>(jsonData);

    if (!data) return false;

    if (data.entries && Array.isArray(data.entries)) {
      localStorage.setItem(
        STORAGE_KEYS.CURRENT_ENTRIES,
        safeStringify(data.entries)
      );
    }

    if (data.auditInput) {
      localStorage.setItem(STORAGE_KEYS.AUDIT_INPUT, safeStringify(data.auditInput));
    }

    if (data.metadata) {
      localStorage.setItem(STORAGE_KEYS.AUDIT_METADATA, safeStringify(data.metadata));
    }

    return true;
  } catch (error) {
    console.error('Failed to import audit data:', error);
    return false;
  }
}
