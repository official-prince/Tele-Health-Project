// Basic placeholder types for Supabase DB. Extend this file with real tables when you generate Prisma or SQL schema.

export type Json = any;

export interface Database {
  public: {
    Tables: {
      users: { Row: any; Insert: any; Update: any };
      doctors: { Row: any; Insert: any; Update: any };
      appointments: { Row: any; Insert: any; Update: any };
      plans: { Row: any; Insert: any; Update: any };
      announcements: { Row: any; Insert: any; Update: any };
      tickets: { Row: any; Insert: any; Update: any };
      logs: { Row: any; Insert: any; Update: any };
    };
    Functions: {};
  };
}
