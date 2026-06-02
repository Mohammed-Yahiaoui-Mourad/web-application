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
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
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
  hospital_name TEXT,
  hospital_latitude DOUBLE PRECISION,
  hospital_longitude DOUBLE PRECISION,
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
  scheduled_time TIMESTAMPTZ,
  units_donated INTEGER DEFAULT 1,
  sent_at TIMESTAMPTZ DEFAULT now(),
  responded_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '30 minutes')
);

CREATE TABLE IF NOT EXISTS donation_appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id UUID REFERENCES profiles(id),
  request_id UUID REFERENCES blood_requests(id),
  scheduled_time TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled','completed','cancelled','no_show')),
  units_donated INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
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
CREATE OR REPLACE FUNCTION haversine_distance(lat1 DOUBLE PRECISION, lon1 DOUBLE PRECISION, lat2 DOUBLE PRECISION, lon2 DOUBLE PRECISION)
RETURNS DOUBLE PRECISION AS $$
DECLARE
  r DOUBLE PRECISION := 6371.0;
  dlat DOUBLE PRECISION := radians(lat2 - lat1);
  dlon DOUBLE PRECISION := radians(lon2 - lon1);
  a DOUBLE PRECISION;
BEGIN
  a := sin(dlat / 2)^2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2)^2;
  RETURN 2 * r * asin(sqrt(a));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

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
    AND p.is_available = true
    AND (p.last_donation_date IS NULL OR p.last_donation_date < (CURRENT_DATE - INTERVAL '2 months'))
    AND (
      (req.hospital_latitude IS NOT NULL AND req.hospital_longitude IS NOT NULL
        AND p.latitude IS NOT NULL AND p.longitude IS NOT NULL
        AND haversine_distance(p.latitude, p.longitude, req.hospital_latitude, req.hospital_longitude) < 30)
      OR p.region = req.region
    )
    AND NOT EXISTS (
      SELECT 1 FROM donor_alerts da
      WHERE da.request_id = p_request_id AND da.donor_id = p.id
    );

  GET DIAGNOSTICS donor_count = ROW_COUNT;
  RETURN donor_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION auto_schedule_appointments(p_request_id UUID, p_max_appointments INTEGER DEFAULT 1)
RETURNS INTEGER AS $$
DECLARE
  req blood_requests%ROWTYPE;
  compatible_types TEXT[];
  appointment_count INTEGER := 0;
  donor_rec RECORD;
BEGIN
  SELECT * INTO req FROM blood_requests WHERE id = p_request_id AND status = 'active';
  IF NOT FOUND THEN
    RETURN 0;
  END IF;

  compatible_types := get_compatible_blood_types(req.blood_type);

  FOR donor_rec IN
    SELECT p.id
    FROM profiles p
    WHERE p.role = 'donneur'
      AND p.blood_type = ANY(compatible_types)
      AND p.is_available = true
      AND (p.last_donation_date IS NULL OR p.last_donation_date < (CURRENT_DATE - INTERVAL '2 months'))
      AND p.latitude IS NOT NULL
      AND p.longitude IS NOT NULL
      AND req.hospital_latitude IS NOT NULL
      AND req.hospital_longitude IS NOT NULL
      AND haversine_distance(p.latitude, p.longitude, req.hospital_latitude, req.hospital_longitude) < 30
      AND NOT EXISTS (
        SELECT 1 FROM donation_appointments da
        WHERE da.request_id = p_request_id AND da.donor_id = p.id
      )
    ORDER BY haversine_distance(p.latitude, p.longitude, req.hospital_latitude, req.hospital_longitude)
    LIMIT p_max_appointments
  LOOP
    INSERT INTO donation_appointments (donor_id, request_id, scheduled_time, status)
    VALUES (donor_rec.id, p_request_id, now() + INTERVAL '1 day', 'scheduled');

    UPDATE profiles
    SET is_available = false
    WHERE id = donor_rec.id;

    UPDATE blood_requests
    SET donors_confirmed = donors_confirmed + 1,
        status = CASE WHEN donors_confirmed + 1 >= units_needed THEN 'fulfilled' ELSE status END
    WHERE id = p_request_id;

    appointment_count := appointment_count + 1;
  END LOOP;

  RETURN appointment_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION create_blood_request(
  p_hopital_id UUID,
  p_hospital_name TEXT,
  p_hospital_latitude DOUBLE PRECISION,
  p_hospital_longitude DOUBLE PRECISION,
  p_blood_type TEXT,
  p_severity TEXT,
  p_diagnosis TEXT,
  p_units_needed INTEGER,
  p_region TEXT,
  p_expires_at TIMESTAMPTZ
)
RETURNS blood_requests AS $$
DECLARE
  new_request blood_requests%ROWTYPE;
