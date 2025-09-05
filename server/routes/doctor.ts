import { RequestHandler } from "express";
import { z } from "zod";
import { getUserFromRequest, users } from "./auth";
import type { DoctorProfile, EarningsSummary } from "@shared/api";
import { sessions } from "./auth";
import { getAllAppointments } from "./appointments";
import { getSupabaseServiceClient } from "../lib/supabase";

export const profiles = new Map<string, DoctorProfile>();

const profileSchema = z.object({
  displayName: z.string().min(2),
  specialty: z.string().min(2),
  licenseNumber: z.string().min(3),
  licenseState: z.string().min(2),
  feeUSD: z.number().min(0),
  availability: z.array(z.object({ day: z.number().min(0).max(6), start: z.string(), end: z.string() })),
  languages: z.array(z.string()).optional(),
  bio: z.string().optional(),
});

export const getMyProfile: RequestHandler = (req, res) => {
  const user = getUserFromRequest(req, res);
  if (!user) return;
  let profile = profiles.get(user.id);
  if (!profile) {
    profile = {
      userId: user.id,
      providerId: user.providerId || user.id,
      displayName: user.name,
      specialty: "General Medicine",
      licenseNumber: "",
      licenseState: "",
      verification: "pending",
      feeUSD: 120,
      availability: [],
    };
    profiles.set(user.id, profile);
  }
  res.json(profile);
};

export const patchMyProfile: RequestHandler = (req, res) => {
  const user = getUserFromRequest(req, res);
  if (!user) return;
  const parsed = profileSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const current = profiles.get(user.id) || {
    userId: user.id,
    providerId: user.providerId || user.id,
    displayName: user.name,
    specialty: "General Medicine",
    licenseNumber: "",
    licenseState: "",
    verification: "pending",
    feeUSD: 120,
    availability: [],
  } as DoctorProfile;
  const next = { ...current, ...parsed.data } as DoctorProfile;
  profiles.set(user.id, next);
  res.json(next);
};

// License upload endpoint (accepts base64 file payload)
export const uploadLicense: RequestHandler = async (req, res) => {
  const user = getUserFromRequest(req, res);
  if (!user) return;

  const { filename, contentType, data } = req.body as { filename?: string; contentType?: string; data?: string };
  if (!filename || !data) {
    res.status(400).json({ error: "Missing filename or data" });
    return;
  }

  const supabase = getSupabaseServiceClient();
  const bucket = process.env.SUPABASE_LICENSE_BUCKET || "licenses";
  const path = `licenses/${user.id}/${Date.now()}-${filename}`;

  // Try to upload to Supabase Storage when available
  if (supabase) {
    try {
      const buffer = Buffer.from(data, "base64");
      const { error: uploadErr } = await supabase.storage.from(bucket).upload(path, buffer, { contentType: contentType || "application/octet-stream", upsert: true });
      if (uploadErr) {
        console.warn("Supabase storage upload error:", uploadErr.message || uploadErr);
      } else {
        const { data: urlData } = await supabase.storage.from(bucket).getPublicUrl(path);
        const url = (urlData && (urlData as any).publicUrl) || urlData?.publicUrl || urlData || null;
        // persist in-memory profile metadata
        const p = profiles.get(user.id) || { userId: user.id, providerId: user.providerId || user.id, displayName: user.name, specialty: "General Medicine", licenseNumber: "", licenseState: "", verification: "pending", feeUSD: 120, availability: [] } as DoctorProfile;
        (p as any).licenseUrl = url;
        p.verification = "pending";
        profiles.set(user.id, p);
        return res.json({ ok: true, url });
      }
    } catch (err) {
      console.warn("Supabase storage upload exception:", err);
    }
  }

  // Fallback: store as data URL in memory (not suitable for production)
  try {
    const dataUrl = `data:${contentType || "application/octet-stream"};base64,${data}`;
    const p = profiles.get(user.id) || { userId: user.id, providerId: user.providerId || user.id, displayName: user.name, specialty: "General Medicine", licenseNumber: "", licenseState: "", verification: "pending", feeUSD: 120, availability: [] } as DoctorProfile;
    (p as any).licenseUrl = dataUrl;
    p.verification = "pending";
    profiles.set(user.id, p);
    return res.json({ ok: true, url: dataUrl });
  } catch (err) {
    console.warn("License fallback storage exception:", err);
    res.status(500).json({ error: "Failed to store license" });
  }
};

