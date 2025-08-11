-- Unified migration file for all schema and policy changes up to 2025-07-23
-- This file combines all previous migrations in dependency order, with duplicate/obsolete statements removed.
-- Apply this file to a fresh database to get the correct schema and policies.

-- 1. Projects Table and Policies
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  price integer NOT NULL,
  image text NOT NULL,
  image_upload text,
  features text[] NOT NULL DEFAULT '{}',
  technical_details text,
  featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view projects" ON projects;
DROP POLICY IF EXISTS "Authenticated users can create projects" ON projects;
DROP POLICY IF EXISTS "Authenticated users can update projects" ON projects;
DROP POLICY IF EXISTS "Authenticated users can delete projects" ON projects;
CREATE POLICY "Anyone can view projects" ON projects FOR SELECT TO public USING (true);
CREATE POLICY "Authenticated users can create projects" ON projects FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update their projects" ON projects FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete their projects" ON projects FOR DELETE TO authenticated USING (true);

-- 2. Inquiries and Orders Tables and Policies
CREATE TABLE IF NOT EXISTS inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name text NOT NULL,
  email text NOT NULL,
  project_type text NOT NULL,
  budget text NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view inquiries" ON inquiries;
DROP POLICY IF EXISTS "Authenticated users can create inquiries" ON inquiries;
DROP POLICY IF EXISTS "Authenticated users can update inquiries" ON inquiries;
DROP POLICY IF EXISTS "Authenticated users can delete inquiries" ON inquiries;
CREATE POLICY "Anyone can view inquiries" ON inquiries FOR SELECT TO public USING (true);
CREATE POLICY "Public can create inquiries" ON inquiries FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Authenticated users can update inquiries" ON inquiries FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete inquiries" ON inquiries FOR DELETE TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  project_id uuid REFERENCES projects(id),
  project_title text NOT NULL,
  price numeric(10,2) NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view orders" ON orders;
DROP POLICY IF EXISTS "Authenticated users can create orders" ON orders;
DROP POLICY IF EXISTS "Anyone can create orders" ON orders;
CREATE POLICY "Anyone can view orders" ON orders FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can create orders" ON orders FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Authenticated users can update orders" ON orders FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete orders" ON orders FOR DELETE TO authenticated USING (true);

-- 3. Project Documents Table and Policies
-- (Assume table already exists, only policies and columns added)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_documents' AND column_name = 'review_stage') THEN
    ALTER TABLE project_documents ADD COLUMN review_stage text NOT NULL DEFAULT 'review_1';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_documents' AND column_name = 'document_category') THEN
    ALTER TABLE project_documents ADD COLUMN document_category text NOT NULL DEFAULT 'presentation';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_documents' AND column_name = 'description') THEN
    ALTER TABLE project_documents ADD COLUMN description text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_documents' AND column_name = 'is_active') THEN
    ALTER TABLE project_documents ADD COLUMN is_active boolean DEFAULT true;
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS idx_project_documents_project_id ON project_documents(project_id);
CREATE INDEX IF NOT EXISTS idx_project_documents_review_stage ON project_documents(review_stage);
CREATE INDEX IF NOT EXISTS idx_project_documents_category ON project_documents(document_category);
ALTER TABLE project_documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users can delete project documents" ON project_documents;
DROP POLICY IF EXISTS "Authenticated users can update project documents" ON project_documents;
DROP POLICY IF EXISTS "Authenticated users can manage project documents" ON project_documents;
DROP POLICY IF EXISTS "Authenticated users can create project documents" ON project_documents;
DROP POLICY IF EXISTS "Anyone can view project documents" ON project_documents;
DROP POLICY IF EXISTS "Authenticated users can view all project documents" ON project_documents;
CREATE POLICY "Authenticated users can manage project documents" ON project_documents FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can create project documents" ON project_documents FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Anyone can view project documents" ON project_documents FOR SELECT TO public USING (is_active = true);
CREATE POLICY "Authenticated users can view all project documents" ON project_documents FOR SELECT TO authenticated USING (true);

