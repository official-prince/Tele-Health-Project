import { RequestHandler } from "express";
import { z } from "zod";
import { store as appointments } from "./appointments";
import { profiles } from "./doctor";
import { getSupabaseServiceClient } from "../lib/supabase";
import type { Appointment } from "@shared/api";
import { getUserFromRequest, users, uid as authUid, hashPassword } from './auth';

// Patients suspension list (in-memory)
const suspended = new Set<string>();

// Announcements (simple CMS)
interface Announcement { id: string; title: string; body: string; createdAt: string }
const announcements: Announcement[] = [];

// Support tickets
interface Ticket { id: string; email: string; subject: string; body: string; status: "open"|"resolved"|"closed"; createdAt: string }
const tickets: Ticket[] = [];

// Subscription plans
interface Plan { id: string; name: string; priceUSD: number; commissionPct: number }
let plans: Plan[] = [
  { id: "basic", name: "Basic", priceUSD: 0, commissionPct: 20 },
  { id: "pro", name: "Pro", priceUSD: 49, commissionPct: 10 },
];

// Refunds
interface Refund { id: string; appointmentId: string; amount: number; createdAt: string; reason?: string }
const refunds: Refund[] = [];

// Compliance/security settings
interface SecuritySettings { auditEnabled: boolean; backups: string; hipaaMode: boolean; gdprMode: boolean }
let security: SecuritySettings = { auditEnabled: true, backups: "weekly", hipaaMode: true, gdprMode: true };

// Audit log
interface AuditLog { id: string; time: string; actor: string; action: string; meta?: any }
const logs: AuditLog[] = [];
function log(actor: string, action: string, meta?: any) { logs.unshift({ id: uid(), time: new Date().toISOString(), actor, action, meta }); }
function uid() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }

// Patients
export const getPatients: RequestHandler = async (_req, res) => {
  const supabase = getSupabaseServiceClient();
  if (supabase) {
    try {
      const { data: appts, error } = await supabase.from("appointments").select("patientEmail, patientName, scheduledAt");
      if (!error && Array.isArray(appts)) {
        const map = new Map<string, { email: string; name: string; last: string; suspended: boolean }>();
        for (const a of appts as any[]) {
          const email = String(a.patientEmail).toLowerCase();
          const m = map.get(email) || { email, name: String(a.patientName || email), last: a.scheduledAt, suspended: suspended.has(email) };
          if (new Date(a.scheduledAt) > new Date(m.last)) m.last = a.scheduledAt;
          map.set(email, m);
        }
        return res.json({ patients: Array.from(map.values()) });
      }
      console.warn("Supabase getPatients error, falling back to memory store:", error && (error.message || error));
    } catch (err) {
      console.warn("Supabase getPatients exception, falling back to memory store:", err);
    }
  }

  const map = new Map<string, { email: string; name: string; last: string; suspended: boolean }>();
  for (const a of appointments) {
    const m = map.get(a.patientEmail) || { email: a.patientEmail, name: a.patientName, last: a.scheduledAt, suspended: suspended.has(a.patientEmail) };
    if (new Date(a.scheduledAt) > new Date(m.last)) m.last = a.scheduledAt;
    map.set(a.patientEmail, m);
  }
  res.json({ patients: Array.from(map.values()) });
};

export const patchPatient: RequestHandler = (req, res) => {
  const email = String(req.params.email || "").toLowerCase();
  const set = Boolean((req.body as any)?.suspended);
  if (set) suspended.add(email); else suspended.delete(email);
  log("admin", set ? "suspend_patient" : "unsuspend_patient", { email });
  res.json({ email, suspended: set });
};

// Appointments: refund
export const postRefund: RequestHandler = (req, res) => {
  const id = String(req.params.id);
  const appt = appointments.find(a => a.id === id);
  if (!appt) { res.status(404).json({ error: "Appointment not found" }); return; }
  const amount = Number((req.body as any)?.amount ?? profilesToFee(appt.providerId));
  const reason = (req.body as any)?.reason;
  refunds.push({ id: uid(), appointmentId: id, amount, createdAt: new Date().toISOString(), reason });
  log("admin", "refund", { appointmentId: id, amount });
  res.json({ ok: true });
};

