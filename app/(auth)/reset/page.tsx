"use client"

import type React from "react"

import { useState } from "react"
import AppHeader from "@/components/app-header"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function ResetPage() {
  const supabase = getSupabaseClient()
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: typeof window !== "undefined" ? `${window.location.origin}/login` : undefined,
    })
    if (error) setError(error.message)
    else setSent(true)
  }

  return (
    <div className="min-h-screen bg-white">
      <AppHeader />
      <main className="mx-auto max-w-md px-4 py-10">
        <h1 className="text-2xl font-semibold mb-6">Reset password</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-600">Email</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {sent && <p className="text-sm text-green-700">If the email exists, a reset link was sent.</p>}
          <Button className="w-full bg-sky-600 hover:bg-sky-700 text-white">Send link</Button>
        </form>
      </main>
    </div>
  )
}
