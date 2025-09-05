import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/components/AuthProvider";
import type { Appointment, DoctorProfile, Prescription, Note } from "@shared/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { createBrowserSupabaseClient } from "@/lib/supabaseClient";
import DoctorSidebar from "@/components/DoctorSidebar";
import { CalendarSection, TodayList } from "@/pages/calendarHelpers";

const supabase = createBrowserSupabaseClient();

export default function Doctor() {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Appointment[]>([]);
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [tab, setTab] = useState<string>('dashboard');

  const refreshAppts = async () => {
    if (!user?.providerId) return;
    setLoading(true);
    if (supabase) {
      try {
        const { data, error } = await supabase.from("appointments").select("*").eq("providerId", user.providerId).order("scheduledAt", { ascending: false });
        if (!error && Array.isArray(data)) {
          setItems(data as Appointment[]);
          setLoading(false);
          return;
        }
        console.warn("Supabase fetch appointments error, falling back to API:", error);
      } catch (err) {
        console.warn("Supabase fetch appointments exception, falling back to API:", err);
      }
    }

    const res = await fetch(`/api/appointments?providerId=${user.providerId}`);
    const data = await res.json();
    setItems(data.appointments ?? []);
    setLoading(false);
  };

  const loadProfile = async () => {
    if (!user) return;
    if (supabase) {
      try {
        const { data, error } = await supabase.from("doctors").select("*").eq("userId", user.id).single();
        if (!error && data) {
          setProfile(data as DoctorProfile);
          return;
        }
        console.warn("Supabase fetch profile error, falling back to API:", error);
      } catch (err) {
        console.warn("Supabase fetch profile exception, falling back to API:", err);
      }
    }

    const res = await fetch('/api/doctor/me', { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
    const data = await res.json();
    setProfile(data);
  };

  useEffect(() => { refreshAppts(); loadProfile(); }, [user?.providerId, user?.id]);

  // Stats
  const stats = useMemo(() => ({
    total: items.length,
    scheduled: items.filter(a => a.status === 'scheduled').length,
    completed: items.filter(a => a.status === 'completed').length,
    cancelled: items.filter(a => a.status === 'cancelled').length,
  }), [items]);

  // Notifications: poll server for new appointment requests and messages
  const [notifications, setNotifications] = useState<{ newAppointments: number; messages: number } | null>(null);
  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetch('/api/doctor/notifications', { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
        if (!res.ok) return;
        const data = await res.json();
        if (mounted) setNotifications(data);
      } catch (err) {
        // ignore
      }
    }
    load();
    const id = setInterval(load, 30000);
    return () => { mounted = false; clearInterval(id); };
  }, []);

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Doctor portal</h1>
          <p className="text-muted-foreground">Welcome, manage your practice</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">Verification: <span className="font-medium text-foreground">{profile?.verification ?? 'pending'}</span></div>
          {notifications && (notifications.newAppointments > 0 || notifications.messages > 0) && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10">
              {notifications.newAppointments > 0 && <div className="text-sm">📅 {notifications.newAppointments} new</div>}
              {notifications.messages > 0 && <div className="text-sm">💬 {notifications.messages}</div>}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
        <DoctorSidebar tab={tab} setTab={setTab} />
        <div>
          {/* Dashboard */}
          {tab === 'dashboard' && (
            <div>
              <section className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                <Stat title="Total" value={stats.total} />
                <Stat title="Scheduled" value={stats.scheduled} />
                <Stat title="Completed" value={stats.completed} />
                <Stat title="Cancelled" value={stats.cancelled} />
              </section>

              <div className="mt-6 grid md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader><CardTitle>Calendar</CardTitle></CardHeader>
                  <CardContent>
                    {/* Calendar shows upcoming appointments. Integrate server-side calendar or Google Calendar sync here. */}
                    <CalendarSection items={items} />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Today's schedule</CardTitle></CardHeader>
                  <CardContent>
                    {/* List of appointments for the selected day */}
                    <TodayList items={items} />
                  </CardContent>
                </Card>
              </div>

              <div className="mt-6 grid gap-4">
                {loading && <Loader2 className="h-5 w-5 animate-spin" />}
                {!loading && items.length === 0 && <p className="text-sm text-muted-foreground">No appointments.</p>}
                {items.map((a) => (
                  <Card key={a.id}>
                    <CardContent className="py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div>
                        <div className="font-medium">{a.patientName} • {new Date(a.scheduledAt).toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">Reason: {a.reason}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <a className="text-primary underline" href={a.meetingUrl} target="_blank" rel="noreferrer">Join</a>
                        <Button variant="outline" onClick={() => setStatus(a.id, 'completed', refreshAppts)}>Mark completed</Button>
                        <Button variant="destructive" onClick={() => setStatus(a.id, 'cancelled', refreshAppts)}>Cancel</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Consultations */}
          {tab === 'consult' && <Consultations items={items} refresh={refreshAppts} />}

          {/* Appointments list (full) */}
          {tab === 'appointments' && (
            <div>
              <h2 className="text-lg font-semibold mb-4">All appointments</h2>
              <div className="grid gap-3">
                {items.map(a => (
                  <Card key={a.id}><CardContent className="py-4 flex items-center justify-between"><div><div className="font-medium">{a.patientName}</div><div className="text-sm text-muted-foreground">{new Date(a.scheduledAt).toLocaleString()}</div></div><div className="text-sm">{a.status}</div></CardContent></Card>
                ))}
              </div>
            </div>
          )}

          {/* Patients */}
          {tab === 'patients' && <Patients items={items} />}

          {/* Prescriptions */}
          {tab === 'prescriptions' && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Prescriptions</h2>
              <p className="text-sm text-muted-foreground">Use the Consultations tab to issue e-prescriptions. Backend hooks exist at /api/appointments/:id/prescriptions</p>
            </div>
          )}

          {/* Earnings */}
          {tab === 'earnings' && <Earnings providerId={user?.providerId || ''} />}

          {/* Settings */}
          {tab === 'settings' && <Settings profile={profile} onChange={setProfile} />}
        </div>
      </div>
    </div>
  );
}

function Stat({ title, value }: { title: string; value: number }) {
  return (
    <Card>
      <CardContent className="py-4">
        <div className="text-sm text-muted-foreground">{title}</div>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

async function setStatus(id: string, status: 'completed' | 'cancelled', after?: () => void) {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('appointments').update({ status }).eq('id', id).select().single();
      if (!error) { after && after(); return; }
      console.warn('Supabase update status error, falling back to API:', error);
    } catch (err) {
      console.warn('Supabase update status exception, falling back to API:', err);
    }
  }
  await fetch(`/api/appointments/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
  after && after();
}

function Consultations({ items, refresh }: { items: Appointment[]; refresh: () => void }) {
  const { user } = useAuth();
  const [selected, setSelected] = useState<string>(items[0]?.id || "");
  const appt = items.find(a => a.id === selected);
  useEffect(() => { if (!selected && items[0]) setSelected(items[0].id); }, [items]);

  const [note, setNote] = useState("");
  const [rx, setRx] = useState({ medication: "", dosage: "", instructions: "" });
  const [signature, setSignature] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => { (async () => {
    if (!selected) return;
    if (supabase) {
      try {
        const { data, error } = await supabase.from('appointments').select('messages').eq('id', selected).single();
        if (!error && data) { setMessages(data.messages || []); return; }
        console.warn('Supabase get messages error, falling back to API:', error);
      } catch (err) {
        console.warn('Supabase get messages exception, falling back to API:', err);
      }
    }
    const res = await fetch(`/api/appointments/${selected}/messages`);
    const d = await res.json();
    setMessages(d.messages || []);
  })(); }, [selected]);

  const sendNote = async () => {
    if (!selected || !note) return;
    if (supabase) {
      try {
        const { data: appt, error: fetchErr } = await supabase.from('appointments').select('notes').eq('id', selected).single();
        if (!fetchErr && appt) {
          const noteObj = { id: Math.random().toString(36).slice(2) + Date.now().toString(36), authorUserId: user?.id || 'unknown', createdAt: new Date().toISOString(), body: note };
          const next = (appt.notes || []).concat(noteObj);
          const { error } = await supabase.from('appointments').update({ notes: next }).eq('id', selected);
          if (!error) { setNote(''); refresh(); return; }
          console.warn('Supabase add note error, falling back to API:', error);
        }
      } catch (err) {
        console.warn('Supabase add note exception, falling back to API:', err);
      }
    }
    await fetch(`/api/appointments/${selected}/notes`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ body: note, authorUserId: user?.id }) });
    setNote("");
    refresh();
  };

  const createMeeting = async () => {
    if (!selected) return;
    try {
      const res = await fetch(`/api/appointments/${selected}/create-meeting`, { method: 'POST' });
      if (!res.ok) return;
      await res.json();
      refresh();
    } catch (err) {
      console.warn('Create meeting failed', err);
    }
  };

  const sendRx = async () => {
    if (!selected || !rx.medication) return;
    if (supabase) {
      try {
        const { data: appt, error: fetchErr } = await supabase.from('appointments').select('prescriptions').eq('id', selected).single();
        if (!fetchErr && appt) {
          const presc: any = { id: Math.random().toString(36).slice(2) + Date.now().toString(36), medication: rx.medication, dosage: rx.dosage, instructions: rx.instructions, signedBy: user?.name || '', createdAt: new Date().toISOString() };
          if (signature) { presc.signatureData = signature; presc.signed = true; presc.signedAt = new Date().toISOString(); }
          const next = (appt.prescriptions || []).concat(presc);
          const { error } = await supabase.from('appointments').update({ prescriptions: next }).eq('id', selected);
          if (!error) { setRx({ medication: "", dosage: "", instructions: "" }); setSignature(''); refresh(); return; }
          console.warn('Supabase add prescription error, falling back to API:', error);
        }
      } catch (err) {
        console.warn('Supabase add prescription exception, falling back to API:', err);
      }
    }
    await fetch(`/api/appointments/${selected}/prescriptions`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...rx, signedBy: user?.name, signatureData: signature }) });
    setRx({ medication: "", dosage: "", instructions: "" });
    setSignature('');
    refresh();
  };

  const sendChat = async () => {
    if (!selected || !chatInput) return;
    if (supabase) {
      try {
        const { data: appt, error: fetchErr } = await supabase.from('appointments').select('messages').eq('id', selected).single();
        if (!fetchErr && appt) {
          const msg = { id: Math.random().toString(36).slice(2) + Date.now().toString(36), text: chatInput, authorUserId: user?.id || '', createdAt: new Date().toISOString() };
          const next = (appt.messages || []).concat(msg);
          const { error } = await supabase.from('appointments').update({ messages: next }).eq('id', selected);
          if (!error) { setChatInput(''); const { data: refreshed } = await supabase.from('appointments').select('messages').eq('id', selected).single(); setMessages(refreshed?.messages || []); return; }
          console.warn('Supabase post message error, falling back to API:', error);
        }
      } catch (err) {
        console.warn('Supabase post message exception, falling back to API:', err);
      }
    }
    await fetch(`/api/appointments/${selected}/messages`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: chatInput, authorUserId: user?.id }) });
    setChatInput("");
    const res = await fetch(`/api/appointments/${selected}/messages`);
    const data = await res.json();
    setMessages(data.messages || []);
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div>
        <Card>
          <CardHeader><CardTitle>Active consultation</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium">Select appointment</label>
              <Select value={selected} onValueChange={setSelected}>
                <SelectTrigger><SelectValue placeholder="Choose" /></SelectTrigger>
                <SelectContent>
                  {items.map(a => <SelectItem key={a.id} value={a.id}>{new Date(a.scheduledAt).toLocaleString()} • {a.patientName}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {appt && (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <a className="text-primary underline" href={appt.meetingUrl} target="_blank" rel="noreferrer">Join secure video</a>
                  {!appt.meetingUrl && <Button size="sm" onClick={createMeeting}>Create meeting</Button>}
                </div>
                {appt.intake && (
                  <div className="text-sm text-muted-foreground">
                    <div>Symptoms: {appt.intake.symptoms}</div>
                    {appt.intake.medications && <div>Medications: {appt.intake.medications}</div>}
                    {appt.intake.allergies && <div>Allergies: {appt.intake.allergies}</div>}
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium">Add note</label>
                  <Textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
                  <div className="mt-2 flex justify-end"><Button onClick={sendNote}>Save note</Button></div>
                </div>
                <div>
                  <label className="text-sm font-medium">Prescription (e-sign)</label>
                  <div className="grid sm:grid-cols-3 gap-2">
                    <Input placeholder="Medication" value={rx.medication} onChange={(e) => setRx({ ...rx, medication: e.target.value })} />
                    <Input placeholder="Dosage" value={rx.dosage} onChange={(e) => setRx({ ...rx, dosage: e.target.value })} />
                    <Input placeholder="Instructions" value={rx.instructions} onChange={(e) => setRx({ ...rx, instructions: e.target.value })} />
                  </div>
                  <div className="mt-2">
                    <label className="text-sm">E-sign (type full name to sign)</label>
                    <Input placeholder="Your full name" value={signature} onChange={(e) => setSignature(e.target.value)} />
                  </div>
                  <div className="mt-2 flex justify-end"><Button onClick={sendRx}>Issue prescription</Button></div>
                </div>

                <div>
                  <label className="text-sm font-medium">Share files / reports</label>
                  <div className="mt-2">
                    <input type="file" accept="image/*,application/pdf" onChange={async (e) => {
                      const file = e.target.files?.[0]; if (!file || !selected) return;
                      const reader = new FileReader();
                      reader.onload = async () => {
                        const result = reader.result as string;
                        const base64 = result.split(',')[1];
                        // Try client-side Supabase first
                        if (supabase) {
                          try {
                            const bucket = (import.meta.env.VITE_SUPABASE_LICENSE_BUCKET as string) || 'attachments';
                            const path = `attachments/${selected}/${Date.now()}-${file.name}`;
                            const { error } = await supabase.storage.from(bucket).upload(path, file as any, { contentType: file.type, upsert: true });
                            if (!error) {
                              const { data: urlData } = await supabase.storage.from(bucket).getPublicUrl(path);
                              const url = (urlData && (urlData as any).publicUrl) || urlData?.publicUrl || null;
                              // Update messages locally
                              setMessages((m) => m.concat([{ id: Math.random().toString(), text: `Uploaded ${file.name}`, authorUserId: user?.id || '', createdAt: new Date().toISOString() }]));
                              return;
                            }
                          } catch (err) { console.warn('Supabase client upload failed', err); }
                        }
                        // Fallback: upload to server endpoint
                        try {
                          const res = await fetch(`/api/appointments/${selected}/files`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ filename: file.name, contentType: file.type, data: base64, uploadedBy: user?.id }) });
                          const d = await res.json();
                          if (d.file) setMessages((m) => m.concat([{ id: Math.random().toString(), text: `Uploaded ${file.name}`, authorUserId: user?.id || '', createdAt: new Date().toISOString() }]));
                        } catch (err) { console.warn('File upload failed', err); }
                      };
                      reader.readAsDataURL(file);
                    }} />
                  </div>
                </div>

                <FollowUp id={selected} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <div>
        <Card>
          <CardHeader><CardTitle>Secure chat</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64 overflow-auto border rounded p-3 space-y-2 bg-muted/30">
              {messages.map((m) => (
                <div key={m.id} className="text-sm"><span className="text-muted-foreground">{new Date(m.createdAt).toLocaleTimeString()}:</span> {m.text}</div>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <Input placeholder="Type a message" value={chatInput} onChange={(e) => setChatInput(e.target.value)} />
              <Button onClick={sendChat}>Send</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Patients({ items }: { items: Appointment[] }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [history, setHistory] = useState<Appointment[] | null>(null);
  const list = useMemo(() => {
    const map = new Map<string, { name: string; email: string; last: string }>();
    for (const a of items) {
      const m = map.get(a.patientEmail) || { name: a.patientName, email: a.patientEmail, last: a.scheduledAt };
      if (new Date(a.scheduledAt) > new Date(m.last)) m.last = a.scheduledAt;
      map.set(a.patientEmail, m);
    }
    return Array.from(map.values());
  }, [items]);

  const open = async (email: string) => {
    setSelected(email);
    // fetch patient history (server endpoint /api/appointments?email=... exists)
    try {
      const res = await fetch(`/api/appointments?email=${encodeURIComponent(email)}`);
      const d = await res.json();
      setHistory(d.appointments || []);
    } catch (err) {
      setHistory([]);
    }
  };

  const close = () => { setSelected(null); setHistory(null); };

  return (
    <div className="grid gap-3">
      {list.map((p) => (
        <Card key={p.email}><CardContent className="py-4 flex items-center justify-between"><div><div className="font-medium">{p.name}</div><div className="text-sm text-muted-foreground">{p.email}</div></div><div className="text-sm"><button className="text-primary underline" onClick={() => open(p.email)}>View</button></div></CardContent></Card>
      ))}
      {list.length === 0 && <p className="text-sm text-muted-foreground">No patients yet.</p>}

      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Patient history — {selected}</h3>
              <button onClick={close} className="text-sm text-muted-foreground">Close</button>
            </div>
            <div className="space-y-3 max-h-96 overflow-auto">
              {!history && <div className="text-sm text-muted-foreground">Loading...</div>}
              {history && history.length === 0 && <div className="text-sm text-muted-foreground">No history.</div>}
              {history && history.map(h => (
                <Card key={h.id}><CardContent className="py-3 text-sm"><div className="font-medium">{h.providerName} • {new Date(h.scheduledAt).toLocaleString()}</div><div className="text-muted-foreground">Status: {h.status}</div><div className="mt-2">Reason: {h.reason}</div></CardContent></Card>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FollowUp({ id }: { id: string }) {
  const [date, setDate] = useState("");
  const save = async () => {
    if (!id || !date) return;
    if (supabase) {
      try {
        const { data: appt, error: fetchErr } = await supabase.from('appointments').select('reminders').eq('id', id).single();
        if (!fetchErr && appt) {
          const next = (appt.reminders || []).concat(new Date(date).toISOString());
          const { error } = await supabase.from('appointments').update({ reminders: next }).eq('id', id);
          if (!error) { setDate(''); return; }
          console.warn('Supabase add reminder error, falling back to API:', error);
        }
      } catch (err) {
        console.warn('Supabase add reminder exception, falling back to API:', err);
      }
    }
    await fetch(`/api/appointments/${id}/reminders`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ date }) });
    setDate("");
  };
  return (
    <div className="mt-3">
      <label className="text-sm font-medium">Schedule follow-up reminder</label>
      <div className="mt-1 flex gap-2">
        <Input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} />
        <Button onClick={save}>Add</Button>
      </div>
    </div>
  );
}

function Earnings({ providerId }: { providerId: string }) {
  const [data, setData] = useState<any>(null);
  useEffect(() => { (async () => {
    if (!providerId) return;
    if (supabase) {
      try {
        const { data: appts, error } = await supabase.from('appointments').select('*').eq('providerId', providerId);
        if (!error && Array.isArray(appts)) {
          const completed = (appts as any[]).filter((a) => a.status === 'completed');
          const fee = completed.length ? (completed[0].feeUSD || 120) : 120;
          let totalRevenue = 0;
          const byWeekMap = new Map<string, { revenue: number; sessions: number }>();
          for (const a of completed) {
            const f = a.feeUSD ?? fee ?? 120;
            totalRevenue += f;
            const d = new Date(a.scheduledAt);
            const key = `${d.getFullYear()}-W${weekOfYear(d)}`;
            const e = byWeekMap.get(key) || { revenue: 0, sessions: 0 };
            e.revenue += f;
            e.sessions += 1;
            byWeekMap.set(key, e);
          }
          const byWeek = Array.from(byWeekMap.entries()).map(([week, v]) => ({ week, revenue: v.revenue, sessions: v.sessions }));
          setData({ totalRevenue, completed: completed.length, cancelled: (appts as any[]).filter((a) => a.status === 'cancelled').length, byWeek });
          return;
        }
        console.warn('Supabase earnings error, falling back to API:', error);
      } catch (err) {
        console.warn('Supabase earnings exception, falling back to API:', err);
      }
    }
    const res = await fetch(`/api/doctor/${providerId}/earnings`);
    const d = await res.json();
    setData(d);
  })(); }, [providerId]);
  const hasData = !!data;
  const exportCsv = () => {
    const rows: string[] = [];
    rows.push(["week","revenue","sessions"].join(','));
    for (const r of (data?.byWeek || [])) rows.push([`"${r.week}"`, r.revenue, r.sessions].join(','));
    rows.push('');
    rows.push(["totalRevenue", data?.totalRevenue ?? 0].join(','));
    const csv = rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `earnings-${providerId || 'me'}.csv`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  };
  const [payouts, setPayouts] = useState<any[]>([]);
  const [creating, setCreating] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState<number | ''>('');

  useEffect(() => { (async () => {
    if (!providerId) return;
    try {
      const res = await fetch(`/api/doctor/${providerId}/payouts`);
      if (res.ok) {
        const d = await res.json();
        setPayouts(d.payouts || []);
      }
    } catch (err) { console.warn('Failed to load payouts', err); }
  })(); }, [providerId]);

  const createPayout = async () => {
    if (!providerId || !payoutAmount) return;
    setCreating(true);
    try {
      const res = await fetch(`/api/doctor/${providerId}/payouts`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount: Number(payoutAmount) }) });
      const d = await res.json();
      if (d.payout) setPayouts((s) => [d.payout, ...s]);
      setPayoutAmount('');
    } catch (err) { console.warn('Create payout failed', err); }
    setCreating(false);
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader><div className="flex items-center justify-between"><CardTitle>Summary</CardTitle><Button onClick={exportCsv} size="sm">Export CSV</Button></div></CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <Stat title="Revenue" value={data?.totalRevenue || 0} />
          <Stat title="Completed" value={data?.completed || 0} />
          <Stat title="Cancelled" value={data?.cancelled || 0} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Weekly</CardTitle></CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data?.byWeek || []}>
              <XAxis dataKey="week" hide />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" fill="#22c3e6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Payouts</CardTitle></CardHeader>
        <CardContent>
          <div className="mb-4">
            <label className="text-sm font-medium">Create payout</label>
            <div className="mt-2 flex gap-2 items-center">
              <Input type="number" placeholder="Amount (USD)" value={payoutAmount as any} onChange={(e) => setPayoutAmount(e.target.value === '' ? '' : Number(e.target.value))} />
              <Button onClick={createPayout} disabled={creating || !payoutAmount}>{creating ? 'Creating...' : 'Create'}</Button>
            </div>
            <div className="text-xs text-muted-foreground mt-2">Payouts are simulated in-memory. Connect Stripe to process real payouts.</div>
          </div>

          <div>
            {payouts.length === 0 && <div className="text-sm text-muted-foreground">No payouts yet.</div>}
            {payouts.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-2 border-b">
                <div>
                  <div className="font-medium">${p.amount}</div>
                  <div className="text-xs text-muted-foreground">{new Date(p.date || p.createdAt || Date.now()).toLocaleString()}</div>
                </div>
                <div className="text-sm">{p.status}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function weekOfYear(date: Date) {
  const onejan = new Date(date.getFullYear(), 0, 1);
  return Math.ceil(((date.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) / 7);
}

function Settings({ profile, onChange }: { profile: DoctorProfile | null; onChange: (p: DoctorProfile) => void }) {
  const { token } = useAuth();
  const [form, setForm] = useState<DoctorProfile | null>(profile);
  useEffect(() => setForm(profile), [profile]);
  if (!form) return null;

  const save = async () => {
    if (supabase) {
      try {
        const payload = { displayName: form.displayName, specialty: form.specialty, licenseNumber: form.licenseNumber, licenseState: form.licenseState, feeUSD: form.feeUSD, availability: form.availability };
        const { data, error } = await supabase.from('doctors').upsert({ ...payload, userId: form.userId }).select().single();
        if (!error) { onChange(data || form); return; }
        console.warn('Supabase upsert profile error, falling back to API:', error);
      } catch (err) {
        console.warn('Supabase upsert profile exception, falling back to API:', err);
      }
    }
    const res = await fetch('/api/doctor/me', { method: 'PATCH', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify({ displayName: form.displayName, specialty: form.specialty, licenseNumber: form.licenseNumber, licenseState: form.licenseState, feeUSD: form.feeUSD, availability: form.availability }) });
    const data = await res.json();
    onChange(data);
  };

  const setAvail = (i: number, key: 'day'|'start'|'end', val: any) => {
    const next = [...form.availability];
    next[i] = { ...next[i], [key]: key==='day'? Number(val) : String(val) } as any;
    setForm({ ...form, availability: next });
  };

  const addSlot = () => setForm({ ...form, availability: [...form.availability, { day: 1, start: '09:00', end: '17:00' }] });
  const removeSlot = (i: number) => setForm({ ...form, availability: form.availability.filter((_, idx) => idx !== i) });

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader><CardTitle>Profile & License</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-sm font-medium">Display name</label>
            <Input value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} />
          </div>
          <div>
            <label className="text-sm font-medium">Specialty</label>
            <Input value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">License number</label>
              <Input value={form.licenseNumber} onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium">State</label>
              <Input value={form.licenseState} onChange={(e) => setForm({ ...form, licenseState: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Upload medical license</label>
            <div className="flex items-center gap-2 mt-2">
              <input id="license-file" type="file" accept="image/*,application/pdf" onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                // Read file as base64
                const reader = new FileReader();
                reader.onload = async () => {
                  const result = reader.result as string;
                  // result is data:<type>;base64,<data>
                  const base64 = result.split(',')[1];
                  // Try client-side Supabase storage first
                  if (supabase) {
                    try {
                      const bucket = (import.meta.env.VITE_SUPABASE_LICENSE_BUCKET as string) || 'licenses';
                      const path = `licenses/${form.userId || 'unknown'}/${Date.now()}-${file.name}`;
                      // upload File directly
                      const { error } = await supabase.storage.from(bucket).upload(path, file as any, { contentType: file.type, upsert: true });
                      if (!error) {
                        const { data: urlData } = await supabase.storage.from(bucket).getPublicUrl(path);
                        const url = (urlData && (urlData as any).publicUrl) || urlData?.publicUrl || null;
                        onChange({ ...form, licenseUrl: url });
                        return;
                      }
                      console.warn('Supabase client upload error, falling back to server API:', error);
                    } catch (err) {
                      console.warn('Supabase client upload exception, falling back to server API:', err);
                    }
                  }
                  // Fallback: send base64 to server endpoint which will use service role to store it (if available)
                  try {
                    const res = await fetch('/api/doctor/me/license', { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify({ filename: file.name, contentType: file.type, data: base64 }) });
                    const d = await res.json();
                    if (d.url) onChange({ ...form, licenseUrl: d.url });
                  } catch (err) {
                    console.warn('License upload failed:', err);
                  }
                };
                reader.readAsDataURL(file);
              }} />
            </div>
            <div className="text-xs text-muted-foreground mt-2">Upload a clear photo or PDF of your medical license. The file will be stored securely; admin will verify it.</div>
          </div>
          <div>
            <label className="text-sm font-medium">Languages (comma-separated)</label>
            <Input value={(form.languages || []).join(", ")} onChange={(e) => setForm({ ...form, languages: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })} />
          </div>
          <div>
            <label className="text-sm font-medium">Bio</label>
            <Textarea rows={4} value={form.bio || ''} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
          </div>
          <div>
            <label className="text-sm font-medium">Consultation fee (USD)</label>
            <Input type="number" value={form.feeUSD} onChange={(e) => setForm({ ...form, feeUSD: Number(e.target.value) })} />
          </div>
          <div className="flex justify-end"><Button onClick={save}>Save</Button></div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Availability</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {form.availability.map((s, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-center">
              <Input className="col-span-3" type="number" min={0} max={6} value={s.day} onChange={(e) => setAvail(i,'day', e.target.value)} />
              <Input className="col-span-4" type="time" value={s.start} onChange={(e) => setAvail(i,'start', e.target.value)} />
              <Input className="col-span-4" type="time" value={s.end} onChange={(e) => setAvail(i,'end', e.target.value)} />
              <Button variant="destructive" onClick={() => removeSlot(i)}>Remove</Button>
            </div>
          ))}
          <Button variant="outline" onClick={addSlot}>Add slot</Button>
        </CardContent>
      </Card>
    </div>
  );
}
