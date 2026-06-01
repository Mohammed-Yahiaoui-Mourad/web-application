-- BloodMatch — Schéma complet Supabase
-- Exécuter dans le SQL Editor de Supabase

-- =====================
-- TABLE: hopitals (avant profiles pour FK)
-- =====================
CREATE TABLE IF NOT EXISTS hopitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  region TEXT NOT NULL,
  phone TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  osm_id TEXT,
  facility_type TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS hopitals_osm_id_key ON hopitals (osm_id) WHERE osm_id IS NOT NULL;

-- =====================
-- TABLE: profiles
-- =====================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('super_admin','admin_hopital','patient','donneur')),
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  date_of_birth DATE,
  blood_type TEXT CHECK (blood_type IN ('A+','A-','B+','B-','AB+','AB-','O+','O-')),
  region TEXT,
  hopital_id UUID REFERENCES hopitals(id),
  last_donation_date DATE,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================
-- TABLE: blood_requests
-- =====================
CREATE TABLE IF NOT EXISTS blood_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hopital_id UUID REFERENCES hopitals(id),
  patient_id UUID REFERENCES profiles(id),
  blood_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('critique','urgent','normal')),
  diagnosis TEXT,
  units_needed INTEGER DEFAULT 1,
  region TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','fulfilled','cancelled')),
  donors_confirmed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ
);

-- =====================
-- TABLE: donor_alerts
-- =====================
CREATE TABLE IF NOT EXISTS donor_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES blood_requests(id) ON DELETE CASCADE,
  donor_id UUID REFERENCES profiles(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined','completed')),
  sent_at TIMESTAMPTZ DEFAULT now(),
  responded_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '30 minutes')
);

-- =====================
-- TABLE: messages
-- =====================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES blood_requests(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id),
  content TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================
-- FONCTION: Compatibilité sanguine
-- =====================
CREATE OR REPLACE FUNCTION get_compatible_blood_types(patient_blood_type TEXT)
RETURNS TEXT[] AS $$
BEGIN
  RETURN CASE patient_blood_type
    WHEN 'A+'  THEN ARRAY['A+','A-','O+','O-']
    WHEN 'A-'  THEN ARRAY['A-','O-']
    WHEN 'B+'  THEN ARRAY['B+','B-','O+','O-']
    WHEN 'B-'  THEN ARRAY['B-','O-']
    WHEN 'AB+' THEN ARRAY['A+','A-','B+','B-','AB+','AB-','O+','O-']
    WHEN 'AB-' THEN ARRAY['A-','B-','AB-','O-']
    WHEN 'O+'  THEN ARRAY['O+','O-']
    WHEN 'O-'  THEN ARRAY['O-']
    ELSE ARRAY[]::TEXT[]
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================
-- FONCTION: Broadcast aux donneurs
-- =====================
CREATE OR REPLACE FUNCTION broadcast_to_donors(p_request_id UUID)
RETURNS INTEGER AS $$
DECLARE
  req blood_requests%ROWTYPE;
  compatible_types TEXT[];
  donor_count INTEGER;
BEGIN
  SELECT * INTO req FROM blood_requests WHERE id = p_request_id;
  IF NOT FOUND THEN
    RETURN 0;
  END IF;

  compatible_types := get_compatible_blood_types(req.blood_type);

  INSERT INTO donor_alerts (request_id, donor_id, expires_at)
  SELECT p_request_id, p.id, now() + INTERVAL '30 minutes'
  FROM profiles p
  WHERE p.role = 'donneur'
    AND p.blood_type = ANY(compatible_types)
    AND p.region = req.region
    AND p.is_available = true
    AND (p.last_donation_date IS NULL OR p.last_donation_date < (CURRENT_DATE - INTERVAL '2 months'))
    AND NOT EXISTS (
      SELECT 1 FROM donor_alerts da
      WHERE da.request_id = p_request_id AND da.donor_id = p.id
    );

  GET DIAGNOSTICS donor_count = ROW_COUNT;
  RETURN donor_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Helpers RLS (SECURITY DEFINER = évite récursion infinie sur profiles)
CREATE OR REPLACE FUNCTION public.auth_user_role()
RETURNS TEXT
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT role FROM public.profiles WHERE id = auth.uid(); $$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT auth_user_role() = 'super_admin'; $$;

CREATE OR REPLACE FUNCTION public.is_admin_hopital()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT auth_user_role() = 'admin_hopital'; $$;

CREATE OR REPLACE FUNCTION public.auth_hopital_id()
RETURNS UUID
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT hopital_id FROM public.profiles WHERE id = auth.uid(); $$;