// Finance summary
export const getFinanceSummary: RequestHandler = async (_req, res) => {
  const supabase = getSupabaseServiceClient();
  let appts: Appointment[] = [];
  if (supabase) {
    try {
      const { data, error } = await supabase.from("appointments").select("*");
      if (!error && Array.isArray(data)) appts = data as Appointment[];
      else console.warn("Supabase getFinanceSummary error, falling back to memory store:", error && (error.message || error));
    } catch (err) {
      console.warn("Supabase getFinanceSummary exception, falling back to memory store:", err);
    }
  }

  if (!appts.length) appts = appointments;

  let revenue = 0; let sessions = 0;
  const byProvider: Record<string, { revenue: number; sessions: number }> = {};
  for (const a of appts) {
    if (a.status !== "completed") continue;
    const fee = profilesToFee(a.providerId);
    revenue += fee; sessions += 1;
    byProvider[a.providerId] = byProvider[a.providerId] || { revenue: 0, sessions: 0 };
    byProvider[a.providerId].revenue += fee; byProvider[a.providerId].sessions += 1;
  }
  res.json({ revenue, sessions, providers: byProvider, refunds });
};

function profilesToFee(providerId: string) { const p = Array.from(profiles.values()).find(x => x.providerId === providerId); return p?.feeUSD ?? 120; }

