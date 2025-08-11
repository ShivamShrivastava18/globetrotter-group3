"use client"

import type React from "react"

import { useState } from "react"
import AppHeader from "@/components/app-header"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function LoginPage() {
  const supabase = getSupabaseClient()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) setError(error.message)
    else window.location.href = "/"
  }

  return (
    <div className="min-h-screen bg-white">
      <AppHeader />
      <main className="mx-auto max-w-md px-4 py-10">
        <h1 className="text-2xl font-semibold mb-6">Log in</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-600">Email</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="text-sm text-gray-600">Password</label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button disabled={loading} className="w-full bg-sky-600 hover:bg-sky-700 text-white">
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
        <div className="text-sm text-gray-600 mt-4">
          <a className="text-sky-700 underline" href="/reset">
            Forgot password?
          </a>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Don{"'"}t have an account?{" "}
          <a className="text-sky-700 underline" href="/signup">
            Sign up
          </a>
        </p>
      </main>
    </div>
  )
}
