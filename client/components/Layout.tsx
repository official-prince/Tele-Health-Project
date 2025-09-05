import { PropsWithChildren, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Stethoscope, Twitter, Facebook, Instagram } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

function useHashActive(id: string) {
  const { hash, pathname } = useLocation();
  return (hash === `#${id}` && pathname === "/") || false;
}

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  const isHash = to.startsWith("#") || to.includes("/#");
  const loc = useLocation();
  const active = isHash ? useHashActive(to.replace("/#", "").replace("#", "")) : loc.pathname === to;
  return (
    <a
      href={to}
      className={
        "px-3 py-2 text-sm font-medium transition-colors " +
        (active ? "text-primary" : "text-muted-foreground hover:text-foreground")
      }
    >
      {children}
    </a>
  );
}

export function Layout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/30">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

function Logo() {
  return (
    <Link to="/" className="inline-flex items-center gap-2 font-extrabold text-xl tracking-tight">
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
        <Stethoscope className="h-5 w-5" />
      </span>
      <span>CareLink Health</span>
    </Link>
  );
}

function Header() {
  const { user, logout } = useAuth();
  const loc = useLocation();
  const isAdminArea = user?.role === 'admin' && loc.pathname.startsWith('/admin');

  if (isAdminArea) {
    return (
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Logo />
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden md:inline">Hi, <span className="font-medium text-foreground">{user?.name.split(" ")[0]}</span></span>
            <Button variant="outline" onClick={logout}>Log out</Button>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Logo />
        {user?.role === 'patient' && (
          <nav className="hidden md:flex items-center gap-1">
            <NavLink to="/#services">Services</NavLink>
            <NavLink to="/#providers">Providers</NavLink>
            <NavLink to="/#faq">FAQ</NavLink>
            <NavLink to="/appointments">Appointments</NavLink>
          </nav>
        )}
        <div className="flex items-center gap-2">
          {user?.role === 'patient' && <PatientPortal />}
          {user?.role === 'doctor' && (
            <Button variant="ghost" asChild className="hidden sm:inline-flex">
              <Link to="/doctor">Doctor</Link>
            </Button>
          )}
          {!user ? (
            <>
              <Button variant="ghost" asChild className="hidden sm:inline-flex">
                <Link to="/login">Sign in</Link>
              </Button>
              <Button asChild className="hidden sm:inline-flex">
                <Link to="/signup">Sign up</Link>
              </Button>
            </>
          ) : (
            <>
              <span className="text-sm text-muted-foreground hidden md:inline">Hi, <span className="font-medium text-foreground">{user.name.split(" ")[0]}</span></span>
              <Button variant="outline" onClick={logout}>Log out</Button>
            </>
          )}
          {user?.role === 'patient' && (
            <Button asChild className="hidden sm:inline-flex">
              <Link to="/appointments">Book now</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-10 grid sm:grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <Logo />
          <p className="mt-4 text-sm text-muted-foreground max-w-sm">
            Modern virtual care with licensed clinicians. Secure, convenient, and built for better outcomes.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Links</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li><a href="/about" className="hover:underline">About</a></li>
            <li><a href="/contact" className="hover:underline">Contact</a></li>
            <li><a href="/#faq" className="hover:underline">FAQ</a></li>
            <li><a href="/terms" className="hover:underline">Terms & Privacy</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Contact</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>support@carelink.health</li>
            <li>1-800-555-0199</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Follow us</h4>
          <div className="flex items-center gap-3">
            <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter" className="text-muted-foreground hover:text-foreground"><Twitter className="h-5 w-5" /></a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook" className="text-muted-foreground hover:text-foreground"><Facebook className="h-5 w-5" /></a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram" className="text-muted-foreground hover:text-foreground"><Instagram className="h-5 w-5" /></a>
          </div>
        </div>
      </div>
      <div className="border-t py-6 text-center text-xs text-muted-foreground">© {new Date().getFullYear()} CareLink Health</div>
    </footer>
  );
}

function AdminNavLink({ to, children }: { to: string; children: React.ReactNode }) {
  const loc = useLocation();
  const current = new URLSearchParams(loc.search).get("tab") || "users";
  const target = new URL(to, window.location.href).searchParams.get("tab") || "users";
  const active = loc.pathname === "/admin" && current === target;
  return (
    <a href={to} className={"px-3 py-1 text-sm rounded-full transition-colors " + (active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
      {children}
    </a>
  );
}

function PatientPortal() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  const onFetch = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/appointments?email=${encodeURIComponent(email)}`);
      if (!res.ok) throw new Error("Failed to load appointments");
      const data = await res.json();
      setAppointments(data.appointments ?? []);
    } catch (e) {
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Patient portal</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Your appointments</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="you@example.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button onClick={onFetch} disabled={!email || loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "View"}
            </Button>
          </div>
          <div className="grid gap-3 max-h-80 overflow-auto">
            {appointments.length === 0 && (
              <p className="text-sm text-muted-foreground">No upcoming appointments.</p>
            )}
            {appointments.map((a) => (
              <Card key={a.id}>
                <CardContent className="py-4 text-sm">
                  <div className="font-medium">{a.providerName}</div>
                  <div className="text-muted-foreground">
                    {new Date(a.scheduledAt).toLocaleString()} • {a.status}
                  </div>
                  <a className="text-primary underline" href={a.meetingUrl} target="_blank" rel="noreferrer">
                    Join visit
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default Layout;
