/**
 * Shared code between client and server
 */

export interface DemoResponse { message: string }

// Auth
export type UserRole = "patient" | "doctor" | "admin";
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  providerId?: string;
}
export interface AuthSessionResponse { token: string; user: AuthUser }

// Doctor profile
export type VerificationStatus = "pending" | "approved" | "rejected";
export interface AvailabilitySlot { day: number; start: string; end: string }
export interface DoctorProfile {
  userId: string;
  providerId: string;
  displayName: string;
  specialty: string;
  licenseNumber: string;
  licenseState: string;
  verification: VerificationStatus;
  feeUSD: number;
  availability: AvailabilitySlot[];
  // Optional URL to uploaded license (stored in Supabase Storage or other secure storage)
  licenseUrl?: string;
  // Optional spoken languages and bio
  languages?: string[];
  bio?: string;
}

// Appointments
export type AppointmentStatus = "scheduled" | "cancelled" | "completed";

export interface IntakeForm { symptoms: string; medications?: string; allergies?: string }
export interface Note { id: string; authorUserId: string; createdAt: string; body: string }
export interface Prescription { id: string; medication: string; dosage: string; instructions: string; signedBy: string; createdAt: string; signed?: boolean; signedAt?: string; signatureData?: string }
export interface ChatMessage { id: string; authorUserId: string; createdAt: string; text: string }

export interface Appointment {
  id: string;
  createdAt: string;
  scheduledAt: string;
  patientName: string;
  patientEmail: string;
  patientPhone?: string;
  providerId: string;
  providerName: string;
  reason: string;
  status: AppointmentStatus;
  confirmationCode: string;
  meetingUrl: string;
  intake?: IntakeForm;
  notes?: Note[];
  prescriptions?: Prescription[];
  messages?: ChatMessage[];
  reminders?: string[];
  files?: { id: string; filename: string; url: string; uploadedAt: string; uploadedBy?: string }[];
}

export interface CreateAppointmentRequest {
  patientName: string;
  patientEmail: string;
  patientPhone?: string;
  date: string;
  time: string;
  providerId: string;
  reason: string;
}

export interface CreateAppointmentResponse { appointment: Appointment }

export interface GetAppointmentsQuery { email?: string; providerId?: string }

export interface EarningsSummary { totalRevenue: number; completed: number; cancelled: number; byWeek: { week: string; revenue: number; sessions: number }[] }

export interface ApiError { error: string }
