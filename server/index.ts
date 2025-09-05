import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { getAppointments, listProviders, postAppointment, getAllAppointments, patchAppointmentStatus, addIntake, addNote, addPrescription, getMessages, postMessage, addReminder, uploadAppointmentFile, createMeeting, signPrescription, getPayouts, postPayout } from "./routes/appointments";
import { getMe, postLogin, postSignup } from "./routes/auth";
import { getMyProfile, patchMyProfile, adminApproveDoctor, listDoctors, getEarnings, uploadLicense, getNotifications } from "./routes/doctor";
import { getPatients, patchPatient, postRefund, getFinanceSummary, getPlans, upsertPlan, deletePlan, getAnnouncements, postAnnouncement, deleteAnnouncement, getTickets, postTicket, patchTicket, getSecurity, patchSecurity, getLogs, createDoctor } from "./routes/admin";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Telehealth API routes
  app.post("/api/appointments", postAppointment);
  app.get("/api/appointments", getAppointments);
  app.get("/api/providers", listProviders);
  app.get("/api/appointments/all", getAllAppointments);
  app.patch("/api/appointments/:id", patchAppointmentStatus);
  app.post("/api/appointments/:id/intake", addIntake);
  app.post("/api/appointments/:id/notes", addNote);
  app.post("/api/appointments/:id/prescriptions", addPrescription);
  app.get("/api/appointments/:id/messages", getMessages);
  app.post("/api/appointments/:id/messages", postMessage);
  app.post("/api/appointments/:id/reminders", addReminder);
  app.post("/api/appointments/:id/files", uploadAppointmentFile);
  // create meeting (placeholder integration)
  app.post("/api/appointments/:id/create-meeting", createMeeting);
  // sign prescription
  app.post("/api/appointments/:id/prescriptions/:prescId/sign", signPrescription);

  // Doctor payouts
  app.get("/api/doctor/:providerId/payouts", getPayouts);
  app.post("/api/doctor/:providerId/payouts", postPayout);

  // Doctor profile and analytics
  app.get("/api/doctor/me", getMyProfile);
  app.patch("/api/doctor/me", patchMyProfile);
  // Upload doctor's license (accepts base64 payload) — if SUPABASE configured this will store in Supabase Storage
  app.post("/api/doctor/me/license", uploadLicense);
  // Notifications for doctor dashboard
  app.get("/api/doctor/notifications", getNotifications);
  app.get("/api/doctor/:providerId/earnings", getEarnings);
  app.get("/api/doctors", listDoctors);
  app.patch("/api/doctor/:userId/approve", adminApproveDoctor);

  // Admin
  app.get("/api/admin/patients", getPatients);
  app.post("/api/admin/doctors", createDoctor);
  app.patch("/api/admin/patients/:email", patchPatient);
  app.post("/api/admin/refunds/:id", postRefund);
  app.get("/api/admin/finance/summary", getFinanceSummary);
  app.get("/api/admin/plans", getPlans);
  app.put("/api/admin/plans", upsertPlan);
  app.delete("/api/admin/plans/:id", deletePlan);
  app.get("/api/admin/announcements", getAnnouncements);
  app.post("/api/admin/announcements", postAnnouncement);
  app.delete("/api/admin/announcements/:id", deleteAnnouncement);
  app.get("/api/admin/tickets", getTickets);
  app.post("/api/admin/tickets", postTicket);
  app.patch("/api/admin/tickets/:id", patchTicket);
  app.get("/api/admin/security", getSecurity);
  app.patch("/api/admin/security", patchSecurity);
  app.get("/api/admin/logs", getLogs);

  // Auth API routes (in-memory demo)
  app.post("/api/auth/signup", postSignup);
  app.post("/api/auth/login", postLogin);
  app.get("/api/auth/me", getMe);

  return app;
}
