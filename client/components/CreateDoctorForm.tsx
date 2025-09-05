import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export default function CreateDoctorForm({ onCreated }: { onCreated?: () => void }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', specialty: '', licenseNumber: '', licenseState: '', feeUSD: '120', languages: '', bio: '' });
  const [loading, setLoading] = useState(false);
  const submit = async () => {
    if (!form.name || !form.email || !form.password) { alert('Please provide name, email, and password'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/admin/doctors', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, feeUSD: Number(form.feeUSD), languages: form.languages ? form.languages.split(',').map(s => s.trim()) : [] }) });
      if (!res.ok) {
        const d = await res.json().catch(() => null);
        alert('Failed to create doctor: ' + (d?.error || res.statusText));
      } else {
        alert('Doctor created');
        setForm({ name: '', email: '', password: '', specialty: '', licenseNumber: '', licenseState: '', feeUSD: '120', languages: '', bio: '' });
        if (onCreated) onCreated();
      }
    } catch (err) {
      console.warn(err);
      alert('Failed to create doctor');
    }
    setLoading(false);
  };
  return (
    <div className="grid gap-2">
      <div className="grid sm:grid-cols-2 gap-2">
        <Input placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      </div>
      <div className="grid sm:grid-cols-2 gap-2">
        <Input placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <Input placeholder="Specialty" value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} />
      </div>
      <div className="grid sm:grid-cols-3 gap-2">
        <Input placeholder="License number" value={form.licenseNumber} onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })} />
        <Input placeholder="License state" value={form.licenseState} onChange={(e) => setForm({ ...form, licenseState: e.target.value })} />
        <Input placeholder="Fee USD" value={form.feeUSD} onChange={(e) => setForm({ ...form, feeUSD: e.target.value })} />
      </div>
      <Input placeholder="Languages (comma separated)" value={form.languages} onChange={(e) => setForm({ ...form, languages: e.target.value })} />
      <Textarea placeholder="Short bio" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
      <div className="flex justify-end"><Button onClick={submit} disabled={loading}>{loading ? 'Creating...' : 'Create doctor account'}</Button></div>
    </div>
  );
}
