'use client';

import React, { useState } from 'react';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

type LeadFormState = {
  email: string;
  companyName: string;
  role: string;
  teamSize: string;
  website: string;
};

const INITIAL_STATE: LeadFormState = {
  email: '',
  companyName: '',
  role: '',
  teamSize: '',
  website: '',
};

export default function LeadCaptureForm() {
  const [form, setForm] = useState<LeadFormState>(INITIAL_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const onChange = (field: keyof LeadFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: form.email,
          companyName: form.companyName,
          role: form.role,
          teamSize: form.teamSize,
          website: form.website,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(result.error || 'Submission failed. Please try again.');
        return;
      }

      setSuccessMessage('Thanks. Check your inbox for confirmation.');
      setForm(INITIAL_STATE);
    } catch {
      setErrorMessage('Network error. Please try again in a moment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-3" onSubmit={onSubmit} noValidate>
      {errorMessage && (
        <Alert variant="error" closable={false}>
          {errorMessage}
        </Alert>
      )}

      {successMessage && (
        <Alert variant="success" closable={false}>
          {successMessage}
        </Alert>
      )}

      <Input
        type="email"
        placeholder="Work email"
        value={form.email}
        onChange={(event) => onChange('email', event.target.value)}
        required
        autoComplete="email"
        aria-label="Work email"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          type="text"
          placeholder="Company name (optional)"
          value={form.companyName}
          onChange={(event) => onChange('companyName', event.target.value)}
          autoComplete="organization"
          aria-label="Company name"
        />
        <Input
          type="text"
          placeholder="Role (optional)"
          value={form.role}
          onChange={(event) => onChange('role', event.target.value)}
          autoComplete="organization-title"
          aria-label="Role"
        />
      </div>

      <Input
        type="number"
        min={1}
        placeholder="Team size (optional)"
        value={form.teamSize}
        onChange={(event) => onChange('teamSize', event.target.value)}
        aria-label="Team size"
      />

      {/* Honeypot input: hidden from users and screen readers */}
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={form.website}
        onChange={(event) => onChange('website', event.target.value)}
        className="hidden"
        aria-hidden="true"
        name="website"
      />

      <Button type="submit" variant="primary" className="w-full" loading={isSubmitting}>
        Get Early Access
      </Button>

      <p className="text-xs text-slate-500 text-center">
        No spam. Product updates and onboarding only.
      </p>
    </form>
  );
}