-- =====================
-- ROW LEVEL SECURITY
-- =====================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE hopitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE blood_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE donor_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Profiles
DROP POLICY IF EXISTS "Utilisateur voit son profil" ON profiles;
CREATE POLICY "Utilisateur voit son profil" ON profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Utilisateur insère son profil" ON profiles;
CREATE POLICY "Utilisateur insère son profil" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Utilisateur met à jour son profil" ON profiles;
CREATE POLICY "Utilisateur met à jour son profil" ON profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Super admin voit tout profiles" ON profiles;
CREATE POLICY "Super admin voit tout profiles" ON profiles
  FOR ALL USING (public.is_super_admin());

DROP POLICY IF EXISTS "Admin hopital voit profils region" ON profiles;
CREATE POLICY "Admin hopital voit profils region" ON profiles
  FOR SELECT USING (public.is_admin_hopital());

-- Hopitals (lecture publique pour liste OSM)
DROP POLICY IF EXISTS "Anon lit hopitaux" ON hopitals;
CREATE POLICY "Anon lit hopitaux" ON hopitals
  FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "Tous voient hopitaux" ON hopitals;
CREATE POLICY "Tous voient hopitaux" ON hopitals
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Super admin gère hopitaux" ON hopitals;
CREATE POLICY "Super admin gère hopitaux" ON hopitals
  FOR ALL USING (public.is_super_admin());

-- Blood requests
DROP POLICY IF EXISTS "Donneurs voient demandes actives region" ON blood_requests;
CREATE POLICY "Donneurs voient demandes actives region" ON blood_requests
  FOR SELECT USING (
    status = 'active'
    AND public.auth_user_role() = 'donneur'
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.region = blood_requests.region
        AND p.is_available = true
        AND (p.last_donation_date IS NULL OR p.last_donation_date < (CURRENT_DATE - INTERVAL '2 months'))
    )
  );

DROP POLICY IF EXISTS "Patients voient leurs demandes" ON blood_requests;
CREATE POLICY "Patients voient leurs demandes" ON blood_requests
  FOR SELECT USING (patient_id = auth.uid());

DROP POLICY IF EXISTS "Patients créent demandes" ON blood_requests;
CREATE POLICY "Patients créent demandes" ON blood_requests
  FOR INSERT WITH CHECK (patient_id = auth.uid());

DROP POLICY IF EXISTS "Hopital gère ses demandes" ON blood_requests;
CREATE POLICY "Hopital gère ses demandes" ON blood_requests
  FOR ALL USING (
    public.is_admin_hopital()
    AND public.auth_hopital_id() = blood_requests.hopital_id
  );

DROP POLICY IF EXISTS "Super admin blood_requests" ON blood_requests;
CREATE POLICY "Super admin blood_requests" ON blood_requests
  FOR ALL USING (public.is_super_admin());

-- Donor alerts
DROP POLICY IF EXISTS "Donneur voit ses alertes" ON donor_alerts;
CREATE POLICY "Donneur voit ses alertes" ON donor_alerts
  FOR SELECT USING (donor_id = auth.uid());

DROP POLICY IF EXISTS "Donneur met à jour ses alertes" ON donor_alerts;
CREATE POLICY "Donneur met à jour ses alertes" ON donor_alerts
  FOR UPDATE USING (donor_id = auth.uid());

DROP POLICY IF EXISTS "Admin hopital voit alertes hopital" ON donor_alerts;
CREATE POLICY "Admin hopital voit alertes hopital" ON donor_alerts
  FOR SELECT USING (
    public.is_admin_hopital()
    AND EXISTS (
      SELECT 1 FROM public.blood_requests br
      WHERE br.id = donor_alerts.request_id
        AND br.hopital_id = public.auth_hopital_id()
    )
  );

DROP POLICY IF EXISTS "Admin hopital met à jour alertes" ON donor_alerts;
CREATE POLICY "Admin hopital met à jour alertes" ON donor_alerts
  FOR UPDATE USING (
    public.is_admin_hopital()
    AND EXISTS (
      SELECT 1 FROM public.blood_requests br
      WHERE br.id = donor_alerts.request_id
        AND br.hopital_id = public.auth_hopital_id()
    )
  );

-- Messages
DROP POLICY IF EXISTS "Participants voient messages request" ON messages;
CREATE POLICY "Participants voient messages request" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.blood_requests br
      WHERE br.id = messages.request_id
        AND (
          br.patient_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.donor_alerts da
            WHERE da.request_id = br.id AND da.donor_id = auth.uid()
          )
          OR (public.is_admin_hopital() AND br.hopital_id = public.auth_hopital_id())
        )
    )
  );

DROP POLICY IF EXISTS "Participants envoient messages" ON messages;
CREATE POLICY "Participants envoient messages" ON messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE donor_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE blood_requests;

-- Grant execute on RPC
GRANT EXECUTE ON FUNCTION broadcast_to_donors(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_compatible_blood_types(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.auth_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_hopital() TO authenticated;
GRANT EXECUTE ON FUNCTION public.auth_hopital_id() TO authenticated;
