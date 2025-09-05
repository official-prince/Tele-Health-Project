import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import type { Appointment, CreateAppointmentResponse } from "@shared/api";
import { CheckCircle2, Loader2 } from "lucide-react";

function Intake({ appointmentId }: { appointmentId: string }) {
  const [values, setValues] = useState({
    symptoms: "",
    medications: "",
    allergies: "",
  });
  const [saving, setSaving] = useState(false);
  const submit = async () => {
    setSaving(true);
    await fetch(`/api/appointments/${appointmentId}/intake`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    setSaving(false);
  };
  return (
    <div className="grid gap-2">
      <Textarea
        rows={3}
        placeholder="Symptoms"
        value={values.symptoms}
        onChange={(e) => setValues({ ...values, symptoms: e.target.value })}
      />
      <Input
        placeholder="Medications (optional)"
        value={values.medications}
        onChange={(e) => setValues({ ...values, medications: e.target.value })}
      />
      <Input
        placeholder="Allergies (optional)"
        value={values.allergies}
        onChange={(e) => setValues({ ...values, allergies: e.target.value })}
      />
      <Button onClick={submit} disabled={saving}>
        {saving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          "Submit intake"
        )}
      </Button>
    </div>
  );
}

const FormSchema = z.object({
  patientName: z.string().min(2, "Please enter your full name"),
  patientEmail: z.string().email("Enter a valid email"),
  patientPhone: z.string().optional(),
  date: z.string().min(1, "Choose a date"),
  time: z.string().min(1, "Choose a time"),
  providerId: z.string().min(1, "Select a provider"),
  reason: z.string().min(5, "Tell us briefly what you need"),
});

type FormValues = z.infer<typeof FormSchema>;

interface Provider {
  id: string;
  name: string;
}

export default function Appointments() {
  const [submitted, setSubmitted] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(false);
  const [providers, setProviders] = useState<Provider[]>([]);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/providers");
      const data = await res.json();
      setProviders(data.providers ?? []);
    })();
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      patientName: "",
      patientEmail: "",
      patientPhone: "",
      date: "",
      time: "",
      providerId: "",
      reason: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      setLoading(true);
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("Failed to book appointment");
      const data = (await res.json()) as CreateAppointmentResponse;
      setSubmitted(data.appointment);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="container py-10">
        <Card className="max-w-xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <CheckCircle2 className="h-6 w-6 text-emerald-500" /> Appointment
              confirmed
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">When:</span>{" "}
              {new Date(submitted.scheduledAt).toLocaleString()}
            </div>
            <div>
              <span className="text-muted-foreground">With:</span>{" "}
              {submitted.providerName}
            </div>
            <div>
              <span className="text-muted-foreground">Where:</span>{" "}
              <a
                className="text-primary underline"
                href={submitted.meetingUrl}
                target="_blank"
                rel="noreferrer"
              >
                Join video visit
              </a>
            </div>
            <div className="pt-4">
              Confirmation code:{" "}
              <span className="font-mono tracking-wider bg-muted px-2 py-1 rounded">
                {submitted.confirmationCode}
              </span>
            </div>
            <div className="pt-6">
              <h3 className="font-semibold">Quick intake</h3>
              <Intake appointmentId={submitted.id} />
            </div>
            <div className="pt-6 flex flex-wrap gap-3">
              <Button
                onClick={() =>
                  (window.location.href = `/patient?tab=appointments`)
                }
              >
                View appointments
              </Button>
              <Button
                variant="outline"
                onClick={async () => {
                  try {
                    const res = await fetch("/api/payments/initiate", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ appointmentId: submitted.id }),
                    });
                    const d = await res.json();
                    if (!res.ok || !d.reference) {
                      alert(d.error || "Failed to start payment");
                      return;
                    }
                    const pubKey =
                      (import.meta.env.VITE_PAYSTACK_PUBLIC_KEY as string) ||
                      (typeof process !== "undefined"
                        ? (process.env.PAYSTACK_PUBLIC_KEY as string)
                        : undefined);
                    if (pubKey) {
                      try {
                        await new Promise<void>((resolve, reject) => {
                          if ((window as any).PaystackPop) return resolve();
                          const s = document.createElement("script");
                          s.src = "https://js.paystack.co/v1/inline.js";
                          s.async = true;
                          s.onload = () => resolve();
                          s.onerror = () =>
                            reject(new Error("Failed to load Paystack script"));
                          document.head.appendChild(s);
                        });
                        const ref = d.reference as string;
                        const handler = (window as any).PaystackPop.setup({
                          key: pubKey,
                          email: d.email,
                          amount: Math.round((d.amount || 0) * 100),
                          currency: d.currency || "USD",
                          ref,
                          callback: function () {
                            window.location.href = `/payment-status?reference=${encodeURIComponent(ref)}`;
                          },
                          onClose: function () {},
                        });
                        handler.openIframe();
                      } catch (err) {
                        console.warn(
                          "Inline Paystack failed; falling back",
                          err,
                        );
                        if (d.authorizationUrl)
                          window.location.href = d.authorizationUrl as string;
                      }
                    } else if (d.authorizationUrl) {
                      window.location.href = d.authorizationUrl as string;
                    }
                  } catch (err) {
                    console.warn("Payment init failed", err);
                    alert("Payment failed to initialize");
                  }
                }}
              >
                Pay now
              </Button>
              <Button className="" onClick={() => setSubmitted(null)}>
                Book another
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-background to-muted/30">
      <section className="container py-12 md:py-16">
        <div className="grid md:grid-cols-2 gap-10 items-start">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Book a telehealth appointment
            </h1>
            <p className="mt-3 text-muted-foreground">
              Choose a provider and time that works for you. Most visits take
              15–20 minutes.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
              <li>• HIPAA-grade encrypted video</li>
              <li>• E-prescriptions sent to your pharmacy</li>
              <li>• Insurance and HSA/FSA accepted</li>
            </ul>
          </div>
          <Card className="shadow-xl">
            <CardContent className="pt-6">
              <form
                className="grid gap-4"
                onSubmit={form.handleSubmit(onSubmit)}
              >
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium">Full name</label>
                    <Input
                      {...form.register("patientName")}
                      placeholder="Jane Doe"
                    />
                    <p className="text-xs text-destructive mt-1">
                      {form.formState.errors.patientName?.message}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <Input
                      type="email"
                      {...form.register("patientEmail")}
                      placeholder="you@example.com"
                    />
                    <p className="text-xs text-destructive mt-1">
                      {form.formState.errors.patientEmail?.message}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">
                    Phone (optional)
                  </label>
                  <Input
                    {...form.register("patientPhone")}
                    placeholder="(555) 555-1234"
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium">Date</label>
                    <Input type="date" {...form.register("date")} />
                    <p className="text-xs text-destructive mt-1">
                      {form.formState.errors.date?.message}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Time</label>
                    <Input type="time" {...form.register("time")} />
                    <p className="text-xs text-destructive mt-1">
                      {form.formState.errors.time?.message}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Provider</label>
                  <Select onValueChange={(v) => form.setValue("providerId", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a provider" />
                    </SelectTrigger>
                    <SelectContent>
                      {providers.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-destructive mt-1">
                    {form.formState.errors.providerId?.message}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Reason for visit
                  </label>
                  <Textarea
                    rows={4}
                    {...form.register("reason")}
                    placeholder="Describe your symptoms or goals"
                  />
                  <p className="text-xs text-destructive mt-1">
                    {form.formState.errors.reason?.message}
                  </p>
                </div>

                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Confirm appointment"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
