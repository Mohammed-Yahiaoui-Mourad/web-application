import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const {
      hopital_id,
      hospital_name,
      hospital_latitude,
      hospital_longitude,
      blood_type,
      severity,
      diagnosis,
      units_needed,
      region,
      needed_by,
    } = await req.json()

    if (!hopital_id || !hospital_name || !blood_type || !severity || !region || !needed_by) {
      return new Response(JSON.stringify({ error: 'Missing required request fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const client = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })

    const { data, error } = await client.rpc('create_blood_request', {
      p_hopital_id: hopital_id,
      p_hospital_name: hospital_name,
      p_hospital_latitude: hospital_latitude,
      p_hospital_longitude: hospital_longitude,
      p_blood_type: blood_type,
      p_severity: severity,
      p_diagnosis: diagnosis,
      p_units_needed: units_needed || 1,
      p_region: region,
      p_expires_at: new Date(needed_by).toISOString(),
    })

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
