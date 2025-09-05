import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function PaymentStatus() {
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [message, setMessage] = useState<string>('Verifying your payment…');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('reference') || '';
    if (!ref) { setStatus('failed'); setMessage('Missing payment reference'); return; }
    (async () => {
      try {
        const res = await fetch(`/api/payments/verify?reference=${encodeURIComponent(ref)}`);
        const d = await res.json();
        if (!res.ok || !d.ok) { setStatus('failed'); setMessage(d.error || d.message || 'Verification failed'); return; }
        if (d.status === 'success') { setStatus('success'); setMessage('Payment successful. Your appointment is confirmed.'); }
        else { setStatus('failed'); setMessage(`Payment status: ${String(d.status || 'failed')}`); }
      } catch (err) { setStatus('failed'); setMessage('Could not verify payment'); }
    })();
  }, []);

  return (
    <div className="container py-10">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Payment status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-sm ${status === 'success' ? 'text-emerald-600' : status === 'failed' ? 'text-red-600' : 'text-muted-foreground'}`}>{message}</div>
            <div className="mt-4 flex gap-2"><Button asChild><a href="/patient">Go to dashboard</a></Button><Button asChild variant="outline"><a href="/appointments">Book another</a></Button></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