-- 4. Secure Download System (Tokens, Attempts, Functions, Policies)
-- (Use the most recent schema and policy definitions)
DROP TRIGGER IF EXISTS token_cleanup_trigger ON secure_download_tokens;
DROP FUNCTION IF EXISTS trigger_token_cleanup();
DROP FUNCTION IF EXISTS generate_secure_token();
DROP FUNCTION IF EXISTS cleanup_expired_tokens();
CREATE TABLE IF NOT EXISTS secure_download_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text UNIQUE NOT NULL,
  document_id uuid,
  recipient_email text NOT NULL,
  order_id uuid,
  expires_at timestamptz NOT NULL,
  max_downloads integer DEFAULT 5,
  download_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS download_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token_id uuid,
  attempted_email text,
  ip_address text,
  user_agent text,
  success boolean DEFAULT false,
  failure_reason text,
  attempted_at timestamptz DEFAULT now()
);
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'project_documents') THEN
    IF NOT EXISTS (SELECT FROM information_schema.table_constraints WHERE constraint_name = 'secure_download_tokens_document_id_fkey') THEN
      ALTER TABLE secure_download_tokens ADD CONSTRAINT secure_download_tokens_document_id_fkey FOREIGN KEY (document_id) REFERENCES project_documents(id) ON DELETE CASCADE;
    END IF;
  END IF;
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'orders') THEN
    IF NOT EXISTS (SELECT FROM information_schema.table_constraints WHERE constraint_name = 'secure_download_tokens_order_id_fkey') THEN
      ALTER TABLE secure_download_tokens ADD CONSTRAINT secure_download_tokens_order_id_fkey FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;
    END IF;
  END IF;
  IF NOT EXISTS (SELECT FROM information_schema.table_constraints WHERE constraint_name = 'download_attempts_token_id_fkey') THEN
    ALTER TABLE download_attempts ADD CONSTRAINT download_attempts_token_id_fkey FOREIGN KEY (token_id) REFERENCES secure_download_tokens(id) ON DELETE CASCADE;
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS idx_secure_tokens_token ON secure_download_tokens(token);
CREATE INDEX IF NOT EXISTS idx_secure_tokens_email ON secure_download_tokens(recipient_email);
CREATE INDEX IF NOT EXISTS idx_secure_tokens_expires ON secure_download_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_secure_tokens_active ON secure_download_tokens(is_active);
CREATE INDEX IF NOT EXISTS idx_download_attempts_token ON download_attempts(token_id);
CREATE INDEX IF NOT EXISTS idx_download_attempts_email ON download_attempts(attempted_email);
ALTER TABLE secure_download_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE download_attempts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can create secure tokens" ON secure_download_tokens;
DROP POLICY IF EXISTS "Public can view active tokens for verification" ON secure_download_tokens;
DROP POLICY IF EXISTS "Authenticated users can update tokens" ON secure_download_tokens;
DROP POLICY IF EXISTS "Authenticated users can delete tokens" ON secure_download_tokens;
DROP POLICY IF EXISTS "Anyone can insert download attempts" ON download_attempts;
DROP POLICY IF EXISTS "Anyone can view download attempts" ON download_attempts;
DROP POLICY IF EXISTS "Authenticated users can manage download attempts" ON download_attempts;
CREATE POLICY "Public can create secure tokens" ON secure_download_tokens FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Public can view active tokens for verification" ON secure_download_tokens FOR SELECT TO public USING (is_active = true AND expires_at > now());
CREATE POLICY "Authenticated users can update tokens" ON secure_download_tokens FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete tokens" ON secure_download_tokens FOR DELETE TO authenticated USING (true);
CREATE POLICY "Anyone can insert download attempts" ON download_attempts FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can view download attempts" ON download_attempts FOR SELECT TO public USING (true);
CREATE POLICY "Authenticated users can manage download attempts" ON download_attempts FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE OR REPLACE FUNCTION generate_secure_token() RETURNS text LANGUAGE plpgsql SECURITY DEFINER AS $$ DECLARE token_length integer := 32; characters text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'; result text := ''; i integer; BEGIN FOR i IN 1..token_length LOOP result := result || substr(characters, floor(random() * length(characters) + 1)::integer, 1); END LOOP; WHILE EXISTS (SELECT 1 FROM secure_download_tokens WHERE token = result) LOOP result := ''; FOR i IN 1..token_length LOOP result := result || substr(characters, floor(random() * length(characters) + 1)::integer, 1); END LOOP; END LOOP; RETURN result; END; $$;
CREATE OR REPLACE FUNCTION cleanup_expired_tokens() RETURNS integer LANGUAGE plpgsql SECURITY DEFINER AS $$ DECLARE cleaned_count integer; BEGIN UPDATE secure_download_tokens SET is_active = false, updated_at = now() WHERE expires_at < now() AND is_active = true; GET DIAGNOSTICS cleaned_count = ROW_COUNT; RETURN cleaned_count; END; $$;
CREATE OR REPLACE FUNCTION trigger_token_cleanup() RETURNS TRIGGER LANGUAGE plpgsql AS $$ BEGIN PERFORM cleanup_expired_tokens(); RETURN NULL; END; $$;
CREATE TRIGGER token_cleanup_trigger AFTER INSERT ON secure_download_tokens FOR EACH STATEMENT EXECUTE FUNCTION trigger_token_cleanup();
GRANT EXECUTE ON FUNCTION generate_secure_token() TO public;
GRANT EXECUTE ON FUNCTION cleanup_expired_tokens() TO authenticated;

