"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  BookOpen, 
  Users, 
  TrendingUp, 
  Clock, 
  Eye, 
  Download,
  Calendar,
  BarChart3,
  PieChart,
  Activity
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Skeleton } from "@/components/ui/skeleton"

interface AnalyticsData {
  totalBooks: number
  publicBooks: number
  privateBooks: number
  totalUsers: number
  totalRequests: number
  pendingRequests: number
  recentActivity: any[]
  popularBooks: any[]
  readingStats: {
    totalReads: number
    averageProgress: number
    mostReadGenre: string
  }
}

interface DashboardAnalyticsProps {
  userRole: string
}

export default function DashboardAnalytics({ userRole }: DashboardAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("7d")
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createClient()

  useEffect(() => {
    loadAnalytics()
  }, [timeRange])

  const loadAnalytics = async () => {
    setLoading(true)
    setError(null)
    try {
      const [
        booksData,
        usersData,
        requestsData,
        activityData,
        popularBooksData,
        readingData
      ] = await Promise.all([
        loadBooksData(),
        loadUsersData(),
        loadRequestsData(),
        loadActivityData(),
        loadPopularBooksData(),
        loadReadingData()
      ])

      setAnalytics({
        totalBooks: booksData.total,
        publicBooks: booksData.public,
        privateBooks: booksData.private,
        totalUsers: usersData.total,
        totalRequests: requestsData.total,
        pendingRequests: requestsData.pending,
        recentActivity: activityData,
        popularBooks: popularBooksData,
        readingStats: readingData
      })
    } catch (error) {
      console.error("Error loading analytics:", error)
      setError("Failed to load analytics. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  const loadBooksData = async () => {
    const { count: total } = await supabase
      .from("books")
      .select("*", { count: "exact", head: true })

    const { count: publicCount } = await supabase
      .from("books")
      .select("*", { count: "exact", head: true })
      .eq("is_public", true)

    return {
      total: total || 0,
      public: publicCount || 0,
      private: (total || 0) - (publicCount || 0)
    }
  }

  const loadUsersData = async () => {
    const { count } = await supabase
      .from("user_profiles")
      .select("*", { count: "exact", head: true })

    return { total: count || 0 }
  }

  const loadRequestsData = async () => {
    const { count: total } = await supabase
      .from("book_requests")
      .select("*", { count: "exact", head: true })

    const { count: pending } = await supabase
      .from("book_requests")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending")

    return { total: total || 0, pending: pending || 0 }
  }

  const loadActivityData = async () => {
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data } = await supabase
      .from("audit_logs")
      .select("*")
      .gte("created_at", startDate.toISOString())
      .order("created_at", { ascending: false })
      .limit(10)

    return data || []
  }

  const loadPopularBooksData = async () => {
    const { data } = await supabase
      .from("reading_progress")
      .select(`
        book_id,
        books(title, author, cover_image_url)
      `)
      .order("last_read_at", { ascending: false })
      .limit(5)

    return data || []
  }

  const loadReadingData = async () => {
    const { data: reads } = await supabase
      .from("reading_progress")
      .select("progress_percentage, books(genre)")

    if (!reads || reads.length === 0) {
      return {
        totalReads: 0,
        averageProgress: 0,
        mostReadGenre: "None"
      }
    }

    const totalReads = reads.length
    const averageProgress = reads.reduce((sum, read) => sum + (read.progress_percentage || 0), 0) / totalReads

    // Calculate most read genre
    const genreCounts: { [key: string]: number } = {}
    reads.forEach(read => {
      const genre = read.books?.genre || "Unknown"
      genreCounts[genre] = (genreCounts[genre] || 0) + 1
    })

    const mostReadGenre = Object.entries(genreCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || "None"

    return {
      totalReads,
      averageProgress: Math.round(averageProgress),
      mostReadGenre
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Key Metrics Skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-5 w-32 rounded" />
                <Skeleton className="h-5 w-5 rounded" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 rounded mb-2" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <Skeleton className="h-3 w-32 rounded mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
        {/* Detailed Analytics Skeletons */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Most Read Books Skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40 rounded mb-2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="w-8 h-8 rounded" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32 rounded mb-1" />
                      <Skeleton className="h-3 w-24 rounded" />
                    </div>
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          {/* Reading Statistics Skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40 rounded mb-2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-32 rounded" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-40 rounded" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-16 h-2 rounded-full" />
                    <Skeleton className="h-4 w-10 rounded" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-32 rounded" />
                  <Skeleton className="h-4 w-10 rounded" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600 bg-red-50 rounded-lg">
        {error}
      </div>
    )
  }

  if (!analytics) return null

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Books</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalBooks}</div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="secondary">{analytics.publicBooks} public</Badge>
              <Badge variant="outline">{analytics.privateBooks} private</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Registered users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Book Requests</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalRequests}</div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="destructive">{analytics.pendingRequests} pending</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reading Activity</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.readingStats.totalReads}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.readingStats.averageProgress}% avg progress
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Books */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Most Read Books
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.popularBooks.map((item, index) => (
                <div key={item.book_id} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.books?.title}</p>
                    <p className="text-xs text-muted-foreground">{item.books?.author}</p>
                  </div>
                  <Badge variant="secondary">Recently read</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Reading Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Reading Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Most Popular Genre</span>
                <Badge variant="outline">{analytics.readingStats.mostReadGenre}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Average Reading Progress</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${analytics.readingStats.averageProgress}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{analytics.readingStats.averageProgress}%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Total Reading Sessions</span>
                <span className="text-sm font-medium">{analytics.readingStats.totalReads}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      {userRole === "admin" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(activity.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {activity.table_name}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 