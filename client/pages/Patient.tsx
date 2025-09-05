import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import PatientSidebar from '@/components/PatientSidebar';
import type { Appointment, DoctorProfile, Prescription } from '@shared/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

// Patient main page - acts as landing page for patient users after login
export default function Patient() {
  const { user } = useAuth();
  const [tab, setTab] = useState<string>('dashboard');

  return (
    <div className="container py-10">
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
        <PatientSidebar tab={tab} setTab={setTab} />
        <div>
          {tab === 'dashboard' && <Dashboard />}
          {tab === 'doctors' && <Doctors />}
          {tab === 'appointments' && <MyAppointments userEmail={user?.email || ''} />}
          {tab === 'prescriptions' && <MyPrescriptions userEmail={user?.email || ''} />}
          {tab === 'records' && <Records userEmail={user?.email || ''} />}
          {tab === 'payments' && <Payments userEmail={user?.email || ''} />}
          {tab === 'support' && <Support userEmail={user?.email || ''} />}
          {tab === 'settings' && <Settings />}
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  // Dashboard shows upcoming appointments, recent prescriptions and quick booking
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Patient dashboard</h1>
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader><CardTitle>Upcoming</CardTitle></CardHeader>
          <CardContent>
            <UpcomingList />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Recent prescriptions</CardTitle></CardHeader>
          <CardContent>
            <RecentPrescriptions />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Quick actions</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <Button asChild>
              <a href="/appointments">Book a doctor</a>
            </Button>
            <Button asChild variant="outline">
              <a href="/#faq">Help & FAQ</a>
            </Button>
            <a className="text-sm text-muted-foreground">Emergency hotline: 1-800-555-0199</a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function UpcomingList() {
  const [items, setItems] = useState<Appointment[] | null>(null);
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/appointments?email=' + encodeURIComponent(localStorage.getItem('user_email') || ''));
        const d = await res.json();
        setItems(d.appointments || []);
      } catch (err) {
        setItems([]);
      }
    })();
  }, []);
  if (!items) return <div className="text-sm text-muted-foreground">Loading…</div>;
  if (items.length === 0) return <div className="text-sm text-muted-foreground">No upcoming appointments.</div>;
  return <div className="space-y-2">{items.map(a => <div key={a.id} className="p-2 border rounded"><div className="font-medium">{a.providerName}</div><div className="text-sm text-muted-foreground">{new Date(a.scheduledAt).toLocaleString()}</div></div>)}</div>;
}

function RecentPrescriptions() {
  const [items, setItems] = useState<Prescription[] | null>(null);
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/appointments?email=' + encodeURIComponent(localStorage.getItem('user_email') || ''));
        const d = await res.json();
        const prescs = (d.appointments || []).flatMap((a: any) => a.prescriptions || []);
        setItems(prescs.slice(0, 5));
      } catch (err) {
        setItems([]);
      }
    })();
  }, []);
  if (!items) return <div className="text-sm text-muted-foreground">Loading…</div>;
  if (items.length === 0) return <div className="text-sm text-muted-foreground">No prescriptions.</div>;
  return <div className="space-y-2">{items.map(p => <div key={p.id} className="p-2 border rounded"><div className="font-medium">{p.medication}</div><div className="text-xs text-muted-foreground">Issued: {new Date(p.createdAt).toLocaleDateString()}</div></div>)}</div>;
}

