import { RequestHandler } from "express";
import { z } from "zod";
import { getSupabaseServiceClient } from "../lib/supabase";
import type {
  Appointment,
  CreateAppointmentRequest,
  CreateAppointmentResponse,
  ApiError,
  AppointmentStatus,
} from "@shared/api";

import { profiles } from "./doctor";

function getProvidersList(filterDay: number | null) {
  const list = Array.from(profiles.values()).map((p) => ({ id: p.providerId, name: p.displayName + (p.specialty ? `, ${p.specialty}` : ""), availability: p.availability || [] }));
  if (filterDay === null) return list;
  return list.filter((p) => (p.availability || []).some((s: any) => s.day === filterDay));
}

const createSchema = z.object({
  patientName: z.string().min(2).max(80),
  patientEmail: z.string().email(),
  patientPhone: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  providerId: z.string(),
  reason: z.string().min(3).max(500),
});

const updateStatusSchema = z.object({ status: z.enum(["scheduled", "cancelled", "completed"]) });

export const store: Appointment[] = [];

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function code() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function toISO(date: string, time: string) {
  const iso = new Date(`${date}T${time}:00`);
  return iso.toISOString();
}

function isWithinAvailability(providerId: string, date: string, time: string) {
  const p = Array.from(profiles.values()).find((x) => x.providerId === providerId);
  if (!p || !Array.isArray(p.availability) || p.availability.length === 0) return true; // if no availability set, allow
  const d = new Date(`${date}T${time}:00`);
  const dow = d.getDay();
  const t = time;
  return p.availability.some((slot: any) => slot.day === dow && t >= slot.start && t <= slot.end);
}

async function fetchAppointmentFromSupabase(supabase: any, id: string) {
  const { data, error } = await supabase.from("appointments").select("*").eq("id", id).limit(1).single();
  if (error) return null;
  return data as Appointment;
}

export const postAppointment: RequestHandler = async (req, res) => {
  const parsed = createSchema.safeParse(req.body as CreateAppointmentRequest);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message } satisfies ApiError);
    return;
  }

  const data = parsed.data;
  const prof = Array.from(profiles.values()).find((p) => p.providerId === data.providerId);
  const providerName = prof ? `${prof.displayName}${prof.specialty ? ", " + prof.specialty : ""}` : "Clinician";
  if (!isWithinAvailability(data.providerId, data.date, data.time)) {
    res.status(400).json({ error: "Selected time is outside provider availability" } as ApiError);
    return;
  }

  const appt: Appointment = {
    id: generateId(),
    createdAt: new Date().toISOString(),
    scheduledAt: toISO(data.date, data.time),
    patientName: data.patientName,
    patientEmail: data.patientEmail,
    patientPhone: data.patientPhone,
    providerId: data.providerId,
    providerName,
    reason: data.reason,
    status: "scheduled",
    confirmationCode: code(),
    meetingUrl: `https://meet.carelink.health/${code().toLowerCase()}`,
  };

  const supabase = getSupabaseServiceClient();
  if (supabase) {
    try {
      const { data: inserted, error } = await supabase.from("appointments").insert(appt).select().single();
      if (error) {
        console.warn("Supabase insert error, falling back to memory store:", error.message || error);
        store.push(appt);
      } else {
        // ensure inserted result shape
        const response: CreateAppointmentResponse = { appointment: inserted as Appointment };
        res.status(201).json(response);
        return;
      }
    } catch (err) {
      console.warn("Supabase insert exception, falling back to memory store:", err);
      store.push(appt);
    }
  } else {
    store.push(appt);
  }

  const response: CreateAppointmentResponse = { appointment: appt };
  res.status(201).json(response);
};

