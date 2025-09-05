import { Navigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import type { UserRole } from "@shared/api";

export function RequireAuth({ children }: { children: JSX.Element }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export function RequireRole({ role, children }: { role: UserRole | UserRole[]; children: JSX.Element }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  const roles = Array.isArray(role) ? role : [role];
  if (!roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}
