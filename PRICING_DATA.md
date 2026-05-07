# PRICING_DATA — Starter

This file will contain canonical pricing snippets and normalized fields for supported AI tools. Keep entries minimal and normalized for programmatic parsing.

## Schema (planned)

- name: string
- tier: string
- price_per_month_usd: number
- seats_included: number | null
- notes: string

## ChatGPT
- name: ChatGPT (OpenAI)
- tiers:
  - Free: price_per_month_usd: 0
  - Plus: price_per_month_usd: 20
  - Teams/Enterprise: price_per_month_usd: variable

## Claude
- name: Claude (Anthropic)
- tiers:
  - Starter: price_per_month_usd: 0
  - Team: price_per_month_usd: variable

## Cursor
- name: Cursor
- tiers: TBD

## GitHub Copilot
- name: GitHub Copilot
- tiers:
  - Individual: price_per_month_usd: 10
  - Business: price_per_month_usd: 19

## Gemini
- name: Gemini (Google)
- tiers: TBD

Notes: This document is a living reference for the audit engine's pricing models. Exact values will be normalized and moved to a JSON/TS module for programmatic usage.
