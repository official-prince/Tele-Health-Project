import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/components/AuthProvider";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

const Schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "At least 6 characters"),
});

type Values = z.infer<typeof Schema>;

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const form = useForm<Values>({ resolver: zodResolver(Schema), defaultValues: { email: "", password: "" } });
  const loading = form.formState.isSubmitting;

  const onSubmit = async (values: Values) => {
    const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values) });
    if (!res.ok) {
      form.setError('password', { message: 'Invalid email or password' });
      return;
    }
    const data = await res.json();
    login(data.token, data.user);
    // Redirect based on role
    if (data.user?.role === 'admin') navigate('/admin');
    else if (data.user?.role === 'doctor') navigate('/doctor');
    else navigate('/');
  };

  return (
    <div className="container py-10">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Sign in to your account</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input type="email" {...form.register('email')} placeholder="you@example.com" />
                <p className="text-xs text-destructive mt-1">{form.formState.errors.email?.message}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Password</label>
                <Input type="password" {...form.register('password')} placeholder="••••••" />
                <p className="text-xs text-destructive mt-1">{form.formState.errors.password?.message}</p>
              </div>
              <Button type="submit" disabled={loading}>{loading ? <Loader2 className='h-4 w-4 animate-spin' /> : 'Sign in'}</Button>
            </form>
            <p className="mt-4 text-sm text-muted-foreground">Don't have an account? <Link className="text-primary underline" to="/signup">Sign up</Link></p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