// Plans CRUD
export const getPlans: RequestHandler = (_req, res) => res.json({ plans });
export const upsertPlan: RequestHandler = (req, res) => {
  const schema = z.object({ id: z.string(), name: z.string(), priceUSD: z.number(), commissionPct: z.number() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const i = plans.findIndex(p => p.id === parsed.data.id);
  const plan = parsed.data as Plan;
  if (i >= 0) plans[i] = plan; else plans.push(plan);
  log("admin", "upsert_plan", plan);
  res.json(plan);
};
export const deletePlan: RequestHandler = (req, res) => { plans = plans.filter(p => p.id !== req.params.id); log("admin", "delete_plan", { id: req.params.id }); res.json({ ok: true }); };

// Announcements
export const getAnnouncements: RequestHandler = (_req, res) => res.json({ announcements });
export const postAnnouncement: RequestHandler = (req, res) => { const a: Announcement = { id: uid(), title: String((req.body as any)?.title||""), body: String((req.body as any)?.body||""), createdAt: new Date().toISOString() }; announcements.unshift(a); log("admin","announce",a); res.json(a); };
export const deleteAnnouncement: RequestHandler = (req, res) => { const i = announcements.findIndex(a => a.id === req.params.id); if (i>=0) announcements.splice(i,1); log("admin","delete_announcement",{id:req.params.id}); res.json({ ok: true }); };

// Tickets
export const getTickets: RequestHandler = (_req, res) => res.json({ tickets });
export const postTicket: RequestHandler = (req, res) => { const t: Ticket = { id: uid(), email: String((req.body as any)?.email||""), subject: String((req.body as any)?.subject||""), body: String((req.body as any)?.body||""), status: "open", createdAt: new Date().toISOString() }; tickets.unshift(t); res.json(t); };
export const patchTicket: RequestHandler = (req, res) => { const t = tickets.find(x => x.id === req.params.id); if (!t) { res.status(404).json({ error: "Not found" }); return; } t.status = (req.body as any)?.status || t.status; log("admin","ticket_status",{id:t.id,status:t.status}); res.json(t); };

// Create doctor account (admin-only). Body: { name, email, password, specialty, licenseNumber, licenseState, feeUSD, languages, bio, providerId? }
export const createDoctor: RequestHandler = async (req, res) => {
  const user = getUserFromRequest(req, res);
  if (!user) return;
  if (user.role !== 'admin') { res.status(403).json({ error: 'Forbidden' }); return; }
  const body = req.body as any || {};
  const name = String(body.name || '').trim();
  const email = String(body.email || '').toLowerCase().trim();
  const password = String(body.password || '').trim();
  const specialty = String(body.specialty || 'General').trim();
  const licenseNumber = String(body.licenseNumber || '').trim();
  const licenseState = String(body.licenseState || '').trim();
  const feeUSD = Number(body.feeUSD || 120);
  const languages = Array.isArray(body.languages) ? body.languages : (typeof body.languages === 'string' && body.languages.length ? body.languages.split(',').map((s:string)=>s.trim()) : []);
  const bio = String(body.bio || '');
  const providerId = String(body.providerId || authUid()).slice(0, 36);

  if (!name || !email || !password) { res.status(400).json({ error: 'Missing required fields (name, email, password)' }); return; }
  if (users.has(email)) { res.status(409).json({ error: 'User already exists' }); return; }

  const supabase = getSupabaseServiceClient();
  if (supabase) {
    try {
      // Attempt to create a Supabase auth user using the service role key
      // Prefer admin.createUser when available (v2 client)
      let createdUser: any = null;
      if (supabase.auth && (supabase.auth as any).admin && typeof (supabase.auth as any).admin.createUser === 'function') {
        const r = await (supabase.auth as any).admin.createUser({ email, password, user_metadata: { role: 'doctor', providerId } });
        if (r && (r.error || r.data)) {
          if (r.error) throw r.error;
          createdUser = r.data;
        }
      } else if (supabase.auth && typeof (supabase.auth as any).createUser === 'function') {
        const r = await (supabase.auth as any).createUser({ email, password });
        if (r && (r.error || r.data)) {
          if (r.error) throw r.error;
          createdUser = r.data?.user || r.data;
        }
      }

      // Insert doctor profile row in 'doctors' table (if exists)
      try {
        const doc = {
          user_id: createdUser?.id || authUid(),
          provider_id: providerId,
          display_name: name,
          specialty,
          license_number: licenseNumber,
          license_state: licenseState,
          verification: 'pending',
          fee_usd: feeUSD,
          availability: [],
          languages,
          bio,
          created_at: new Date().toISOString(),
        };
        const { data: inserted, error: insertErr } = await supabase.from('doctors').insert(doc).select().single();
        if (insertErr) {
          console.warn('Supabase insert doctor profile error:', insertErr);
        }
        // create local in-memory mirror as well
        const newUser = { id: createdUser?.id || authUid(), name, email, role: 'doctor' as const, providerId, passwordHash: hashPassword(password, authUid()), salt: authUid(), createdAt: new Date().toISOString() };
        users.set(email, newUser as any);
        const profile = { userId: newUser.id, providerId, displayName: name, specialty, licenseNumber, licenseState, verification: 'pending' as const, feeUSD, availability: [], languages, bio };
        profiles.set(newUser.id, profile as any);
        log('admin', 'create_doctor_supabase', { email, providerId });
        return res.status(201).json({ ok: true, user: { id: newUser.id, name: newUser.name, email: newUser.email, role: 'doctor', providerId }, profile, inserted: inserted || null });
      } catch (err) {
        console.warn('Supabase profile insert exception, falling back to in-memory:', err);
      }
    } catch (err) {
      console.warn('Supabase create user error, falling back to in-memory:', err);
    }
  }

  // Fallback: create user in-memory
  const salt = authUid();
  const newUser = { id: authUid(), name, email, role: 'doctor' as const, providerId, passwordHash: hashPassword(password, salt), salt, createdAt: new Date().toISOString() };
  users.set(email, newUser as any);
  const profile = { userId: newUser.id, providerId, displayName: name, specialty, licenseNumber, licenseState, verification: 'pending' as const, feeUSD, availability: [], languages, bio } as any;
  profiles.set(newUser.id, profile);
  log('admin', 'create_doctor', { email, providerId });
  res.status(201).json({ ok: true, user: { id: newUser.id, name: newUser.name, email: newUser.email, role: 'doctor', providerId }, profile });
};

// Security
export const getSecurity: RequestHandler = (_req, res) => res.json(security);
export const patchSecurity: RequestHandler = (req, res) => { security = { ...security, ...(req.body as Partial<SecuritySettings>) }; log("admin","security_update", security); res.json(security); };

// Logs
export const getLogs: RequestHandler = (_req, res) => res.json({ logs });
