import { createClient } from "@supabase/supabase-js"

export function getServiceRoleClient() {
  const url = process.env.SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (!url || !key) {
    throw new Error("Missing Supabase server environment variables")
  }

  return createClient(url, key)
}
