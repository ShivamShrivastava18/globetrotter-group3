"use client"

import { useState, useEffect } from "react"
import AppHeader from "@/components/app-header"
import { useSupabaseUser } from "@/hooks/use-supabase-user"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Bell, Shield, Trash2, Save, Loader } from "lucide-react"

type UserSettings = {
  user_id: string
  email_notifications: boolean
  push_notifications: boolean
  privacy_public_profile: boolean
  language: string
  timezone: string
}

export default function SettingsPage() {
  const { user } = useSupabaseUser()
  const supabase = getSupabaseClient()
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (user) {
      loadSettings()
    }
  }, [user])

  const loadSettings = async () => {
    if (!user) return

    try {
      const response = await fetch(`/api/settings?userId=${user.id}`)
      const data = await response.json()

      setSettings({
        user_id: user.id,
        email_notifications: data.email_notifications !== false,
        push_notifications: data.push_notifications !== false,
        privacy_public_profile: data.privacy_public_profile || false,
        language: data.language || "en",
        timezone: data.timezone || "UTC",
        ...data,
      })
    } catch (error) {
      console.error("Error loading settings:", error)
      setSettings({
        user_id: user.id,
        email_notifications: true,
        push_notifications: true,
        privacy_public_profile: false,
        language: "en",
        timezone: "UTC",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!user || !settings) return

    setSaving(true)
    try {
      const { user_id, ...updateData } = settings
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) throw new Error("Failed to save settings")

      const updatedSettings = await response.json()
      setSettings(updatedSettings)
    } catch (error) {
      console.error("Error saving settings:", error)
      alert("Failed to save settings. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!user) return

    setDeleting(true)
    try {
      // This needs to be a server-side operation for security
      const { error } = await supabase.rpc("delete_user")
      if (error) throw error

      await supabase.auth.signOut()
      window.location.href = "/"
    } catch (error) {
      console.error("Error deleting account:", error)
      alert("Failed to delete account. Please contact support.")
      setDeleting(false)
    }
  }

  const updateSetting = (key: keyof UserSettings, value: any) => {
    if (!settings) return
    setSettings({ ...settings, [key]: value })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <AppHeader />
        <main className="mx-auto max-w-3xl px-4 py-10">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-6" />
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="bg-white dark:bg-gray-800">
                  <CardHeader>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[...Array(2)].map((_, j) => (
                        <div key={j} className="flex justify-between items-center">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48" />
                          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-12" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!user || !settings) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <AppHeader />
        <main className="mx-auto max-w-3xl px-4 py-10">
          <Card>
            <CardContent className="p-6 text-center">
              <p>Please log in to access settings.</p>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <AppHeader />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Settings</h1>
          <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
            {saving ? <Loader className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        <div className="space-y-6">
          <Card className="bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Email Notifications</Label>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Receive updates about your trips via email
                  </div>
                </div>
                <Switch
                  checked={settings.email_notifications}
                  onCheckedChange={(checked) => updateSetting("email_notifications", checked)}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Public Profile</Label>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Allow others to see your profile and trips
                  </div>
                </div>
                <Switch
                  checked={settings.privacy_public_profile}
                  onCheckedChange={(checked) => updateSetting("privacy_public_profile", checked)}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-200 dark:border-red-700 bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="h-5 w-5" />
                Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base text-red-600">Delete Account</Label>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Permanently delete your account and all data
                  </div>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={deleting}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your account and remove all your data
                        from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        className="bg-red-600 hover:bg-red-700"
                        disabled={deleting}
                      >
                        {deleting ? "Deleting..." : "Yes, delete my account"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
