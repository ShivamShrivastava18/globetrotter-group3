import { createClient } from "@supabase/supabase-js"

export function getServiceRoleClient() {
  const url = "https://acpbsillmgocailiwshs.supabase.co"
  // IMPORTANT: Replace with your actual service role key from your Supabase dashboard.
  // It is strongly recommended to use environment variables instead of hardcoding keys.
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  return createClient(url, key)
}