export const getAppointments: RequestHandler = async (req, res) => {
  const email = (req.query.email as string | undefined)?.toLowerCase();
  const providerId = req.query.providerId as string | undefined;

  const supabase = getSupabaseServiceClient();
  if (supabase) {
    try {
      let query: any = supabase.from("appointments").select("*");
      if (email) query = query.eq("patientEmail", email);
      if (providerId) query = query.eq("providerId", providerId);
      // exclude cancelled
      query = query.neq("status", "cancelled");
      const { data, error } = await query.order("scheduledAt", { ascending: false });
      if (!error) {
        return res.json({ appointments: data || [] });
      }
      console.warn("Supabase query error, falling back to memory store:", error.message || error);
    } catch (err) {
      console.warn("Supabase query exception, falling back to memory store:", err);
    }
  }

  let results = store;
  if (email) {
    results = results.filter((a) => a.patientEmail.toLowerCase() === email);
  }
  if (providerId) {
    results = results.filter((a) => a.providerId === providerId);
  }
  results = results.filter((a) => a.status !== "cancelled");
  res.json({ appointments: results });
};

export const listProviders: RequestHandler = (req, res) => {
  const date = (req.query.date as string | undefined) || null;
  const filterDay = date ? new Date(`${date}T00:00:00`).getDay() : null;
  const list = getProvidersList(filterDay);
  res.json({ providers: list.map((p) => ({ id: p.id, name: p.name })) });
};

export const getAllAppointments: RequestHandler = async (_req, res) => {
  const supabase = getSupabaseServiceClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from("appointments").select("*").order("scheduledAt", { ascending: false });
      if (!error) return res.json({ appointments: data || [] });
      console.warn("Supabase list error, falling back to memory store:", error.message || error);
    } catch (err) {
      console.warn("Supabase list exception, falling back to memory store:", err);
    }
  }
  res.json({ appointments: store });
};

export const patchAppointmentStatus: RequestHandler = async (req, res) => {
  const id = req.params.id as string;
  const body = updateStatusSchema.safeParse(req.body as { status: AppointmentStatus });
  if (!body.success) {
    res.status(400).json({ error: body.error.message } satisfies ApiError);
    return;
  }

  const supabase = getSupabaseServiceClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from("appointments").update({ status: body.data.status }).eq("id", id).select().single();
      if (error) {
        console.warn("Supabase update error, falling back to memory store:", error.message || error);
      } else {
        return res.json({ appointment: data });
      }
    } catch (err) {
      console.warn("Supabase update exception, falling back to memory store:", err);
    }
  }

  const appt = store.find((a) => a.id === id);
  if (!appt) {
    res.status(404).json({ error: "Appointment not found" } satisfies ApiError);
    return;
  }
  appt.status = body.data.status;
  res.json({ appointment: appt });
};

export const addIntake: RequestHandler = async (req, res) => {
  const id = req.params.id as string;
  const supabase = getSupabaseServiceClient();
  const intake = req.body as any;

  if (supabase) {
    try {
      const appt = await fetchAppointmentFromSupabase(supabase, id);
      if (!appt) { return res.status(404).json({ error: "Appointment not found" } as ApiError); }
      const newIntake = { symptoms: String(intake.symptoms || ""), medications: intake.medications, allergies: intake.allergies };
      const { data, error } = await supabase.from("appointments").update({ intake: newIntake }).eq("id", id).select().single();
      if (!error) return res.json({ appointment: data });
      console.warn("Supabase update intake error, falling back to memory store:", error.message || error);
    } catch (err) {
      console.warn("Supabase update intake exception, falling back to memory store:", err);
    }
  }

  const appt = store.find((a) => a.id === id);
  if (!appt) { res.status(404).json({ error: "Appointment not found" }); return; }
  appt.intake = { symptoms: String(intake.symptoms || ""), medications: intake.medications, allergies: intake.allergies };
  res.json({ appointment: appt });
};

