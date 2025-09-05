import React, { useMemo, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import type { Appointment } from '@shared/api';

export function CalendarSection({ items }: { items: Appointment[] }) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const byDate = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    for (const a of items) {
      const d = new Date(a.scheduledAt).toISOString().slice(0,10);
      const arr = map.get(d) || [];
      arr.push(a);
      map.set(d, arr);
    }
    return map;
  }, [items]);

  const selectedKey = date ? date.toISOString().slice(0,10) : new Date().toISOString().slice(0,10);
  const selectedItems = byDate.get(selectedKey) || [];

  return (
    <div>
      <DayPicker mode="single" selected={date} onSelect={setDate} />
      <div className="mt-3 text-sm text-muted-foreground">Appointments on {selectedKey}:</div>
      <div className="mt-2 space-y-2">
        {selectedItems.map(s => (
          <div key={s.id} className="p-2 border rounded bg-muted/10">
            <div className="font-medium">{s.patientName}</div>
            <div className="text-xs text-muted-foreground">{new Date(s.scheduledAt).toLocaleTimeString()} • {s.status}</div>
          </div>
        ))}
        {selectedItems.length === 0 && <div className="text-sm text-muted-foreground">No appointments.</div>}
      </div>
    </div>
  );
}

export function TodayList({ items }: { items: Appointment[] }) {
  const todayKey = new Date().toISOString().slice(0,10);
  const todays = items.filter(a => a.scheduledAt.slice(0,10) === todayKey).sort((a,b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  return (
    <div className="space-y-2">
      {todays.map(t => (
        <div key={t.id} className="p-2 border rounded">
          <div className="font-medium">{t.patientName}</div>
          <div className="text-xs text-muted-foreground">{new Date(t.scheduledAt).toLocaleTimeString()} • {t.reason}</div>
          <div className="mt-2 flex gap-2">
            <a className="text-primary underline" href={t.meetingUrl} target="_blank" rel="noreferrer">Join</a>
            <button className="text-sm text-muted-foreground">Notes</button>
          </div>
        </div>
      ))}
      {todays.length === 0 && <div className="text-sm text-muted-foreground">No appointments today.</div>}
    </div>
  );
}
