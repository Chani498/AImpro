export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'super_admin' | 'company_admin' | 'it_manager' | 'it_technician' | 'employee';
export type SubscriptionPlan = 'free' | 'starter' | 'professional' | 'enterprise';

export interface Company {
  id: string;
  name: string;
  code: string;
  logo_url: string | null;
  email: string;
  phone: string | null;
  subscription_plan: SubscriptionPlan;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  company_id: string | null;
  role: UserRole;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AppUser {
  id: string;
  email: string;
  profile: Profile | null;
  company: Company | null;
}

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: Company;
        Insert: Omit<Company, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Company>;
      };
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Profile>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      subscription_plan: SubscriptionPlan;
    };
  };
}