export const addNote: RequestHandler = async (req, res) => {
  const id = req.params.id as string;
  const body = String((req.body as any)?.body || "");
  const userId = String((req.body as any)?.authorUserId || "unknown");
  const supabase = getSupabaseServiceClient();

  if (supabase) {
    try {
      const appt = await fetchAppointmentFromSupabase(supabase, id);
      if (!appt) { return res.status(404).json({ error: "Appointment not found" } as ApiError); }
      const note = { id: generateId(), authorUserId: userId, createdAt: new Date().toISOString(), body };
      const nextNotes = (appt.notes || []).concat(note);
      const { data, error } = await supabase.from("appointments").update({ notes: nextNotes }).eq("id", id).select().single();
      if (!error) return res.json({ note, appointment: data });
      console.warn("Supabase addNote error, falling back to memory store:", error.message || error);
    } catch (err) {
      console.warn("Supabase addNote exception, falling back to memory store:", err);
    }
  }

  const appt = store.find((a) => a.id === id);
  if (!appt) { res.status(404).json({ error: "Appointment not found" }); return; }
  const note = { id: generateId(), authorUserId: userId, createdAt: new Date().toISOString(), body };
  appt.notes = appt.notes || [];
  appt.notes.push(note);
  res.json({ note, appointment: appt });
};

export const addPrescription: RequestHandler = async (req, res) => {
  const id = req.params.id as string;
  const { medication, dosage, instructions, signedBy, signatureData } = (req.body as any) || {};
  const supabase = getSupabaseServiceClient();

  if (supabase) {
    try {
      const appt = await fetchAppointmentFromSupabase(supabase, id);
      if (!appt) { return res.status(404).json({ error: "Appointment not found" } as ApiError); }
      const presc: any = { id: generateId(), medication, dosage, instructions, signedBy, createdAt: new Date().toISOString() };
      if (signatureData) { presc.signatureData = signatureData; presc.signed = true; presc.signedAt = new Date().toISOString(); }
      const next = (appt.prescriptions || []).concat(presc);
      const { data, error } = await supabase.from("appointments").update({ prescriptions: next }).eq("id", id).select().single();
      if (!error) return res.json({ prescription: presc, appointment: data });
      console.warn("Supabase addPrescription error, falling back to memory store:", error.message || error);
    } catch (err) {
      console.warn("Supabase addPrescription exception, falling back to memory store:", err);
    }
  }

  const appt = store.find((a) => a.id === id);
  if (!appt) { res.status(404).json({ error: "Appointment not found" }); return; }
  const presc: any = { id: generateId(), medication, dosage, instructions, signedBy, createdAt: new Date().toISOString() };
  if (signatureData) { presc.signatureData = signatureData; presc.signed = true; presc.signedAt = new Date().toISOString(); }
  appt.prescriptions = appt.prescriptions || [];
  appt.prescriptions.push(presc);
  res.json({ prescription: presc, appointment: appt });
};

export const getMessages: RequestHandler = async (req, res) => {
  const id = req.params.id as string;
  const supabase = getSupabaseServiceClient();
  if (supabase) {
    try {
      const appt = await fetchAppointmentFromSupabase(supabase, id);
      if (!appt) { return res.status(404).json({ error: "Appointment not found" } as ApiError); }
      return res.json({ messages: appt.messages || [] });
    } catch (err) {
      console.warn("Supabase getMessages exception, falling back to memory store:", err);
    }
  }
  const appt = store.find((a) => a.id === id);
  if (!appt) { res.status(404).json({ error: "Appointment not found" }); return; }
  res.json({ messages: appt.messages || [] });
};

