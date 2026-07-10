/**
 * src/lib/supabase.ts
 *
 * OPTIONAL backend. The whole app works perfectly WITHOUT Supabase.
 *
 * If you add the two environment variables (in .env.local locally, and in
 * Vercel → Settings → Environment Variables), this file will quietly log:
 *   • every brief someone submits  → "leads" table
 *   • every successful TON payment  → "payments" table
 *
 * If the variables are missing, every function below simply does nothing —
 * so a missing key can never break your deploy.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase: SupabaseClient | null =
  url && key ? createClient(url, key) : null;

export const isSupabaseEnabled = Boolean(supabase);

/** A brief submitted in the intake console. */
export interface LeadRecord {
  session_id: string;
  brand: string;
  offer: string;
  segment: string;
  message: string;
  alignment_score: number;
}

/** A completed on-chain TON payment. */
export interface PaymentRecord {
  session_id: string | null;
  tier_id: string;
  tier_name: string;
  amount_usd: number;
  amount_ton: number;
  wallet_address: string | null;
  tx_boc: string | null;
}

export async function logLead(record: LeadRecord): Promise<void> {
  if (!supabase) return;
  try {
    await supabase.from('leads').insert(record);
  } catch {
    /* never surface backend errors to the user */
  }
}

export async function logPayment(record: PaymentRecord): Promise<void> {
  if (!supabase) return;
  try {
    await supabase.from('payments').insert(record);
  } catch {
    /* never surface backend errors to the user */
  }
}