function Doctors() {
  const [providers, setProviders] = useState<DoctorProfile[] | null>(null);
  const [q, setQ] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [language, setLanguage] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/providers');
        const d = await res.json();
        setProviders(d.providers || []);
      } catch (err) {
        setProviders([]);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    if (!providers) return [];
    return providers.filter((p) => {
      if (specialty && !p.specialty.toLowerCase().includes(specialty.toLowerCase())) return false;
      if (language && !(p.languages || []).some(l => l.toLowerCase().includes(language.toLowerCase()))) return false;
      if (q && !p.displayName.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [providers, q, specialty, language]);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Find a doctor</h2>
      <div className="grid md:grid-cols-3 gap-3 mb-4">
        <Input placeholder="Search name" value={q} onChange={(e) => setQ(e.target.value)} />
        <Input placeholder="Specialty" value={specialty} onChange={(e) => setSpecialty(e.target.value)} />
        <Input placeholder="Language" value={language} onChange={(e) => setLanguage(e.target.value)} />
      </div>

      <div className="grid gap-3">
        {filtered.map((p) => (
          <Card key={p.userId}>
            <CardContent className="py-3 flex items-center justify-between">
              <div>
                <div className="font-medium">{p.displayName}</div>
                <div className="text-sm text-muted-foreground">{p.specialty} • {p.languages?.join(', ')}</div>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => bookQuick(p.providerId || p.userId)}>Book</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

async function bookQuick(providerId: string) {
  // Quick booking: this uses the server POST /api/appointments endpoint.
  // Integrate availability checks and calendar selection in a production flow.
  const body = { patientName: localStorage.getItem('user_name') || 'Patient', patientEmail: localStorage.getItem('user_email') || '', date: new Date().toISOString().slice(0,10), time: '09:00', providerId, reason: 'Telehealth visit' };
  try {
    await fetch('/api/appointments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    alert('Booking requested — refresh appointments to see it.');
  } catch (err) {
    console.warn('Booking failed', err);
    alert('Booking failed');
  }
}

function MyAppointments({ userEmail }: { userEmail: string }) {
  const [items, setItems] = useState<Appointment[] | null>(null);
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/appointments?email=' + encodeURIComponent(userEmail));
        const d = await res.json();
        setItems(d.appointments || []);
      } catch (err) {
        setItems([]);
      }
    })();
  }, [userEmail]);
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Your appointments</h2>
      {!items && <div className="text-sm text-muted-foreground">Loading…</div>}
      {items && items.length === 0 && <div className="text-sm text-muted-foreground">No appointments yet.</div>}
      <div className="grid gap-3">
        {items && items.map(a => (
          <Card key={a.id}><CardContent className="py-3 flex items-center justify-between"><div><div className="font-medium">{a.providerName}</div><div className="text-sm text-muted-foreground">{new Date(a.scheduledAt).toLocaleString()}</div>{(a as any).paymentStatus === 'success' ? <div className="text-xs text-emerald-600">Paid{(a as any).paidAt ? ` • ${new Date((a as any).paidAt).toLocaleString()}` : ''}</div> : <div className="text-xs text-amber-600">Unpaid</div>}</div><div className="flex gap-2 flex-wrap justify-end"><a className="text-primary underline" href={a.meetingUrl} target="_blank" rel="noreferrer">Join</a><Button variant="outline" onClick={() => reschedule(a.id)}>Reschedule</Button>{(a as any).paymentStatus !== 'success' && <Button onClick={() => payForAppointment(a.id)}>Pay</Button>}</div></CardContent></Card>
        ))}
      </div>
    </div>
  );
}

