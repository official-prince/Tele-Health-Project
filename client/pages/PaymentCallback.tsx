import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function PaymentCallback() {
  const [params] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<any | null>(null);

  useEffect(() => {
    const reference = params.get("reference");
    if (!reference) { setError("Missing reference"); setLoading(false); return; }
    (async () => {
      try {
        const res = await fetch(`/api/payments/paystack/verify?reference=${encodeURIComponent(reference)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Verification failed");
        setReceipt(data.receipt);
      } catch (e: any) {
        setError(e?.message || String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="container py-10">Verifying payment…</div>;
  if (error) return <div className="container py-10 text-destructive">{error}</div>;

  return (
    <div className="container py-10 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Payment receipt</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div><span className="text-muted-foreground">Reference:</span> {receipt.reference}</div>
          <div><span className="text-muted-foreground">Status:</span> {receipt.status}</div>
          <div><span className="text-muted-foreground">Amount:</span> {receipt.currency} {(receipt.amount).toFixed(2)}</div>
          <div><span className="text-muted-foreground">Paid at:</span> {receipt.paidAt ? new Date(receipt.paidAt).toLocaleString() : '-'}</div>
          <div><span className="text-muted-foreground">Appointment ID:</span> {receipt.appointmentId}</div>
          <div className="pt-4">
            <Button asChild><Link to="/appointments">Back to appointments</Link></Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