BEGIN
  INSERT INTO blood_requests (
    hopital_id, patient_id, hospital_name, hospital_latitude, hospital_longitude,
    blood_type, severity, diagnosis, units_needed, region, expires_at
  ) VALUES (
    p_hopital_id, auth.uid(), p_hospital_name, p_hospital_latitude, p_hospital_longitude,
    p_blood_type, p_severity, p_diagnosis, p_units_needed, p_region, p_expires_at
  )
  RETURNING * INTO new_request;

  IF p_severity IN ('critique', 'urgent') THEN
    PERFORM auto_schedule_appointments(new_request.id, new_request.units_needed);
    PERFORM broadcast_to_donors(new_request.id);
  END IF;

  RETURN new_request;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION get_donor_profile()
RETURNS TABLE (
  id UUID,
  user_id UUID,
  blood_type TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  is_available BOOLEAN,
  last_donation_date DATE
) AS $$
BEGIN
  RETURN QUERY
  SELECT id, id AS user_id, blood_type, latitude, longitude, is_available, last_donation_date
  FROM profiles
  WHERE id = auth.uid() AND role = 'donneur';
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION set_donor_availability(p_is_available BOOLEAN)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE profiles
  SET is_available = p_is_available
  WHERE id = auth.uid() AND role = 'donneur';

  RETURN (SELECT COUNT(*) > 0 FROM profiles WHERE id = auth.uid() AND role = 'donneur');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION schedule_donation(p_request_id UUID, p_scheduled_time TIMESTAMPTZ)
RETURNS donation_appointments AS $$
DECLARE
  new_appointment donation_appointments%ROWTYPE;
BEGIN
  INSERT INTO donation_appointments (donor_id, request_id, scheduled_time, status)
  VALUES (auth.uid(), p_request_id, p_scheduled_time, 'scheduled')
  RETURNING * INTO new_appointment;

  UPDATE profiles
  SET is_available = false
  WHERE id = auth.uid() AND role = 'donneur';

  IF p_request_id IS NOT NULL THEN
    UPDATE blood_requests
    SET donors_confirmed = donors_confirmed + 1
    WHERE id = p_request_id;
  END IF;

  RETURN new_appointment;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION get_eligible_donors_count(p_request_id UUID)
RETURNS TABLE (compatible_total INTEGER, within_radius INTEGER) AS $$
DECLARE
  req blood_requests%ROWTYPE;
  compatible_types TEXT[];
BEGIN
  SELECT * INTO req FROM blood_requests WHERE id = p_request_id;
  IF NOT FOUND THEN
    compatible_total := 0;
    within_radius := 0;
    RETURN NEXT;
    RETURN;
  END IF;

  compatible_types := get_compatible_blood_types(req.blood_type);

  SELECT COUNT(*) INTO compatible_total
  FROM profiles p
  WHERE p.role = 'donneur'
    AND p.blood_type = ANY(compatible_types)
    AND p.is_available = true
    AND (p.last_donation_date IS NULL OR p.last_donation_date < (CURRENT_DATE - INTERVAL '2 months'));

  IF req.hospital_latitude IS NOT NULL AND req.hospital_longitude IS NOT NULL THEN
    SELECT COUNT(*) INTO within_radius
    FROM profiles p
    WHERE p.role = 'donneur'
      AND p.blood_type = ANY(compatible_types)
      AND p.is_available = true
      AND (p.last_donation_date IS NULL OR p.last_donation_date < (CURRENT_DATE - INTERVAL '2 months'))
      AND p.latitude IS NOT NULL
      AND p.longitude IS NOT NULL
      AND haversine_distance(p.latitude, p.longitude, req.hospital_latitude, req.hospital_longitude) < 30;
  ELSE
    within_radius := 0;
  END IF;

  RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION get_admin_dashboard()
