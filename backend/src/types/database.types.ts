export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          email: string;
          role: "admin" | "sales";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          role?: "admin" | "sales";
        };
        Update: {
          name?: string;
          role?: "admin" | "sales";
        };
        Relationships: [];
      };
      leads: {
        Row: {
          id: string;
          name: string;
          email: string;
          status: "New" | "Contacted" | "Qualified" | "Lost";
          source: "Website" | "Instagram" | "Referral";
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          status?: "New" | "Contacted" | "Qualified" | "Lost";
          source: "Website" | "Instagram" | "Referral";
          created_by: string;
        };
        Update: {
          name?: string;
          email?: string;
          status?: "New" | "Contacted" | "Qualified" | "Lost";
          source?: "Website" | "Instagram" | "Referral";
        };
        Relationships: [
          {
            foreignKeyName: "leads_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