export const adminApproveDoctor: RequestHandler = (req, res) => {
  const userId = req.params.userId as string;
  const profile = profiles.get(userId);
  if (!profile) {
    res.status(404).json({ error: "Profile not found" });
    return;
  }
  const status = (req.body?.status as "approved" | "rejected" | undefined) || "approved";
  profile.verification = status;
  profiles.set(userId, profile);
  res.json(profile);
};

export const listDoctors: RequestHandler = (_req, res) => {
  const out = Array.from(profiles.values());
  res.json({ doctors: out });
};

import { RequestHandler as RH } from "express";
import { Appointment } from "@shared/api";

// Lightweight store import from appointments module
import * as appts from "./appointments";

export const getEarnings: RH = async (req, res) => {
  const providerId = req.params.providerId as string;
  const fee = profilesToFee(providerId);

  // Attempt to use Supabase if configured
  const supabase = getSupabaseServiceClient();
  let list: Appointment[] | undefined;
  if (supabase) {
    try {
      const { data, error } = await supabase.from("appointments").select("*").eq("providerId", providerId);
      if (!error && Array.isArray(data)) list = data as Appointment[];
      else console.warn("Supabase getEarnings error, falling back to in-memory:", error && (error.message || error));
    } catch (err) {
      console.warn("Supabase getEarnings exception, falling back to in-memory:", err);
    }
  }

  if (!list) {
    list = (appts as any).store as Appointment[] | undefined;
  }

  const items = (list || []).filter((a) => a.providerId === providerId && a.status === "completed");
  const totalRevenue = items.length * fee;
  const byWeekMap = new Map<string, { revenue: number; sessions: number }>();
  for (const a of items) {
    const d = new Date(a.scheduledAt);
    const key = `${d.getFullYear()}-W${weekOfYear(d)}`;
    const e = byWeekMap.get(key) || { revenue: 0, sessions: 0 };
    e.revenue += fee;
    e.sessions += 1;
    byWeekMap.set(key, e);
  }
  const byWeek = Array.from(byWeekMap.entries()).map(([week, v]) => ({ week, revenue: v.revenue, sessions: v.sessions }));
  const summary: EarningsSummary = {
    totalRevenue,
    completed: items.length,
    cancelled: (list || []).filter((a) => a.providerId === providerId && a.status === "cancelled").length,
    byWeek,
  };
  res.json(summary);
};

// Notifications endpoint for doctor dashboard
export const getNotifications: RequestHandler = (req, res) => {
  const user = getUserFromRequest(req, res);
  if (!user) return;
  const providerId = user.providerId || user.id;
  // Count scheduled appointments (new requests)
  const apptCount = ( (appts as any).store as Appointment[] || []).filter(a => a.providerId === providerId && a.status === 'scheduled').length;

  // Count total messages across provider's appointments
  const messages = (((appts as any).store as Appointment[] || []).filter(a => a.providerId === providerId).flatMap(a => a.messages || []));
  const msgCount = messages.length;

  res.json({ newAppointments: apptCount, messages: msgCount });
};

function profilesToFee(providerId: string) {
  const p = Array.from(profiles.values()).find((x) => x.providerId === providerId);
  return p?.feeUSD ?? 120;
}

function weekOfYear(date: Date) {
  const onejan = new Date(date.getFullYear(), 0, 1);
  return Math.ceil(((date.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) / 7);
}
