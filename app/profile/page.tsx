"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import AppHeader from "@/components/app-header"
import { useSupabaseUser } from "@/hooks/use-supabase-user"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Save, User, Phone, MapPin, Calendar, Loader } from "lucide-react"
import { formatDate } from "@/lib/utils"

type UserProfile = {
  id?: string
  user_id: string
  full_name?: string
  phone_number?: string
  profile_picture_url?: string
  bio?: string
  date_of_birth?: string
  location?: string
}

export default function ProfilePage() {
  const { user } = useSupabaseUser()
  const supabase = getSupabaseClient()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (user) {
      loadProfile()
    }
  }, [user])

  const loadProfile = async () => {
    if (!user) return

    try {
      const response = await fetch(`/api/profile?userId=${user.id}`)
      const data = await response.json()

      setProfile({
        user_id: user.id,
        full_name: data.full_name || user.user_metadata?.full_name || "",
        phone_number: data.phone_number || "",
        profile_picture_url: data.profile_picture_url || "",
        bio: data.bio || "",
        date_of_birth: data.date_of_birth || "",
        location: data.location || "",
        ...data,
      })
    } catch (error) {
      console.error("Error loading profile:", error)
      setProfile({
        user_id: user.id,
        full_name: user.user_metadata?.full_name || "",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!user || !profile) return

    setSaving(true)
    try {
      const { id, user_id, ...updateData } = profile
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) throw new Error("Failed to save profile")

      const updatedProfile = await response.json()
      setProfile(updatedProfile)
      setIsEditing(false)
    } catch (error) {
      console.error("Error saving profile:", error)
      alert("Failed to save profile. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    if (!profile) return
    setProfile({ ...profile, [field]: value })
  }

  const handleAvatarClick = () => {
    if (isEditing) {
      fileInputRef.current?.click()
    }
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0 || !user) {
      return
    }
    const file = event.target.files[0]
    const filePath = `${user.id}/${Date.now()}-${file.name}`

    setSaving(true)
    const { data, error } = await supabase.storage.from("avatars").upload(filePath, file)
    if (error) {
      alert("Error uploading image. Please try again.")
      console.error(error)
      setSaving(false)
      return
    }

    const { data: publicUrlData } = supabase.storage.from("avatars").getPublicUrl(data.path)
    if (profile) {
      setProfile({ ...profile, profile_picture_url: publicUrlData.publicUrl })
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <AppHeader />
        <main className="mx-auto max-w-3xl px-4 py-10">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-6" />
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-6 mb-6">
                  <div className="h-24 w-24 bg-gray-200 rounded-full" />
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-32" />
                    <div className="h-3 bg-gray-200 rounded w-48" />
                  </div>
                </div>
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-10 bg-gray-200 rounded" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-white">
        <AppHeader />
        <main className="mx-auto max-w-3xl px-4 py-10">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-700">Please log in to view your profile.</p>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <AppHeader />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Profile</h1>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                  {saving ? <Loader className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)} className="bg-blue-600 hover:bg-blue-700">
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar className={`h-24 w-24 ${isEditing ? "cursor-pointer" : ""}`} onClick={handleAvatarClick}>
                  <AvatarImage src={profile.profile_picture_url || ""} alt={profile.full_name} />
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-2xl">
                    {profile.full_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 transition-colors pointer-events-none">
                    <Camera className="h-4 w-4" />
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/png, image/jpeg"
                />
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-600 mb-1">Email</div>
                <div className="font-medium">{user.email}</div>
                <div className="text-sm text-gray-500 mt-1">
                  Member since {formatDate(user.created_at || new Date().toISOString())}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="full_name" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Full Name
                </Label>
                <Input
                  id="full_name"
                  value={profile.full_name || ""}
                  onChange={(e) => handleInputChange("full_name", e.target.value)}
                  disabled={!isEditing}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="phone_number" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone Number
                </Label>
                <Input
                  id="phone_number"
                  value={profile.phone_number || ""}
                  onChange={(e) => handleInputChange("phone_number", e.target.value)}
                  disabled={!isEditing}
                  className="mt-1"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <Label htmlFor="date_of_birth" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Date of Birth
                </Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={profile.date_of_birth || ""}
                  onChange={(e) => handleInputChange("date_of_birth", e.target.value)}
                  disabled={!isEditing}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="location" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Location
                </Label>
                <Input
                  id="location"
                  value={profile.location || ""}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  disabled={!isEditing}
                  className="mt-1"
                  placeholder="City, Country"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={profile.bio || ""}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                disabled={!isEditing}
                className="mt-1"
                rows={4}
                placeholder="Tell us about yourself..."
              />
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
