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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const body = await req.json()
    const {
      email,
      password,
      full_name,
      phone_number,
      is_donor,
      blood_type,
      latitude,
      longitude,
      region,
      hopital_id,
    } = body

    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Email and password are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const role = is_donor ? 'donneur' : 'patient'
    const [first_name, ...rest] = (full_name || '').split(' ')
    const last_name = rest.join(' ')

    const adminClient = createClient(supabaseUrl, serviceKey)

    const { data: newUser, error: signupError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (signupError) {
      return new Response(JSON.stringify({ error: signupError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const profilePayload: Record<string, unknown> = {
      id: newUser.user.id,
      role,
      first_name,
      last_name,
      phone: phone_number,
      region,
    }

    if (is_donor) {
      profilePayload.blood_type = blood_type
      profilePayload.latitude = latitude
      profilePayload.longitude = longitude
      profilePayload.is_available = true
    }

    if (hopital_id) {
      profilePayload.hopital_id = hopital_id
    }

    const { error: profileError } = await adminClient.from('profiles').insert(profilePayload)
    if (profileError) {
      return new Response(JSON.stringify({ error: profileError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ success: true, userId: newUser.user.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
