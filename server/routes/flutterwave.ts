import type { RequestHandler } from "express";
import crypto from "crypto";
import { store as apptStore } from "./appointments";
import type { ApiError, PaymentReceipt } from "@shared/api";

const receipts = new Map<string, PaymentReceipt>();

function minor(amount: number) { return Math.round(amount * 100); }
function currency() { return process.env.CURRENCY || "GHS"; }
function genId() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }

export const initiateFlutterwave: RequestHandler = async (req, res) => {
  const { appointmentId, email, name, amount, callbackUrl } = (req.body || {}) as { appointmentId?: string; email?: string; name?: string; amount?: number; callbackUrl?: string };
  if (!appointmentId || !email || !amount) return res.status(400).json({ error: "Missing appointmentId, email, or amount" } as ApiError);
  const secret = process.env.FLUTTERWAVE_SECRET_KEY;
  if (!secret) return res.status(500).json({ error: "Flutterwave keys not configured" } as ApiError);
  const tx_ref = `carelink_${appointmentId}_${Date.now()}`;
  try {
    const r = await fetch("https://api.flutterwave.com/v3/payments", {
      method: "POST",
      headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        tx_ref,
        amount: amount,
        currency: currency(),
        redirect_url: callbackUrl,
        customer: { email, name: name || email },
        meta: { appointmentId },
      }),
    });
    const data: any = await r.json();
    if (!r.ok || !data?.status || data.status !== "success") {
      const msg = (data && (data.message || data.error)) || `HTTP ${r.status}`;
      return res.status(400).json({ error: `Flutterwave init failed: ${msg}` } as ApiError);
    }
    const receipt: PaymentReceipt = { id: genId(), provider: "flutterwave", appointmentId, reference: tx_ref, amount, currency: currency(), status: "pending", customerEmail: email, createdAt: new Date().toISOString() };
    receipts.set(tx_ref, receipt);
    const link = data.data.link;
    res.json({ link, tx_ref });
  } catch (err: any) {
    res.status(500).json({ error: `Flutterwave init exception: ${err?.message || err}` } as ApiError);
  }
};

export const verifyFlutterwave: RequestHandler = async (req, res) => {
  const tx_id = String(req.query.transaction_id || "");
  const tx_ref = String(req.query.tx_ref || "");
  const secret = process.env.FLUTTERWAVE_SECRET_KEY;
  if (!secret) return res.status(500).json({ error: "Flutterwave keys not configured" } as ApiError);
  if (!tx_id && !tx_ref) return res.status(400).json({ error: "Missing transaction_id or tx_ref" } as ApiError);
  try {
    // Prefer transaction_id verify
    if (tx_id) {
      const r = await fetch(`https://api.flutterwave.com/v3/transactions/${tx_id}/verify`, { headers: { Authorization: `Bearer ${secret}` } });
      const data: any = await r.json();
      if (!r.ok || data.status !== "success") {
        const msg = (data && (data.message || data.error)) || `HTTP ${r.status}`;
        return res.status(400).json({ error: `Flutterwave verify failed: ${msg}` } as ApiError);
      }
      const ref = data.data.tx_ref as string;
      let receipt = receipts.get(ref);
      if (!receipt) {
        receipt = { id: genId(), provider: "flutterwave", appointmentId: String(data.data.meta?.appointmentId || "unknown"), reference: ref, amount: Number(data.data.amount), currency: data.data.currency || currency(), status: data.data.status === "successful" ? "paid" : (data.data.status as any), customerEmail: String(data.data.customer?.email || ""), createdAt: new Date().toISOString() };
      }
      receipt.status = data.data.status === "successful" ? "paid" : (data.data.status as any);
      if (receipt.status === "paid") {
        receipt.paidAt = new Date(data.data.created_at || Date.now()).toISOString();
        receipt.transactionId = String(data.data.id);
        const appt = apptStore.find(a => a.id === receipt!.appointmentId);
        if (appt) {
          (appt as any).payments = ((appt as any).payments || []).concat(receipt);
          (appt as any).paid = true;
        }
      }
      receipts.set(ref, receipt);
      return res.json({ receipt });
    }
    // Fallback: lookup by tx_ref (no direct verify endpoint for only ref; usually use event or earlier store)
    const found = receipts.get(tx_ref);
    if (!found) return res.status(404).json({ error: "Receipt not found" } as ApiError);
    return res.json({ receipt: found });
  } catch (err: any) {
    res.status(500).json({ error: `Flutterwave verify exception: ${err?.message || err}` } as ApiError);
  }
};

export const flutterwaveWebhook: RequestHandler = async (req, res) => {
  const signature = (req.headers["verif-hash"] || req.headers["verif_hash"]) as string | undefined;
  const expected = process.env.FLW_SECRET_HASH;
  if (!expected || !signature || signature !== expected) return res.status(401).json({ error: "Invalid signature" } as ApiError);
  const event = req.body;
  if (event?.event === "charge.completed" && event.data?.status === "successful") {
    const ref = String(event.data.tx_ref);
    let receipt = receipts.get(ref);
    if (!receipt) {
      receipt = { id: genId(), provider: "flutterwave", appointmentId: String(event.data.meta?.appointmentId || "unknown"), reference: ref, amount: Number(event.data.amount), currency: event.data.currency || currency(), status: "paid", customerEmail: String(event.data.customer?.email || ""), createdAt: new Date().toISOString() };
    }
    receipt.status = "paid";
    receipt.paidAt = new Date(event.data.created_at || Date.now()).toISOString();
    receipt.transactionId = String(event.data.id);
    receipts.set(ref, receipt);
    const appt = apptStore.find(a => a.id === receipt!.appointmentId);
    if (appt) {
      (appt as any).payments = ((appt as any).payments || []).concat(receipt);
      (appt as any).paid = true;
    }
  }
  res.json({ ok: true });
};

// Payouts (Transfers) via Flutterwave
export const initiatePayout: RequestHandler = async (req, res) => {
  const { amount, account_bank, account_number, narration, reference, currency: curr } = (req.body || {}) as any;
  if (!amount || !account_bank || !account_number) return res.status(400).json({ error: "Missing payout fields" } as ApiError);
  const secret = process.env.FLUTTERWAVE_SECRET_KEY;
  if (!secret) return res.status(500).json({ error: "Flutterwave keys not configured" } as ApiError);
  try {
    const r = await fetch("https://api.flutterwave.com/v3/transfers", {
      method: "POST",
      headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
      body: JSON.stringify({ amount, account_bank, account_number, narration: narration || "Doctor payout", currency: curr || currency(), reference: reference || `payout_${Date.now()}` }),
    });
    const data: any = await r.json();
    if (!r.ok || data?.status !== "success") {
      const msg = (data && (data.message || data.error)) || `HTTP ${r.status}`;
      return res.status(400).json({ error: `Flutterwave payout failed: ${msg}` } as ApiError);
    }
    res.json({ transfer: data.data });
  } catch (err: any) {
    res.status(500).json({ error: `Flutterwave payout exception: ${err?.message || err}` } as ApiError);
  }
};