RETURNS TABLE (
  active_users INTEGER,
  available_donors INTEGER,
  active_requests INTEGER,
  fulfilled_requests INTEGER,
  cancelled_requests INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM profiles WHERE role IN ('super_admin','admin_hopital')),
    (SELECT COUNT(*) FROM profiles WHERE role = 'donneur' AND is_available = true
       AND (last_donation_date IS NULL OR last_donation_date < (CURRENT_DATE - INTERVAL '2 months'))),
    (SELECT COUNT(*) FROM blood_requests WHERE status = 'active'),
    (SELECT COUNT(*) FROM blood_requests WHERE status = 'fulfilled'),
    (SELECT COUNT(*) FROM blood_requests WHERE status = 'cancelled');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION update_appointment_status(
  p_appointment_id UUID,
  p_status TEXT,
  p_units_donated INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  app donation_appointments%ROWTYPE;
  donated_units INTEGER := COALESCE(p_units_donated, 1);
BEGIN
  SELECT * INTO app FROM donation_appointments WHERE id = p_appointment_id;
  IF NOT FOUND THEN
    RETURN false;
  END IF;

  UPDATE donation_appointments
  SET status = p_status,
      units_donated = donated_units
  WHERE id = p_appointment_id;

  IF p_status = 'completed' THEN
    UPDATE profiles
    SET last_donation_date = CURRENT_DATE,
        is_available = true
    WHERE id = app.donor_id;

    IF app.request_id IS NOT NULL THEN
      UPDATE blood_requests
      SET donors_confirmed = donors_confirmed + donated_units,
          status = CASE WHEN donors_confirmed + donated_units >= units_needed THEN 'fulfilled' ELSE status END
      WHERE id = app.request_id;
    END IF;
  END IF;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.force_match_scheduler()
RETURNS INTEGER AS $$
DECLARE
  req blood_requests%ROWTYPE;
  total INTEGER := 0;
  scheduled INTEGER;
BEGIN
  FOR req IN SELECT * FROM blood_requests WHERE status = 'active' LOOP
    scheduled := auto_schedule_appointments(req.id, req.units_needed - req.donors_confirmed);
    total := total + scheduled;
    PERFORM broadcast_to_donors(req.id);
  END LOOP;
  RETURN total;
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
ALTER TABLE donation_appointments ENABLE ROW LEVEL SECURITY;
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

DROP POLICY IF EXISTS "Donneur voit ses rendez-vous" ON donation_appointments;
CREATE POLICY "Donneur voit ses rendez-vous" ON donation_appointments
  FOR SELECT USING (donor_id = auth.uid());

DROP POLICY IF EXISTS "Donneur met à jour ses rendez-vous" ON donation_appointments;
CREATE POLICY "Donneur met à jour ses rendez-vous" ON donation_appointments
  FOR UPDATE USING (donor_id = auth.uid());

DROP POLICY IF EXISTS "Admin hopital voit rendez-vous hopital" ON donation_appointments;
CREATE POLICY "Admin hopital voit rendez-vous hopital" ON donation_appointments
  FOR SELECT USING (
    public.is_admin_hopital()
    AND EXISTS (
      SELECT 1 FROM public.blood_requests br
      WHERE br.id = donation_appointments.request_id
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
GRANT EXECUTE ON FUNCTION get_eligible_donors_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION create_blood_request(UUID, TEXT, DOUBLE PRECISION, DOUBLE PRECISION, TEXT, TEXT, TEXT, INTEGER, TEXT, TIMESTAMPTZ) TO authenticated;
GRANT EXECUTE ON FUNCTION schedule_donation(UUID, TIMESTAMPTZ) TO authenticated;
GRANT EXECUTE ON FUNCTION auto_schedule_appointments(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_admin_dashboard() TO authenticated;
GRANT EXECUTE ON FUNCTION update_appointment_status(UUID, TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.force_match_scheduler() TO authenticated;
GRANT EXECUTE ON FUNCTION set_donor_availability(BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION get_donor_profile() TO authenticated;
GRANT EXECUTE ON FUNCTION get_compatible_blood_types(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.auth_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_hopital() TO authenticated;
GRANT EXECUTE ON FUNCTION public.auth_hopital_id() TO authenticated;