export const postMessage: RequestHandler = async (req, res) => {
  const id = req.params.id as string;
  const supabase = getSupabaseServiceClient();
  const { text, authorUserId } = (req.body as any) || {};

  if (supabase) {
    try {
      const appt = await fetchAppointmentFromSupabase(supabase, id);
      if (!appt) { return res.status(404).json({ error: "Appointment not found" } as ApiError); }
      const msg = { id: generateId(), text: String(text || ""), authorUserId: String(authorUserId || ""), createdAt: new Date().toISOString() };
      const next = (appt.messages || []).concat(msg);
      const { data, error } = await supabase.from("appointments").update({ messages: next }).eq("id", id).select().single();
      if (!error) return res.json({ message: msg });
      console.warn("Supabase postMessage error, falling back to memory store:", error.message || error);
    } catch (err) {
      console.warn("Supabase postMessage exception, falling back to memory store:", err);
    }
  }

  const appt = store.find((a) => a.id === id);
  if (!appt) { res.status(404).json({ error: "Appointment not found" }); return; }
  const msg = { id: generateId(), text: String(text || ""), authorUserId: String(authorUserId || ""), createdAt: new Date().toISOString() };
  appt.messages = appt.messages || [];
  appt.messages.push(msg);
  res.json({ message: msg });
};

export const addReminder: RequestHandler = async (req, res) => {
  const id = req.params.id as string;
  const supabase = getSupabaseServiceClient();
  const date = String((req.body as any)?.date || "");

  if (supabase) {
    try {
      const appt = await fetchAppointmentFromSupabase(supabase, id);
      if (!appt) { return res.status(404).json({ error: "Appointment not found" } as ApiError); }
      const next = (appt.reminders || []).concat(new Date(date).toISOString());
      const { data, error } = await supabase.from("appointments").update({ reminders: next }).eq("id", id).select().single();
      if (!error) return res.json({ reminders: data.reminders });
      console.warn("Supabase addReminder error, falling back to memory store:", error.message || error);
    } catch (err) {
      console.warn("Supabase addReminder exception, falling back to memory store:", err);
    }
  }

  const appt = store.find((a) => a.id === id);
  if (!appt) { res.status(404).json({ error: "Appointment not found" }); return; }
  appt.reminders = appt.reminders || [];
  appt.reminders.push(new Date(date).toISOString());
  res.json({ reminders: appt.reminders });
};

// Upload file for an appointment (attachments, lab reports, etc.)
export const uploadAppointmentFile: RequestHandler = async (req, res) => {
  const id = req.params.id as string;
  const { filename, contentType, data, uploadedBy } = req.body as { filename?: string; contentType?: string; data?: string; uploadedBy?: string };
  if (!filename || !data) { res.status(400).json({ error: 'Missing filename or data' } as ApiError); return; }

  const supabase = getSupabaseServiceClient();
  const bucket = process.env.SUPABASE_LICENSE_BUCKET || 'attachments';
  const path = `attachments/${id}/${Date.now()}-${filename}`;

  if (supabase) {
    try {
      const buffer = Buffer.from(data, 'base64');
      const { error: uploadErr } = await supabase.storage.from(bucket).upload(path, buffer, { contentType: contentType || 'application/octet-stream', upsert: true });
      if (!uploadErr) {
        const { data: urlData } = await supabase.storage.from(bucket).getPublicUrl(path);
        const url = (urlData && (urlData as any).publicUrl) || urlData?.publicUrl || urlData || null;
        // persist in-memory
        const appt = store.find(a => a.id === id);
        const fileObj = { id: generateId(), filename, url, uploadedAt: new Date().toISOString(), uploadedBy };
        if (appt) {
          appt.files = (appt.files || []).concat(fileObj as any);
        }
        return res.json({ ok: true, file: fileObj });
      }
      console.warn('Supabase upload error:', uploadErr);
    } catch (err) {
      console.warn('Supabase upload exception:', err);
    }
  }

  // Fallback: use data URL
  try {
    const dataUrl = `data:${contentType || 'application/octet-stream'};base64,${data}`;
    const appt = store.find(a => a.id === id);
    const fileObj = { id: generateId(), filename, url: dataUrl, uploadedAt: new Date().toISOString(), uploadedBy };
    if (appt) appt.files = (appt.files || []).concat(fileObj as any);
    res.json({ ok: true, file: fileObj });
  } catch (err) {
    console.warn('Fallback file store exception:', err);
    res.status(500).json({ error: 'Failed to store file' } as ApiError);
  }
};