async function reschedule(id: string) {
  // In a full implementation, open a date/time picker and call PATCH /api/appointments/:id
  const when = prompt('Enter new datetime (ISO)');
  if (!when) return;
  try {
    await fetch(`/api/appointments/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ scheduledAt: when }) });
    alert('Rescheduled. Refresh to see changes.');
  } catch (err) {
    console.warn('Reschedule failed', err);
    alert('Failed to reschedule');
  }
}

function MyPrescriptions({ userEmail }: { userEmail: string }) {
  const [items, setItems] = useState<Prescription[] | null>(null);
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/appointments?email=' + encodeURIComponent(userEmail));
        const d = await res.json();
        const prescs = (d.appointments || []).flatMap((a: any) => a.prescriptions || []);
        setItems(prescs);
      } catch (err) {
        setItems([]);
      }
    })();
  }, [userEmail]);
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Prescriptions</h2>
      {!items && <div className="text-sm text-muted-foreground">Loading…</div>}
      <div className="grid gap-3">
        {items && items.map(p => (
          <Card key={p.id}><CardContent className="py-3"><div className="font-medium">{p.medication}</div><div className="text-sm text-muted-foreground">{p.dosage} • {p.instructions}</div><div className="mt-2"><a className="text-primary underline" href="#">Download</a></div></CardContent></Card>
        ))}
      </div>
    </div>
  );
}

function Records({ userEmail }: { userEmail: string }) {
  const [docs, setDocs] = useState<any[]>([]);
  // Documents can be uploaded to Supabase storage or stored in a medical records table.
  // This UI reads appointment files and displays them together with uploaded documents.
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/appointments?email=' + encodeURIComponent(userEmail));
        const d = await res.json();
        const files = (d.appointments || []).flatMap((a: any) => a.files || []).slice(0, 50);
        setDocs(files || []);
      } catch (err) {
        setDocs([]);
      }
    })();
  }, [userEmail]);
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Medical records & uploads</h2>
      <div className="mb-4">
        <label className="text-sm font-medium">Upload a document</label>
        <div className="mt-2">
          <input type="file" onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = async () => {
              const base64 = String(reader.result).split(',')[1];
              // Prefer storing files in Supabase Storage via client or call your server endpoint to persist securely.
              try {
                await fetch('/api/appointments/unknown/files', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ filename: file.name, contentType: file.type, data: base64 }) });
                alert('Uploaded (stored in demo fallback).');
              } catch (err) { console.warn('Upload failed', err); alert('Upload failed'); }
            };
            reader.readAsDataURL(file);
          }} />
        </div>
      </div>
      <div className="grid gap-2">
        {docs.length === 0 && <div className="text-sm text-muted-foreground">No records yet.</div>}
        {docs.map((d) => (
          <div key={d.id} className="p-2 border rounded flex items-center justify-between"><div className="text-sm">{d.filename}</div><a className="text-primary underline" href={d.url} target="_blank" rel="noreferrer">Open</a></div>
        ))}
      </div>
    </div>
  );
}

async function payForAppointment(appointmentId: string) {
  try {
    const res = await fetch('/api/payments/initiate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ appointmentId }) });
    const d = await res.json();
    if (!res.ok || !d.reference) { alert(d.error || 'Failed to start payment'); return; }

    const pubKey = (import.meta.env.VITE_PAYSTACK_PUBLIC_KEY as string) || (typeof process !== 'undefined' ? (process.env.PAYSTACK_PUBLIC_KEY as string) : undefined);

    async function ensureScript() {
      if (typeof window === 'undefined') return;
      if ((window as any).PaystackPop) return;
      await new Promise<void>((resolve, reject) => {
        const s = document.createElement('script');
        s.src = 'https://js.paystack.co/v1/inline.js';
        s.async = true;
        s.onload = () => resolve();
        s.onerror = () => reject(new Error('Failed to load Paystack script'));
        document.head.appendChild(s);
      });
    }

    if (pubKey) {
      try {
        await ensureScript();
        const ref = d.reference as string;
        const handler = (window as any).PaystackPop.setup({
          key: pubKey,
          email: d.email,
          amount: Math.round((d.amount || 0) * 100),
          currency: d.currency || 'USD',
          ref,
          callback: function () { window.location.href = `/payment-status?reference=${encodeURIComponent(ref)}`; },
          onClose: function () { /* no-op */ },
        });
        handler.openIframe();
        return;
      } catch (err) {
        console.warn('Inline Paystack failed; falling back to redirect', err);
      }
    }

    if (d.authorizationUrl) { window.location.href = d.authorizationUrl as string; return; }
    alert('Could not start payment');
  } catch (err) { console.warn('Payment init failed', err); alert('Payment failed to initialize'); }
}

function Payments({ userEmail }: { userEmail: string }) {
  // Payments integrate with Stripe/PayPal. Here we show a simple billing history based on appointments.
  const [invoices, setInvoices] = useState<any[]>([]);
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/appointments?email=' + encodeURIComponent(userEmail));
        const d = await res.json();
        const inv = (d.appointments || []).map((a: any) => ({ id: a.id, date: a.scheduledAt, amount: a.feeUSD || 120, status: a.status === 'completed' ? 'paid' : 'pending' }));
        setInvoices(inv);
      } catch (err) {
        setInvoices([]);
      }
    })();
  }, [userEmail]);
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Billing & subscriptions</h2>
      <div className="grid gap-2">
        {invoices.map((i) => (
          <Card key={i.id}><CardContent className="py-3 flex items-center justify-between"><div><div className="font-medium">Invoice {i.id}</div><div className="text-sm text-muted-foreground">{new Date(i.date).toLocaleDateString()} • ${i.amount}</div></div><div className="text-sm capitalize">{i.status}</div></CardContent></Card>
        ))}
      </div>
    </div>
  );
}

function Support({ userEmail }: { userEmail: string }) {
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState('');
  const [tickets, setTickets] = useState<any[]>([]);
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/tickets');
        if (!res.ok) return;
        const d = await res.json();
        setTickets(d.tickets || []);
      } catch (err) { setTickets([]); }
    })();
  }, []);
  const create = async () => {
    if (!msg) return;
    try {
      await fetch('/api/admin/tickets', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: msg, email: userEmail }) });
      setMsg('');
      alert('Ticket submitted');
    } catch (err) { console.warn('Ticket failed', err); alert('Failed to submit'); }
  };
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Support</h2>
      <div className="mb-4">
        <label className="text-sm font-medium">Ask for help</label>
        <div className="mt-2">
          <Textarea rows={4} value={msg} onChange={(e) => setMsg(e.target.value)} />
          <div className="mt-2"><Button onClick={create}>Send</Button></div>
        </div>
      </div>
      <div>
        <h3 className="font-semibold mb-2">Your tickets</h3>
        {tickets.length === 0 && <div className="text-sm text-muted-foreground">No tickets yet.</div>}
        {tickets.map(t => <Card key={t.id}><CardContent className="py-2 text-sm">{t.message}</CardContent></Card>)}
      </div>
    </div>
  );
}

function Settings() {
  // Editable patient profile: personal info, medical history, insurance details, 2FA enablement
  const [profile, setProfile] = useState<any>({ fullName: localStorage.getItem('user_name') || '', email: localStorage.getItem('user_email') || '', phone: '' });
  const [enable2fa, setEnable2fa] = useState(false);
  const save = async () => {
    // Persist to server (e.g. PUT /api/patient/me) or to Supabase; this demo uses localStorage fallback
    localStorage.setItem('user_name', profile.fullName || '');
    alert('Profile saved (demo).');
  };
  const send2fa = async () => {
    // Integrate a 2FA provider (Twilio Verify, Authy, Supabase OTP). This UI simulates sending a code.
    alert('A verification code was sent to your phone (simulated). Enter code to verify.');
    const code = prompt('Enter the 2FA code');
    if (code === '123456') { setEnable2fa(true); alert('2FA enabled (demo)'); } else { alert('Incorrect code (demo)'); }
  };
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Settings</h2>
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div><label className="text-sm">Full name</label><Input value={profile.fullName} onChange={(e) => setProfile({ ...profile, fullName: e.target.value })} /></div>
              <div><label className="text-sm">Email</label><Input value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} /></div>
              <div><label className="text-sm">Phone</label><Input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} /></div>
              <div><label className="text-sm">Insurance</label><Input value={profile.insurance || ''} onChange={(e) => setProfile({ ...profile, insurance: e.target.value })} /></div>
              <div><label className="text-sm">Medical history</label><Textarea rows={4} value={profile.history || ''} onChange={(e) => setProfile({ ...profile, history: e.target.value })} /></div>
              <div className="mt-2"><Button onClick={save}>Save profile</Button></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Security</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between"><div className="text-sm">Two‑factor authentication</div><div className="text-sm">{enable2fa ? 'Enabled' : 'Disabled'}</div></div>
              <div className="flex gap-2"><Button onClick={send2fa}>{enable2fa ? 'Re-verify' : 'Enable 2FA'}</Button></div>
              <div className="text-xs text-muted-foreground">For production, integrate Twilio Verify or Supabase OTP for SMS/email 2FA.</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
