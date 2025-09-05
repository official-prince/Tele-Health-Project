import React, { useEffect, useMemo, useState } from 'react';
import type { Appointment, DoctorProfile } from "@shared/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import CreateDoctorForm from '@/components/CreateDoctorForm';

export default function Admin() {
  const [items, setItems] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [finance, setFinance] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [ann, setAnn] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [security, setSecurity] = useState<any>(null);
  const location = window.location ? window.location : { search: '' } as any;
  // default tab from query param
  const urlTab = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : location.search).get('tab') || 'users';
  const [tab, setTab] = useState<string>(urlTab);

  useEffect(() => {
    const onPop = () => {
      const p = new URLSearchParams(window.location.search).get('tab') || 'users';
      setTab(p);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const refresh = async () => {
    const [aRes, dRes, pRes, fRes, plRes, anRes, tRes, lRes, sRes] = await Promise.all([
      fetch('/api/appointments/all'),
      fetch('/api/doctors'),
      fetch('/api/admin/patients'),
      fetch('/api/admin/finance/summary'),
      fetch('/api/admin/plans'),
      fetch('/api/admin/announcements'),
      fetch('/api/admin/tickets'),
      fetch('/api/admin/logs'),
      fetch('/api/admin/security'),
    ]);
    const a = await aRes.json();
    const d = await dRes.json();
    const p = await pRes.json();
    const f = await fRes.json();
    const pl = await plRes.json();
    const an = await anRes.json();
    const t = await tRes.json();
    const l = await lRes.json();
    const s = await sRes.json();
    setItems(a.appointments ?? []);
    setDoctors(d.doctors ?? []);
    setPatients(p.patients ?? []);
    setFinance(f);
    setPlans(pl.plans ?? []);
    setAnn(an.announcements ?? []);
    setTickets(t.tickets ?? []);
    setLogs(l.logs ?? []);
    setSecurity(s ?? null);
  };

  useEffect(() => { refresh(); }, []);

  const stats = useMemo(() => ({
    total: items.length,
    scheduled: items.filter(a => a.status === 'scheduled').length,
    completed: items.filter(a => a.status === 'completed').length,
    cancelled: items.filter(a => a.status === 'cancelled').length,
  }), [items]);

  const setStatus = async (id: string, status: 'completed' | 'cancelled') => {
    await fetch(`/api/appointments/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    refresh();
  };

  const refund = async (id: string) => { await fetch(`/api/admin/refunds/${id}`, { method: 'POST' }); refresh(); };

  const approve = async (userId: string, status: 'approved' | 'rejected') => {
    await fetch(`/api/doctor/${userId}/approve`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    refresh();
  };

  const suspend = async (email: string, suspended: boolean) => { await fetch(`/api/admin/patients/${encodeURIComponent(email)}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ suspended }) }); refresh(); };

  const addPlan = async (p: any) => { await fetch('/api/admin/plans', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(p) }); refresh(); };
  const delPlan = async (id: string) => { await fetch(`/api/admin/plans/${id}`, { method: 'DELETE' }); refresh(); };
  const addAnnouncement = async (title: string, body: string) => { await fetch('/api/admin/announcements', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, body }) }); refresh(); };
  const delAnnouncement = async (id: string) => { await fetch(`/api/admin/announcements/${id}`, { method: 'DELETE' }); refresh(); };
  const resolveTicket = async (id: string, status: string) => { await fetch(`/api/admin/tickets/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }); refresh(); };
  const updateSecurity = async (s: any) => { await fetch('/api/admin/security', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(s) }); refresh(); };

  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold">Admin portal</h1>
      <p className="text-muted-foreground">Operations, finance, content, and compliance</p>

      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <Stat title="Total" value={stats.total} />
        <Stat title="Scheduled" value={stats.scheduled} />
        <Stat title="Completed" value={stats.completed} />
        <Stat title="Cancelled" value={stats.cancelled} />
      </div>

      <Tabs defaultValue={tab} value={tab} onValueChange={(v) => { setTab(v); const url = new URL(window.location.href); url.searchParams.set('tab', v); window.history.replaceState({}, '', url.toString()); }} className="mt-8">
        <TabsList>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="finance">Finance</TabsTrigger>
          <TabsTrigger value="content">Content & Support</TabsTrigger>
          <TabsTrigger value="security">Compliance & Security</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Doctors - verification</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <CreateDoctorForm onCreated={() => refresh()} />
                {doctors.map((d) => (
                  <div key={d.userId} className="flex items-center justify-between border rounded p-3">
                    <div>
                      <div className="font-medium">{d.displayName}</div>
                      <div className="text-sm text-muted-foreground">{d.specialty} • {d.licenseState || '—'} • {d.licenseNumber || '—'}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-1 rounded bg-muted">{d.verification}</span>
                      <Button variant="outline" onClick={() => approve(d.userId, 'approved')}>Approve</Button>
                      <Button variant="destructive" onClick={() => approve(d.userId, 'rejected')}>Reject</Button>
                    </div>
                  </div>
                ))}
                {doctors.length === 0 && <p className="text-sm text-muted-foreground">No doctors yet.</p>}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Patients</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {patients.map((p) => (
                  <div key={p.email} className="flex items-center justify-between border rounded p-3">
                    <div>
                      <div className="font-medium">{p.name}</div>
                      <div className="text-sm text-muted-foreground">{p.email} • last {new Date(p.last).toLocaleDateString()}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-1 rounded bg-muted">{p.suspended ? 'suspended' : 'active'}</span>
                      {p.suspended ? (
                        <Button variant="outline" onClick={() => suspend(p.email, false)}>Unsuspend</Button>
                      ) : (
                        <Button variant="destructive" onClick={() => suspend(p.email, true)}>Suspend</Button>
                      )}
                    </div>
                  </div>
                ))}
                {patients.length === 0 && <p className="text-sm text-muted-foreground">No patients yet.</p>}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="appointments">
          <div className="grid gap-3">
            {items.map((a) => (
              <Card key={a.id}>
                <CardContent className="py-4 grid md:grid-cols-6 gap-2 items-center">
                  <div className="md:col-span-2">
                    <div className="font-medium">{new Date(a.scheduledAt).toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">{a.patientName} → {a.providerName}</div>
                  </div>
                  <div className="text-sm">{a.status}</div>
                  <div className="text-sm flex gap-2 justify-end md:col-span-3">
                    <Button variant="outline" onClick={() => setStatus(a.id, 'completed')}>Mark completed</Button>
                    <Button variant="outline" onClick={() => setStatus(a.id, 'cancelled')}>Cancel</Button>
                    <Button variant="destructive" onClick={() => refund(a.id)}>Refund</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="finance">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <Stat title="Revenue" value={finance?.revenue || 0} />
                <Stat title="Sessions" value={finance?.sessions || 0} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Plans & Commissions</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <PlanEditor onAdd={addPlan} />
                {plans.map((p) => (
                  <div key={p.id} className="flex items-center justify-between border rounded p-3 text-sm">
                    <div>{p.name} • ${p.priceUSD}/mo • {p.commissionPct}% commission</div>
                    <Button variant="destructive" onClick={() => delPlan(p.id)}>Delete</Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="content">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Announcements</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <AnnouncementEditor onAdd={addAnnouncement} />
                {ann.map(a => (
                  <div key={a.id} className="flex items-center justify-between border rounded p-3">
                    <div>
                      <div className="font-medium">{a.title}</div>
                      <div className="text-sm text-muted-foreground">{new Date(a.createdAt).toLocaleString()}</div>
                    </div>
                    <Button variant="destructive" onClick={() => delAnnouncement(a.id)}>Delete</Button>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Support tickets</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {tickets.map((t) => (
                  <div key={t.id} className="flex items-center justify-between border rounded p-3">
                    <div>
                      <div className="font-medium">{t.subject} • {t.email}</div>
                      <div className="text-sm text-muted-foreground">{t.status} • {new Date(t.createdAt).toLocaleString()}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => resolveTicket(t.id, 'resolved')}>Resolve</Button>
                      <Button variant="destructive" onClick={() => resolveTicket(t.id, 'closed')}>Close</Button>
                    </div>
                  </div>
                ))}
                {tickets.length === 0 && <p className="text-sm text-muted-foreground">No tickets</p>}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Settings</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between border rounded p-3">
                  <div>Audit logs</div>
                  <Button variant="outline" onClick={() => updateSecurity({ auditEnabled: !security?.auditEnabled })}>{security?.auditEnabled ? 'Disable' : 'Enable'}</Button>
                </div>
                <div className="flex items-center justify-between border rounded p-3">
                  <div>Backups ({security?.backups})</div>
                  <Button variant="outline" onClick={() => updateSecurity({ backups: security?.backups === 'weekly' ? 'daily' : 'weekly' })}>Toggle</Button>
                </div>
                <div className="flex items-center justify-between border rounded p-3">
                  <div>HIPAA Mode</div>
                  <Button variant="outline" onClick={() => updateSecurity({ hipaaMode: !security?.hipaaMode })}>{security?.hipaaMode ? 'On' : 'Off'}</Button>
                </div>
                <div className="flex items-center justify-between border rounded p-3">
                  <div>GDPR Mode</div>
                  <Button variant="outline" onClick={() => updateSecurity({ gdprMode: !security?.gdprMode })}>{security?.gdprMode ? 'On' : 'Off'}</Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Audit logs</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm max-h-80 overflow-auto">
                {logs.map((l) => (
                  <div key={l.id} className="flex justify-between border rounded p-2">
                    <div>{l.action}</div>
                    <div className="text-muted-foreground">{new Date(l.time).toLocaleString()}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PlanEditor({ onAdd }: { onAdd: (p: any) => void }) {
  const [p, setP] = useState({ id: '', name: '', priceUSD: 0, commissionPct: 0 });
  return (
    <div className="grid grid-cols-10 gap-2 items-center text-sm">
      <Input className="col-span-2" placeholder="id" value={p.id} onChange={(e) => setP({ ...p, id: e.target.value })} />
      <Input className="col-span-3" placeholder="name" value={p.name} onChange={(e) => setP({ ...p, name: e.target.value })} />
      <Input className="col-span-2" type="number" placeholder="price" value={p.priceUSD} onChange={(e) => setP({ ...p, priceUSD: Number(e.target.value) })} />
      <Input className="col-span-2" type="number" placeholder="commission %" value={p.commissionPct} onChange={(e) => setP({ ...p, commissionPct: Number(e.target.value) })} />
      <Button onClick={() => onAdd(p)}>Save</Button>
    </div>
  );
}

function AnnouncementEditor({ onAdd }: { onAdd: (title: string, body: string) => void }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  return (
    <div className="grid gap-2 text-sm">
      <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
      <Textarea rows={3} placeholder="Body" value={body} onChange={(e) => setBody(e.target.value)} />
      <Button onClick={() => onAdd(title, body)}>Publish</Button>
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