// Create a simple meeting endpoint (placeholder). Integrate Twilio/other provider here.
export const createMeeting: RequestHandler = async (req, res) => {
  const id = req.params.id as string;
  // In real integration, call Twilio or Jitsi API to create a meeting and return a secure URL.
  // Here we generate a deterministic meeting URL and persist it to the appointment.
  const supabase = getSupabaseServiceClient();
  const meetingUrl = `https://meet.carelink.health/${Math.random().toString(36).slice(2,8)}`;
  if (supabase) {
    try {
      const { data, error } = await supabase.from('appointments').update({ meetingUrl }).eq('id', id).select().single();
      if (!error) return res.json({ meetingUrl, appointment: data });
      console.warn('Supabase createMeeting error, falling back to memory store:', error);
    } catch (err) {
      console.warn('Supabase createMeeting exception, falling back to memory store:', err);
    }
  }
  const appt = store.find(a => a.id === id);
  if (!appt) return res.status(404).json({ error: 'Appointment not found' });
  appt.meetingUrl = meetingUrl;
  res.json({ meetingUrl, appointment: appt });
};

// Sign an existing prescription with signature data (e-signature placeholder)
export const signPrescription: RequestHandler = async (req, res) => {
  const id = req.params.id as string;
  const prescId = req.params.prescId as string;
  const { signatureData, signedBy } = req.body as { signatureData?: string; signedBy?: string };
  const supabase = getSupabaseServiceClient();

  if (supabase) {
    try {
      const appt = await fetchAppointmentFromSupabase(supabase, id);
      if (!appt) return res.status(404).json({ error: 'Appointment not found' });
      const presc = (appt.prescriptions || []).find((p: any) => p.id === prescId);
      if (!presc) return res.status(404).json({ error: 'Prescription not found' });
      presc.signed = true;
      presc.signedAt = new Date().toISOString();
      if (signatureData) presc.signatureData = signatureData;
      if (signedBy) presc.signedBy = signedBy;
      const { data, error } = await supabase.from('appointments').update({ prescriptions: appt.prescriptions }).eq('id', id).select().single();
      if (!error) return res.json({ prescription: presc, appointment: data });
      console.warn('Supabase signPrescription error, falling back to memory store:', error);
    } catch (err) {
      console.warn('Supabase signPrescription exception, falling back to memory store:', err);
    }
  }

  const appt = store.find(a => a.id === id);
  if (!appt) return res.status(404).json({ error: 'Appointment not found' });
  const presc = (appt.prescriptions || []).find(p => p.id === prescId);
  if (!presc) return res.status(404).json({ error: 'Prescription not found' });
  presc.signed = true;
  presc.signedAt = new Date().toISOString();
  if (signatureData) presc.signatureData = signatureData;
  if (signedBy) presc.signedBy = signedBy;
  res.json({ prescription: presc, appointment: appt });
};

// Simple in-memory payouts store (replace with Stripe or payment provider integration)
export const payoutsStore: Record<string, any[]> = {};

export const getPayouts: RequestHandler = async (req, res) => {
  const providerId = req.params.providerId as string;
  const list = payoutsStore[providerId] || [];
  res.json({ payouts: list });
};

export const postPayout: RequestHandler = async (req, res) => {
  const providerId = req.params.providerId as string;
  const { amount, date, status } = req.body as { amount?: number; date?: string; status?: string };
  if (!amount) return res.status(400).json({ error: 'Missing amount' });
  const payout = { id: generateId(), amount, date: date || new Date().toISOString(), status: status || 'pending' };
  payoutsStore[providerId] = payoutsStore[providerId] || [];
  payoutsStore[providerId].push(payout);
  res.json({ payout });
};
