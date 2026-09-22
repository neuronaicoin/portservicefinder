import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Tarayıcı için GÜVENLİ client (anon/publishable key, RLS ile korunur).
// lib/supabase.ts'deki supabaseAdmin'in aksine bu dosya client component'lerde
// (signup, login, dashboard) kullanılmak için tasarlandı.
export const supabaseBrowser = createClient(supabaseUrl, supabaseAnonKey)
