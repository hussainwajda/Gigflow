export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
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
          created_at?: string;
          updated_at?: string;
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
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      current_user_role: {
        Args: Record<string, never>;
        Returns: "admin" | "sales";
      };
      handle_new_user: {
        Args: Record<string, never>;
        Returns: unknown;
      };
      set_updated_at: {
        Args: Record<string, never>;
        Returns: unknown;
      };
    };
    Enums: {
      user_role: "admin" | "sales";
      lead_status: "New" | "Contacted" | "Qualified" | "Lost";
      lead_source: "Website" | "Instagram" | "Referral";
    };
    CompositeTypes: Record<string, never>;
  };
};
