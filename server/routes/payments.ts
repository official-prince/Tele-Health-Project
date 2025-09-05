import type { RequestHandler } from "express";
import crypto from "crypto";
import { store as apptStore } from "./appointments";
import type { ApiError, PaymentReceipt } from "@shared/api";

const payments = new Map<string, PaymentReceipt>();

function minorUnits(amount: number): number {
  // Paystack expects amount in lowest currency unit; for GHS it's pesewas
  return Math.round(amount * 100);
}

function getCurrency() {
  return process.env.CURRENCY || "GHS";
}

function generateReceiptId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export const initiatePaystack: RequestHandler = async (req, res) => {
  const { appointmentId, email, amount, callbackUrl } = (req.body || {}) as { appointmentId?: string; email?: string; amount?: number; callbackUrl?: string };
  if (!appointmentId || !email || !amount) {
    return res.status(400).json({ error: "Missing appointmentId, email or amount" } as ApiError);
  }
  const secret = process.env.PAYSTACK_SECRET_KEY;
  const pub = process.env.PAYSTACK_PUBLIC_KEY;
  if (!secret || !pub) {
    return res.status(500).json({ error: "Paystack keys not configured" } as ApiError);
  }
  const reference = `carelink_${appointmentId}_${Date.now()}`;
  const currency = getCurrency();
  try {
    const r = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, amount: minorUnits(amount), currency, reference, callback_url: callbackUrl }),
    });
    const data = (await r.json()) as any;
    if (!r.ok || !data?.status) {
      const msg = (data && (data.message || data.error)) || `HTTP ${r.status}`;
      return res.status(400).json({ error: `Paystack init failed: ${msg}` } as ApiError);
    }
    const receipt: PaymentReceipt = {
      id: generateReceiptId(),
      provider: "paystack",
      appointmentId,
      reference,
      amount,
      currency,
      status: "pending",
      customerEmail: email,
      createdAt: new Date().toISOString(),
    };
    payments.set(reference, receipt);
    res.json({ authorization_url: data.data.authorization_url, access_code: data.data.access_code, reference });
  } catch (err: any) {
    res.status(500).json({ error: `Paystack init exception: ${err?.message || err}` } as ApiError);
  }
};

export const verifyPaystack: RequestHandler = async (req, res) => {
  const reference = String(req.query.reference || "");
  if (!reference) return res.status(400).json({ error: "Missing reference" } as ApiError);
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) return res.status(500).json({ error: "Paystack secret not configured" } as ApiError);
  try {
    const r = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${secret}` },
    });
    const data = (await r.json()) as any;
    if (!r.ok || !data?.status) {
      const msg = (data && (data.message || data.error)) || `HTTP ${r.status}`;
      return res.status(400).json({ error: `Paystack verify failed: ${msg}` } as ApiError);
    }
    const status: string = data.data.status;
    let receipt = payments.get(reference);
    if (!receipt) {
      receipt = {
        id: generateReceiptId(),
        provider: "paystack",
        appointmentId: String((data.data?.metadata && data.data.metadata.appointmentId) || "unknown"),
        reference,
        amount: Number(data.data.amount) / 100,
        currency: data.data.currency || getCurrency(),
        status: status === "success" ? "paid" : status as any,
        customerEmail: String(data.data.customer?.email || ""),
        createdAt: new Date().toISOString(),
      };
    }
    receipt.status = status === "success" ? "paid" : (status as any);
    if (status === "success") {
      receipt.paidAt = new Date(data.data.paid_at || Date.now()).toISOString();
      receipt.transactionId = String(data.data.id);
      // attach to appointment (in-memory)
      const appt = apptStore.find(a => a.id === receipt!.appointmentId);
      if (appt) {
        (appt as any).payments = ((appt as any).payments || []).concat(receipt);
        (appt as any).paid = true;
      }
    }
    payments.set(reference, receipt);
    res.json({ receipt });
  } catch (err: any) {
    res.status(500).json({ error: `Paystack verify exception: ${err?.message || err}` } as ApiError);
  }
};

export const paystackWebhook: RequestHandler = async (req, res) => {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) return res.status(500).json({ error: "Paystack secret not configured" } as ApiError);
  const signature = req.headers["x-paystack-signature"] as string | undefined;
  const raw = JSON.stringify(req.body || {});
  const hash = crypto.createHmac("sha512", secret).update(raw).digest("hex");
  if (!signature || signature !== hash) {
    return res.status(401).json({ error: "Invalid signature" } as ApiError);
  }
  const event = req.body;
  if (event?.event === "charge.success") {
    const data = event.data;
    const reference = data.reference as string;
    let receipt = payments.get(reference);
    if (!receipt) {
      receipt = {
        id: generateReceiptId(),
        provider: "paystack",
        appointmentId: String((data.metadata && data.metadata.appointmentId) || "unknown"),
        reference,
        amount: Number(data.amount) / 100,
        currency: data.currency || getCurrency(),
        status: "paid",
        customerEmail: String(data.customer?.email || ""),
        createdAt: new Date().toISOString(),
      };
    }
    receipt.status = "paid";
    receipt.paidAt = new Date(data.paid_at || Date.now()).toISOString();
    receipt.transactionId = String(data.id);
    payments.set(reference, receipt);
    const appt = apptStore.find(a => a.id === receipt!.appointmentId);
    if (appt) {
      (appt as any).payments = ((appt as any).payments || []).concat(receipt);
      (appt as any).paid = true;
    }
  }
  res.json({ ok: true });
};

export const getReceipt: RequestHandler = async (req, res) => {
  const reference = req.params.reference as string;
  const receipt = payments.get(reference);
  if (!receipt) return res.status(404).json({ error: "Receipt not found" } as ApiError);
  res.json({ receipt });
};
