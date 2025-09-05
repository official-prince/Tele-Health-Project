import { useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from '@/components/ui/button';
import { Link } from "react-router-dom";
import { ShieldCheck, Video, Pill, Clock, HeartPulse, PhoneCall, Twitter, Facebook, Instagram } from "lucide-react";

export default function Index() {
  const { user } = useAuth();
  const navigate = useNavigate();
  useEffect(() => { if (user?.role === 'doctor') navigate('/doctor'); if (user?.role === 'patient') navigate('/patient'); }, [user]);
  return (
    <div className="bg-gradient-to-b from-background to-muted/30 scroll-smooth">
      {/* Hero */}
      <section className="container py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold">24/7 virtual care</span>
            <h1 className="mt-4 text-4xl md:text-5xl font-extrabold tracking-tight">High-quality telehealth, from anywhere</h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-prose">Connect with licensed clinicians for urgent concerns, therapy, and ongoing care. Secure video visits, e‑prescriptions, and insurance support.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg"><Link to="/signup">Book a consultation</Link></Button>
              <a href="#about" className="inline-flex items-center text-primary hover:underline">Learn more →</a>
            </div>
            <ul className="mt-8 grid sm:grid-cols-3 gap-4 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> Wait times under 10 min</li>
              <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> HIPAA-grade security</li>
              <li className="flex items-center gap-2"><Pill className="h-4 w-4 text-primary" /> E‑prescriptions</li>
            </ul>
          </div>
          <div className="relative">
            <div className="rounded-2xl border bg-card shadow-2xl p-4 grid gap-4">
              <MockVisitCard name="Dr. Karen Lee" title="Pediatrics" />
              <MockVisitCard name="Alex Stone" title="Therapist" />
              <MockVisitCard name="Dr. Mina Cho" title="Dermatology" />
            </div>
          </div>
        </div>
      </section>

      {/* Services / Features */}
      <section id="services" className="container py-14">
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Platform features</h2>
        <p className="mt-2 text-muted-foreground max-w-prose">Everything patients need for modern virtual care.</p>
        <div className="mt-8 grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          <Feature title="Easy Doctor Booking" icon={<Clock className='h-5 w-5' />}>
            Search, filter, and book licensed clinicians in minutes.
          </Feature>
          <Feature title="Secure Video Consultations" icon={<Video className='h-5 w-5' />}>
            Encrypted, HIPAA-grade video visits.
          </Feature>
          <Feature title="Online Prescriptions" icon={<Pill className='h-5 w-5' />}>
            E‑prescriptions sent to your preferred pharmacy.
          </Feature>
          <Feature title="24/7 Support" icon={<PhoneCall className='h-5 w-5' />}>
            Live support and help center for patients.
          </Feature>
          <Feature title="Insurance & Payment Options" icon={<ShieldCheck className='h-5 w-5' />}>
            Secure payments and insurance processing.
          </Feature>
        </div>
        <div className="mt-6">
          <Button asChild><Link to="/signup">Get Started → Sign Up</Link></Button>
        </div>
      </section>

      {/* About */}
      <section id="about" className="container py-14">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold">About CareLink Health</h2>
            <p className="mt-4 text-muted-foreground max-w-prose">Our mission is to make high-quality healthcare accessible to everyone. We provide online consultations, e-prescriptions, and secure medical record storage so patients can get care when and where they need it.</p>
            <div className="mt-4">
              <a className="text-primary underline" href="/about">Learn more about us</a>
            </div>
          </div>
          <div>
            <img src="/placeholder.svg" alt="Telemedicine" className="rounded-lg shadow-lg w-full" />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="container py-14">
        <h2 className="text-2xl md:text-3xl font-extrabold">How it works</h2>
        <div className="mt-6 grid md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="text-center py-8">
              <div className="text-xl font-semibold">1. Sign up & create profile</div>
              <div className="text-sm text-muted-foreground mt-2">Create a secure account and add your medical information.</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="text-center py-8">
              <div className="text-xl font-semibold">2. Book a doctor consultation</div>
              <div className="text-sm text-muted-foreground mt-2">Search by specialty, language, and availability.</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="text-center py-8">
              <div className="text-xl font-semibold">3. Connect via secure video</div>
              <div className="text-sm text-muted-foreground mt-2">Encrypted visits with clinical-quality video and chat.</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="text-center py-8">
              <div className="text-xl font-semibold">4. Access prescriptions & records</div>
              <div className="text-sm text-muted-foreground mt-2">Download prescriptions and share records with providers.</div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="container py-14">
        <h2 className="text-2xl md:text-3xl font-extrabold">What patients say</h2>
        <div className="mt-6 grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="py-6">
              <div className="font-semibold">"Quick and professional service"</div>
              <div className="text-sm text-muted-foreground mt-2">I was able to consult a doctor within minutes and get a prescription sent to my pharmacy.</div>
              <div className="text-xs text-muted-foreground mt-3">— Sarah P.</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-6">
              <div className="font-semibold">"Saved me a trip to urgent care"</div>
              <div className="text-sm text-muted-foreground mt-2">Friendly clinicians and clear follow-up instructions.</div>
              <div className="text-xs text-muted-foreground mt-3">— Miguel R.</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-6">
              <div className="font-semibold">"Secure and easy to use"</div>
              <div className="text-sm text-muted-foreground mt-2">I trust this platform with my medical records.</div>
              <div className="text-xs text-muted-foreground mt-3">— Dr. Kim</div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Providers */}
      <section id="providers" className="container py-14">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Trusted clinicians</h2>
            <p className="mt-2 text-muted-foreground">Experienced, board‑certified, and compassionate.</p>
          </div>
          <Button asChild variant="outline" className="hidden md:inline-flex"><Link to="/appointments">See availability</Link></Button>
        </div>
        <div className="mt-8 grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {["Dr. Karen Lee","Alex Stone, LCSW","Dr. Mina Cho"].map((n, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="h-36 bg-gradient-to-br from-primary/10 to-transparent" />
              <CardContent className="py-4">
                <div className="font-semibold">{n}</div>
                <div className="text-sm text-muted-foreground">{["Pediatrics","Therapy","Dermatology"][i]}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="container py-16">
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Common questions</h2>
        <div className="mt-6 max-w-2xl">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="a1">
              <AccordionTrigger>Do you accept insurance?</AccordionTrigger>
              <AccordionContent>Yes, most major plans are accepted. You can also use HSA/FSA.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="a2">
              <AccordionTrigger>How do prescriptions work?</AccordionTrigger>
              <AccordionContent>After your visit, medications can be e‑prescribed to your preferred pharmacy when clinically appropriate.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="a3">
              <AccordionTrigger>Is my information secure?</AccordionTrigger>
              <AccordionContent>We use HIPAA-grade encryption and strict access controls to protect your data.</AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary/5 border-t">
        <div className="container py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl md:text-2xl font-bold">Ready to get started?</h3>
            <p className="text-muted-foreground">Book a video visit in minutes.</p>
          </div>
          <Button asChild size="lg"><Link to="/appointments">Book now</Link></Button>
        </div>
      </section>
    </div>
  );
}

function Feature({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="py-5">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">{icon}</span>
          <div>
            <div className="font-semibold">{title}</div>
            <div className="text-sm text-muted-foreground">{children}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MockVisitCard({ name, title }: { name: string; title: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border p-4">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md"><Video className="h-5 w-5" /></span>
      <div>
        <div className="font-semibold">{name}</div>
        <div className="text-sm text-muted-foreground">{title}</div>
      </div>
    </div>
  );
}
