import { Request, Response, RequestHandler } from "express";
import { z } from "zod";
import crypto from "node:crypto";

interface User {
  id: string;
  name: string;
  email: string;
  role: "patient" | "doctor" | "admin";
  providerId?: string; // when role=doctor
  passwordHash: string;
  salt: string;
  createdAt: string;
}

export const users = new Map<string, User>(); // key: email
export const sessions = new Map<string, string>(); // token -> userId

function seedUser(name: string, email: string, password: string, role: User["role"], providerId?: string) {
  const lower = email.toLowerCase();
  if (users.has(lower)) return;
  const salt = uid();
  const user: User = {
    id: uid(),
    name,
    email: lower,
    role,
    providerId,
    passwordHash: hashPassword(password, salt),
    salt,
    createdAt: new Date().toISOString(),
  };
  users.set(lower, user);
}

// Demo accounts (in-memory only; change as needed)
const ADMIN_EMAIL = process.env.ADMIN_DEFAULT_EMAIL || "admin@carelink.health";
const ADMIN_PASSWORD = process.env.ADMIN_DEFAULT_PASSWORD || "Admin123!";
seedUser("Admin", ADMIN_EMAIL, ADMIN_PASSWORD, "admin");
// Keep a demo doctor for local testing
seedUser("Dr. Karen Lee", "doctor@carelink.health", "Doctor123!", "doctor", "peds-lee");

export function uid() {
  return crypto.randomBytes(16).toString("hex");
}

export function hashPassword(password: string, salt: string) {
  return crypto.createHash("sha256").update(password + ":" + salt).digest("hex");
}

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const postSignup: RequestHandler = (req, res) => {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { name, email, password } = parsed.data;
  if (users.has(email.toLowerCase())) {
    res.status(409).json({ error: "User already exists" });
    return;
  }
  const salt = uid();
  const user: User = {
    id: uid(),
    name,
    email: email.toLowerCase(),
    role: "patient",
    passwordHash: hashPassword(password, salt),
    salt,
    createdAt: new Date().toISOString(),
  };
  users.set(user.email, user);

  const token = uid();
  sessions.set(token, user.id);

  res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
};

export const postLogin: RequestHandler = (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { email, password } = parsed.data;
  const user = users.get(email.toLowerCase());
  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  const ok = hashPassword(password, user.salt) === user.passwordHash;
  if (!ok) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  const token = uid();
  sessions.set(token, user.id);
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, providerId: user.providerId } });
};

export const getMe: RequestHandler = (req, res) => {
  const user = getUserFromRequest(req, res);
  if (!user) return;
  res.json({ id: user.id, name: user.name, email: user.email, role: user.role, providerId: user.providerId });
};

export function getUserFromRequest(req: Request, res?: Response) {
  const auth = req.headers.authorization;
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : (req.query.token as string | undefined);
  if (!token) {
    if (res) res.status(401).json({ error: "Missing token" });
    return null;
  }
  const userId = sessions.get(token);
  if (!userId) {
    if (res) res.status(401).json({ error: "Invalid token" });
    return null;
  }
  const user = Array.from(users.values()).find((u) => u.id === userId) || null;
  if (!user && res) res.status(404).json({ error: "User not found" });
  return user;
}
