"use client"
import AppHeader from "@/components/app-header"
import { useSupabaseUser } from "@/hooks/use-supabase-user"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ProfilePage() {
  const { user } = useSupabaseUser()

  return (
    <div className="min-h-screen bg-white">
      <AppHeader />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent>
            {user ? (
              <div className="space-y-1 text-sm">
                <div>
                  <span className="text-gray-600">Email:</span> {user.email}
                </div>
                <div>
                  <span className="text-gray-600">User ID:</span> {user.id}
                </div>
              </div>
            ) : (
              <div className="text-gray-700">Please log in to view your profile.</div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
