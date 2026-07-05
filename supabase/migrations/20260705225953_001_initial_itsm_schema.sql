/*
# AIMPro Enterprise - Initial ITSM Schema

This migration sets up the foundational schema for a multi-tenant ITSM SaaS application.

## New Tables

### 1. companies
- `id` (uuid, primary key) - Unique company identifier
- `name` (text, not null) - Company display name
- `code` (text, unique, not null) - Unique company code for tenant isolation
- `logo_url` (text, nullable) - URL to company logo
- `email` (text, not null) - Primary company email
- `phone` (text, nullable) - Company phone number
- `subscription_plan` (text, default 'free') - Subscription tier (free, starter, professional, enterprise)
- `is_active` (boolean, default true) - Active status for subscription management
- `created_at` (timestamptz) - Record creation timestamp
- `updated_at` (timestamptz) - Record update timestamp

### 2. profiles
- `id` (uuid, primary key, references auth.users) - Links to Supabase auth
- `company_id` (uuid, references companies) - Company association for multi-tenancy
- `role` (text, default 'employee') - User role: super_admin, company_admin, it_manager, it_technician, employee
- `first_name` (text, nullable) - User first name
- `last_name` (text, nullable) - User last name
- `avatar_url` (text, nullable) - URL to user avatar
- `is_active` (boolean, default true) - User active status
- `created_at` (timestamptz) - Record creation timestamp
- `updated_at` (timestamptz) - Record update timestamp

## Security

1. Row Level Security (RLS) is enabled on all tables
2. Users can only access data within their own company (multi-tenant isolation)
3. Super admins have cross-tenant access for platform management
4. Company admins can manage users within their company
5. User profiles are linked to auth.users with cascade delete

## Important Notes

1. The `profiles` table extends Supabase's built-in auth.users
2. Role hierarchy: super_admin > company_admin > it_manager > it_technician > employee
3. The subscription_plan determines feature availability
4. is_active flags control access at company and user levels
*/

-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  logo_url text,
  email text NOT NULL,
  phone text,
  subscription_plan text NOT NULL DEFAULT 'free' CHECK (subscription_plan IN ('free', 'starter', 'professional', 'enterprise')),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id uuid REFERENCES companies(id) ON DELETE SET NULL,
  role text NOT NULL DEFAULT 'employee' CHECK (role IN ('super_admin', 'company_admin', 'it_manager', 'it_technician', 'employee')),
  first_name text,
  last_name text,
  avatar_url text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on companies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Companies RLS Policies
-- Super admins can see all companies, others see only their own
DROP POLICY IF EXISTS "select_companies" ON companies;
CREATE POLICY "select_companies" ON companies FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin')
    OR id = (SELECT company_id FROM profiles WHERE profiles.id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_companies" ON companies;
CREATE POLICY "insert_companies" ON companies FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'));

DROP POLICY IF EXISTS "update_companies" ON companies;
CREATE POLICY "update_companies" ON companies FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin')
    OR (id = (SELECT company_id FROM profiles WHERE profiles.id = auth.uid())
        AND EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('company_admin', 'super_admin')))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin')
    OR (id = (SELECT company_id FROM profiles WHERE profiles.id = auth.uid())
        AND EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('company_admin', 'super_admin')))
  );

DROP POLICY IF EXISTS "delete_companies" ON companies;
CREATE POLICY "delete_companies" ON companies FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'));

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles RLS Policies
-- Users can see profiles within their company (or all if super_admin)
DROP POLICY IF EXISTS "select_profiles" ON profiles;
CREATE POLICY "select_profiles" ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin')
    OR company_id = (SELECT company_id FROM profiles WHERE profiles.id = auth.uid())
    OR id = auth.uid()
  );

-- Company admins and super admins can insert profiles within their company
DROP POLICY IF EXISTS "insert_profiles" ON profiles;
CREATE POLICY "insert_profiles" ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin')
    OR (
      company_id = (SELECT company_id FROM profiles WHERE profiles.id = auth.uid())
      AND EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('company_admin', 'super_admin'))
    )
  );

-- Users can update their own profile, admins can update within their company
DROP POLICY IF EXISTS "update_profiles" ON profiles;
CREATE POLICY "update_profiles" ON profiles FOR UPDATE
  TO authenticated
  USING (
    id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin')
    OR (
      company_id = (SELECT company_id FROM profiles WHERE profiles.id = auth.uid())
      AND EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('company_admin', 'super_admin'))
    )
  )
  WITH CHECK (
    id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin')
    OR (
      company_id = (SELECT company_id FROM profiles WHERE profiles.id = auth.uid())
      AND EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('company_admin', 'super_admin'))
    )
  );

-- Only super admins can delete profiles (soft delete via is_active recommended)
DROP POLICY IF EXISTS "delete_profiles" ON profiles;
CREATE POLICY "delete_profiles" ON profiles FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin'));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_company_id ON profiles(company_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_companies_code ON companies(code);
CREATE INDEX IF NOT EXISTS idx_companies_subscription_plan ON companies(subscription_plan);

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_companies_updated_at ON companies;
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();