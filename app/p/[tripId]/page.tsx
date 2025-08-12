"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import AppHeader from "@/components/app-header"
import { getSupabaseClient } from "@/lib/supabase/client"
import type { Activity, Trip, TripStop } from "@/lib/types"
import InteractiveTimeline from "@/components/interactive-timeline"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { addComment, toggleLike } from "./server-actions"
import { useSupabaseUser } from "@/hooks/use-supabase-user"
import { Heart, MessageCircle, Calendar, MapPin, Send, Loader, User, Clock } from "lucide-react"

type FullData = { trip: Trip; stops: TripStop[]; activities: Activity[] }

type Comment = {
  id: string
  content: string
  created_at: string
  user_id: string
  user_profiles?: {
    full_name: string | null
    profile_picture_url: string | null
  }
}

type Like = {
  id: string
  user_id: string
  created_at: string
}

export default function PublicTripPage({ params }: { params: { tripId: string } }) {
  const supabase = getSupabaseClient()
  const { user } = useSupabaseUser()
  const [data, setData] = useState<FullData | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [likes, setLikes] = useState<Like[]>([])
  const [newComment, setNewComment] = useState("")
  const [loading, setLoading] = useState(true)
  const [submittingComment, setSubmittingComment] = useState(false)
  const [togglingLike, setTogglingLike] = useState(false)

  const isLiked = likes.some((like) => like.user_id === user?.id)

  useEffect(() => {
    const run = async () => {
      setLoading(true)
      try {
        console.log("Loading trip data for ID:", params.tripId)

        const [{ data: t }, { data: s }, { data: a }, { data: l }] = await Promise.all([
          supabase.from("trips").select("*").eq("id", params.tripId).eq("is_public", true).single(),
          supabase.from("trip_stops").select("*").eq("trip_id", params.tripId).order("order_index"),
          supabase.from("activities").select("*").eq("trip_id", params.tripId).order("created_at"),
          supabase.from("trip_likes").select("*").eq("trip_id", params.tripId),
        ])

        console.log("Trip data loaded:", { trip: t, stops: s?.length, activities: a?.length, likes: l?.length })

        if (t) {
          setData({ trip: t, stops: s ?? [], activities: a ?? [] })
          setLikes(l ?? [])

          await loadComments()
        }
      } catch (error) {
        console.error("Error loading trip data:", error)
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [supabase, params.tripId])

  const loadComments = async () => {
    try {
      console.log("Loading comments for trip:", params.tripId)

      // First, get raw comments
      const { data: rawComments, error: commentsError } = await supabase
        .from("trip_comments")
        .select("*")
        .eq("trip_id", params.tripId)
        .order("created_at", { ascending: false })

      console.log("Raw comments query result:", { rawComments, commentsError })

      if (commentsError) {
        console.error("Comments query error:", commentsError)
        return
      }

      if (!rawComments || rawComments.length === 0) {
        console.log("No comments found")
        setComments([])
        return
      }

      // Get user profiles for all comment authors
      const userIds = [...new Set(rawComments.map((c) => c.user_id))]
      console.log("Loading profiles for users:", userIds)

      const { data: profiles, error: profilesError } = await supabase
        .from("user_profiles")
        .select("user_id, full_name, profile_picture_url")
        .in("user_id", userIds)

      console.log("Profiles query result:", { profiles, profilesError })

      // Combine comments with profiles
      const commentsWithProfiles = rawComments.map((comment) => ({
        ...comment,
        user_profiles: profiles?.find((p) => p.user_id === comment.user_id) || null,
      }))

      console.log("Final comments with profiles:", commentsWithProfiles)
      setComments(commentsWithProfiles)
    } catch (error) {
      console.error("Error in loadComments:", error)
    }
  }

  async function handleAddComment() {
    if (!user || !newComment.trim()) return

    setSubmittingComment(true)
    try {
      console.log("Adding comment:", { tripId: params.tripId, userId: user.id, content: newComment.trim() })

      const result = await addComment(params.tripId, user.id, newComment.trim())
      console.log("Add comment result:", result)

      if (result.error) {
        alert(result.error)
      } else {
        await loadComments()
        setNewComment("")
      }
    } catch (error) {
      console.error("Error adding comment:", error)
      alert("Failed to add comment. Please try again.")
    } finally {
      setSubmittingComment(false)
    }
  }

  async function handleToggleLike() {
    if (!user) return alert("Log in to like this trip.")

    setTogglingLike(true)
    try {
      const result = await toggleLike(params.tripId, user.id)
      if (result.error) {
        alert(result.error)
      } else {
        const { data: updatedLikes } = await supabase.from("trip_likes").select("*").eq("trip_id", params.tripId)
        setLikes(updatedLikes ?? [])
      }
    } catch (error) {
      console.error("Error toggling like:", error)
      alert("Failed to update like. Please try again.")
    } finally {
      setTogglingLike(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    return date.toLocaleDateString()
  }

  const getDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffInDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <AppHeader />
        <main className="mx-auto max-w-5xl px-4 py-8">
          <div className="flex items-center justify-center py-20">
            <Loader className="h-8 w-8 text-blue-600 animate-spin" />
          </div>
        </main>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-white">
        <AppHeader />
        <main className="mx-auto max-w-5xl px-4 py-8">
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Trip Not Found</h2>
            <p className="text-gray-600">This trip doesn't exist or is not public.</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <AppHeader />
      <main className="mx-auto max-w-5xl px-4 py-8 space-y-8">
        {/* Trip Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="border-gray-200 overflow-hidden">
            {data.trip.cover_url && (
              <div className="h-64 relative overflow-hidden">
                <img
                  src={data.trip.cover_url || "/placeholder.svg"}
                  alt={data.trip.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-4 left-6 text-white">
                  <Badge className="bg-white/20 text-white border-white/30 mb-2">Public Trip</Badge>
                </div>
              </div>
            )}
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{data.trip.name}</h1>
                  {data.trip.description && (
                    <p className="text-gray-600 mb-4 leading-relaxed">{data.trip.description}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span>
                        {formatDate(data.trip.start_date)} - {formatDate(data.trip.end_date)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-green-600" />
                      <span>{getDuration(data.trip.start_date, data.trip.end_date)}</span>
                    </div>
                    {data.trip.destination && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-red-600" />
                        <span>{data.trip.destination}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleToggleLike}
                    disabled={togglingLike}
                    variant={isLiked ? "default" : "outline"}
                    className={`flex items-center gap-2 ${
                      isLiked ? "bg-red-600 hover:bg-red-700 text-white" : "border-red-300 text-red-600 hover:bg-red-50"
                    }`}
                  >
                    {togglingLike ? (
                      <Loader className="h-4 w-4 animate-spin" />
                    ) : (
                      <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
                    )}
                    {likes.length} {likes.length === 1 ? "Like" : "Likes"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Trip Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                Trip Itinerary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <InteractiveTimeline activities={data.activities} stops={data.stops} />
            </CardContent>
          </Card>
        </motion.div>

        {/* Comments Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-green-600" />
                Comments ({comments.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add Comment Form */}
              {user ? (
                <div className="space-y-3">
                  <Textarea
                    placeholder="Share your thoughts about this trip..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[100px] border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                  <div className="flex justify-end">
                    <Button
                      onClick={handleAddComment}
                      disabled={!newComment.trim() || submittingComment}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {submittingComment ? (
                        <>
                          <Loader className="mr-2 h-4 w-4 animate-spin" />
                          Posting...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Post Comment
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-4">Sign in to leave a comment</p>
                  <Button variant="outline" onClick={() => (window.location.href = "/login")}>
                    Sign In
                  </Button>
                </div>
              )}

              {/* Comments List */}
              {comments.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-lg font-medium mb-2">No comments yet</p>
                  <p>Be the first to share your thoughts about this trip!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment, index) => (
                    <motion.div
                      key={comment.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex gap-3 p-4 bg-gray-50 rounded-lg"
                    >
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarImage src={comment.user_profiles?.profile_picture_url || undefined} />
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          <User className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900">
                            {comment.user_profiles?.full_name || "Anonymous User"}
                          </span>
                          <span className="text-sm text-gray-500">{formatRelativeTime(comment.created_at)}</span>
                        </div>
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Trip Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-center gap-8 text-center">
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-1 text-red-600 mb-1">
                    <Heart className="h-5 w-5" />
                    <span className="text-2xl font-bold">{likes.length}</span>
                  </div>
                  <span className="text-sm text-gray-600">{likes.length === 1 ? "Like" : "Likes"}</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-1 text-green-600 mb-1">
                    <MessageCircle className="h-5 w-5" />
                    <span className="text-2xl font-bold">{comments.length}</span>
                  </div>
                  <span className="text-sm text-gray-600">{comments.length === 1 ? "Comment" : "Comments"}</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-1 text-blue-600 mb-1">
                    <MapPin className="h-5 w-5" />
                    <span className="text-2xl font-bold">{data.activities.length}</span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {data.activities.length === 1 ? "Activity" : "Activities"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}
