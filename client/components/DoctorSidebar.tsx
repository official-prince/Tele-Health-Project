import React from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function DoctorSidebar({ tab, setTab }: { tab: string; setTab: (v: string) => void }) {
  const { user } = useAuth();
  return (
    <aside className="w-64 hidden lg:block border-r bg-background p-4">
      <div className="mb-6">
        <div className="text-sm text-muted-foreground">Signed in as</div>
        <div className="font-semibold">{user?.name}</div>
        <div className="text-xs text-muted-foreground">{user?.email}</div>
      </div>
      <nav className="flex flex-col gap-1">
        {[
          { id: 'dashboard', label: 'Dashboard' },
          { id: 'consult', label: 'Consultations' },
          { id: 'appointments', label: 'Appointments' },
          { id: 'patients', label: 'Patients' },
          { id: 'prescriptions', label: 'Prescriptions' },
          { id: 'earnings', label: 'Earnings' },
          { id: 'settings', label: 'Settings' },
        ].map((s) => (
          <button
            key={s.id}
            onClick={() => setTab(s.id)}
            className={
              'text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ' +
              (tab === s.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground')
            }
          >
            {s.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