-- 5. Project Requests System
CREATE TABLE IF NOT EXISTS project_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text,
  project_title text NOT NULL,
  project_type text NOT NULL,
  budget_range text NOT NULL,
  description text NOT NULL,
  requirements text,
  timeline text,
  priority text DEFAULT 'medium',
  status text DEFAULT 'pending',
  admin_notes text,
  estimated_price numeric(10,2),
  estimated_timeline text,
  assigned_to text,
  source text DEFAULT 'contact_form',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  reviewed_at timestamptz,
  converted_at timestamptz,
  converted_project_id uuid
);
CREATE TABLE IF NOT EXISTS project_request_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid REFERENCES project_requests(id) ON DELETE CASCADE,
  old_status text,
  new_status text NOT NULL,
  changed_by text,
  notes text,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_project_requests_status ON project_requests(status);
CREATE INDEX IF NOT EXISTS idx_project_requests_type ON project_requests(project_type);
CREATE INDEX IF NOT EXISTS idx_project_requests_created ON project_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_project_requests_email ON project_requests(customer_email);
CREATE INDEX IF NOT EXISTS idx_request_history_request_id ON project_request_status_history(request_id);
ALTER TABLE project_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_request_status_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can create project requests" ON project_requests;
DROP POLICY IF EXISTS "Public can view their own requests" ON project_requests;
DROP POLICY IF EXISTS "Authenticated users can manage all requests" ON project_requests;
CREATE POLICY "Public can create project requests" ON project_requests FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Public can view their own requests" ON project_requests FOR SELECT TO public USING (true);
CREATE POLICY "Authenticated users can manage all requests" ON project_requests FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Authenticated users can view status history" ON project_request_status_history;
DROP POLICY IF EXISTS "Authenticated users can create status history" ON project_request_status_history;
CREATE POLICY "Authenticated users can view status history" ON project_request_status_history FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create status history" ON project_request_status_history FOR INSERT TO authenticated WITH CHECK (true);
CREATE OR REPLACE FUNCTION update_request_status(request_id_param uuid, new_status_param text, changed_by_param text DEFAULT NULL, notes_param text DEFAULT NULL) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$ DECLARE old_status_val text; BEGIN SELECT status INTO old_status_val FROM project_requests WHERE id = request_id_param; UPDATE project_requests SET status = new_status_param, updated_at = now(), reviewed_at = CASE WHEN new_status_param IN ('approved', 'rejected') AND reviewed_at IS NULL THEN now() ELSE reviewed_at END WHERE id = request_id_param; INSERT INTO project_request_status_history (request_id, old_status, new_status, changed_by, notes) VALUES (request_id_param, old_status_val, new_status_param, changed_by_param, notes_param); END; $$;
CREATE OR REPLACE FUNCTION convert_request_to_project(request_id_param uuid, admin_email text DEFAULT NULL) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER AS $$ DECLARE request_record project_requests%ROWTYPE; new_project_id uuid; default_image text := 'https://images.pexels.com/photos/3183153/pexels-photo-3183153.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'; BEGIN SELECT * INTO request_record FROM project_requests WHERE id = request_id_param AND status = 'approved'; IF NOT FOUND THEN RAISE EXCEPTION 'Request not found or not approved'; END IF; INSERT INTO projects (title, description, category, price, image, features, technical_details, featured) VALUES (request_record.project_title, request_record.description, request_record.project_type, COALESCE(request_record.estimated_price, 0)::integer, default_image, ARRAY['Custom development based on requirements','Complete source code and documentation','Installation and setup guide','Technical support included'], COALESCE(request_record.requirements, 'Custom project based on client requirements'), false) RETURNING id INTO new_project_id; UPDATE project_requests SET status = 'converted', converted_project_id = new_project_id, converted_at = now(), updated_at = now() WHERE id = request_id_param; INSERT INTO project_request_status_history (request_id, old_status, new_status, changed_by, notes) VALUES (request_id_param, 'approved', 'converted', admin_email, 'Converted to project ID: ' || new_project_id); RETURN new_project_id; END; $$;
GRANT EXECUTE ON FUNCTION update_request_status(uuid, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION convert_request_to_project(uuid, text) TO authenticated;

-- 6. Global Settings Table and Policies
CREATE TABLE IF NOT EXISTS global_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value jsonb NOT NULL,
  description text,
  updated_by text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_global_settings_key ON global_settings(setting_key);
ALTER TABLE global_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view global settings" ON global_settings;
DROP POLICY IF EXISTS "Authenticated users can manage global settings" ON global_settings;
CREATE POLICY "Anyone can view global settings" ON global_settings FOR SELECT TO public USING (true);
CREATE POLICY "Authenticated users can manage global settings" ON global_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);
INSERT INTO global_settings (setting_key, setting_value, description, updated_by) VALUES ('global_color_theme', '"default"'::jsonb, 'Global color theme applied to all visitors', 'system') ON CONFLICT (setting_key) DO NOTHING;
INSERT INTO global_settings (setting_key, setting_value, description, updated_by) VALUES ('site_mode', '"marketplace"'::jsonb, 'Global site mode: marketplace or portfolio', 'system') ON CONFLICT (setting_key) DO NOTHING;

-- 7. Storage Bucket and Policies for Project Documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) VALUES ('project-documents', 'project-documents', true, 10485760, ARRAY['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.ms-powerpoint','application/vnd.openxmlformats-officedocument.presentationml.presentation','application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']) ON CONFLICT (id) DO NOTHING;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated users can upload project documents') THEN EXECUTE 'CREATE POLICY "Authenticated users can upload project documents" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = ''project-documents'')'; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public can view project documents') THEN EXECUTE 'CREATE POLICY "Public can view project documents" ON storage.objects FOR SELECT TO public USING (bucket_id = ''project-documents'')'; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated users can manage their project documents') THEN EXECUTE 'CREATE POLICY "Authenticated users can manage their project documents" ON storage.objects FOR ALL TO authenticated USING (bucket_id = ''project-documents'') WITH CHECK (bucket_id = ''project-documents'')'; END IF; END $$;
CREATE OR REPLACE FUNCTION verify_project_documents_bucket() RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER AS $$ BEGIN RETURN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'project-documents'); END; $$;
GRANT EXECUTE ON FUNCTION verify_project_documents_bucket() TO authenticated;
GRANT EXECUTE ON FUNCTION verify_project_documents_bucket() TO anon;
