import type { RequestHandler } from "express";
import crypto from "crypto";
import { getSupabaseServiceClient } from "../lib/supabase";
import { store as apptStore } from "./appointments";
import type { PaymentTransaction } from "@shared/api";

// In-memory fallback store for payments when Supabase is not configured
const memoryPayments: Record<string, PaymentTransaction> = {};

function nowISO() { return new Date().toISOString(); }
function toMinorUnits(amount: number) { return Math.round(amount * 100); }
function fromMinorUnits(amount: number) { return Math.round(amount) / 100; }
function genRef(prefix = "care") { return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now()}`; }

async function upsertPayment(tx: PaymentTransaction) {
  const supabase = getSupabaseServiceClient();
  if (!supabase) { memoryPayments[tx.reference] = tx; return { ok: true }; }
  const { error } = await supabase.from("payments").upsert(tx, { onConflict: "reference" });
  if (error) { console.warn("[Paystack] Supabase upsert payment error", error); memoryPayments[tx.reference] = tx; }
  return { ok: !error };
}

async function getPayment(reference: string): Promise<PaymentTransaction | null> {
  const supabase = getSupabaseServiceClient();
  if (!supabase) return memoryPayments[reference] || null;
  const { data, error } = await supabase.from("payments").select("*").eq("reference", reference).single();
  if (error) { return memoryPayments[reference] || null; }
  return data as PaymentTransaction;
}

async function updateAppointmentPaid(appointmentId: string, amountMinor: number) {
  const supabase = getSupabaseServiceClient();
  if (supabase) {
    try {
      const { error } = await supabase.from("appointments").update({ paymentStatus: "paid", paidAt: nowISO(), feeUSD: fromMinorUnits(amountMinor) }).eq("id", appointmentId);
      if (error) console.warn("[Paystack] Supabase mark paid error", error);
    } catch (err) { console.warn("[Paystack] Supabase mark paid exception", err); }
  }
  const appt = apptStore.find(a => a.id === appointmentId);
  if (appt) { (appt as any).paymentStatus = "paid"; (appt as any).paidAt = nowISO(); if ((appt as any).feeUSD == null) (appt as any).feeUSD = fromMinorUnits(amountMinor); }
}

export const initiatePayment: RequestHandler = async (req, res) => {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) { return res.status(500).json({ error: "PAYSTACK_SECRET_KEY not configured" }); }
    const { appointmentId, amount, currency } = (req.body || {}) as { appointmentId?: string; amount?: number; currency?: string };
    if (!appointmentId) return res.status(400).json({ error: "Missing appointmentId" });

    // Fetch appointment
    let appointment: any | null = null;
    const supabase = getSupabaseServiceClient();
    if (supabase) {
      try {
        const { data } = await supabase.from("appointments").select("*").eq("id", appointmentId).single();
        appointment = data || null;
      } catch {}
    }
    if (!appointment) {
      appointment = apptStore.find(a => a.id === appointmentId) || null;
    }
    if (!appointment) return res.status(404).json({ error: "Appointment not found" });

    const email = appointment.patientEmail || (req.body as any).email;
    if (!email) return res.status(400).json({ error: "Missing patient email" });

    const amt = typeof amount === 'number' && amount > 0 ? amount : (appointment.feeUSD ?? 120);
    const curr = (currency || process.env.PAYSTACK_CURRENCY || 'USD').toUpperCase();
    const amountMinor = toMinorUnits(amt);

    const reference = genRef("care");
    const paystackInitUrl = "https://api.paystack.co/transaction/initialize";

    const callbackBase = process.env.PUBLIC_BASE_URL || '';
    const callback = callbackBase ? `${callbackBase.replace(/\/$/, '')}/payment-status?reference=${encodeURIComponent(reference)}` : undefined;

    const body = { email, amount: amountMinor, currency: curr, reference, metadata: { appointmentId, email }, ...(callback ? { callback_url: callback } : {}) } as any;

    const rs = await fetch(paystackInitUrl, { method: 'POST', headers: { Authorization: `Bearer ${secret}` , 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const json = await rs.json();
    if (!json.status) {
      console.warn("[Paystack] initialize error", json);
      return res.status(400).json({ error: json.message || "Failed to initialize payment" });
    }

    const tx: PaymentTransaction = {
      id: crypto.randomUUID(),
      provider: 'paystack',
      reference,
      appointmentId,
      patientEmail: email,
      amount: amt,
      currency: curr,
      status: 'initialized',
      createdAt: nowISO(),
      updatedAt: nowISO(),
      metadata: { authorization_url: json.data.authorization_url }
    };
    await upsertPayment(tx);

    return res.json({ authorizationUrl: json.data.authorization_url, reference });
  } catch (err) {
    console.error("[Paystack] initiate exception", err);
    res.status(500).json({ error: "Unexpected error" });
  }
};

export const verifyPayment: RequestHandler = async (req, res) => {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) return res.status(500).json({ error: "PAYSTACK_SECRET_KEY not configured" });
    const reference = String(req.query.reference || '');
    if (!reference) return res.status(400).json({ error: 'Missing reference' });

    const verifyUrl = `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`;
    const rs = await fetch(verifyUrl, { headers: { Authorization: `Bearer ${secret}` } });
    const json = await rs.json();
    if (!json.status) return res.status(400).json({ ok: false, message: json.message || 'Verification failed' });

    const data = json.data || {};
    const status = data.status as string;
    const appointmentId = (data.metadata && data.metadata.appointmentId) || undefined;
    const amountMinor = data.amount as number;

    const existing = (await getPayment(reference)) || {
      id: crypto.randomUUID(), provider: 'paystack', reference, appointmentId: appointmentId || '', patientEmail: data.customer?.email || '', amount: (amountMinor ?? 0) / 100, currency: data.currency || 'USD', status: 'initialized', createdAt: nowISO(), updatedAt: nowISO(), metadata: {}
    } as PaymentTransaction;

    existing.status = status === 'success' ? 'success' : status;
    existing.channel = data.channel;
    existing.paidAt = data.paid_at || nowISO();
    existing.updatedAt = nowISO();
    existing.metadata = { ...existing.metadata, gateway_response: data.gateway_response };

    await upsertPayment(existing);

    if (status === 'success' && appointmentId) {
      await updateAppointmentPaid(appointmentId, amountMinor);
    }

    res.json({ ok: true, status: existing.status, appointmentId: existing.appointmentId });
  } catch (err) {
    console.error("[Paystack] verify exception", err);
    res.status(500).json({ error: 'Unexpected error' });
  }
};

// Webhook: configure your Paystack dashboard to send events here.
export const paystackWebhook: RequestHandler = async (req, res) => {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) return res.status(500).json({ error: "PAYSTACK_SECRET_KEY not configured" });

    const signature = req.headers['x-paystack-signature'] as string | undefined;
    const raw = (req as any).body instanceof Buffer ? (req as any).body : Buffer.from(JSON.stringify((req as any).body || {}));
    const computed = crypto.createHmac('sha512', secret).update(raw).digest('hex');
    if (!signature || signature !== computed) { console.warn('[Paystack] Invalid webhook signature'); return res.status(400).json({ error: 'Invalid signature' }); }

    const event = JSON.parse(raw.toString());
    if (event.event === 'charge.success' && event.data?.status === 'success') {
      const ref = event.data.reference as string;
      const appointmentId = event.data.metadata?.appointmentId as string | undefined;
      const amountMinor = event.data.amount as number;

      const existing = (await getPayment(ref)) || {
        id: crypto.randomUUID(), provider: 'paystack', reference: ref, appointmentId: appointmentId || '', patientEmail: event.data.customer?.email || '', amount: (amountMinor ?? 0) / 100, currency: event.data.currency || 'USD', status: 'initialized', createdAt: nowISO(), updatedAt: nowISO(), metadata: {}
      } as PaymentTransaction;

      existing.status = 'success';
      existing.channel = event.data.channel;
      existing.paidAt = event.data.paid_at || nowISO();
      existing.updatedAt = nowISO();
      existing.metadata = { ...existing.metadata, webhook: true };
      await upsertPayment(existing);

      if (appointmentId) await updateAppointmentPaid(appointmentId, amountMinor);

      console.log('[Paystack] charge.success processed', ref);
    } else {
      console.log('[Paystack] Webhook event', event.event);
    }

    res.json({ ok: true });
  } catch (err) {
    console.error('[Paystack] webhook exception', err);
    res.status(500).json({ error: 'Unexpected error' });
  }
};
