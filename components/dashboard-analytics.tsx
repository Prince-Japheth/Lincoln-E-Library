"use client"

import { useState, useEffect, forwardRef, useImperativeHandle } from "react"
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
  Activity,
  Info,
  HelpCircle
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

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
    totalReadingTimeMinutes: number
    averageReadingTimeMinutes: number
  }
}

interface DashboardAnalyticsProps {
  userRole: string
}

const DashboardAnalytics = forwardRef(function DashboardAnalytics({ userRole }: DashboardAnalyticsProps, ref) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("7d")
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createClient()

  useImperativeHandle(ref, () => ({
    refresh: () => loadAnalytics()
  }))

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
      .select(`*, user_profiles: user_id (full_name, email)`)
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
    console.log('📊 Admin Analytics: Loading reading data...')
    
    const { data: reads } = await supabase
      .from("reading_progress")
      .select("progress_percentage, reading_time_minutes, books(genre)")

    console.log('📊 Admin Analytics: Retrieved reading data:', {
      totalRecords: reads?.length || 0,
      records: reads?.map(read => ({
        progressPercentage: read.progress_percentage,
        readingTimeMinutes: read.reading_time_minutes,
        genre: read.books?.[0]?.genre
      }))
    })

    if (!reads || reads.length === 0) {
      console.log('📊 Admin Analytics: No reading data found')
      return {
        totalReads: 0,
        averageProgress: 0,
        mostReadGenre: "None",
        totalReadingTimeMinutes: 0,
        averageReadingTimeMinutes: 0
      }
    }

    const totalReads = reads.length
    const averageProgress = reads.reduce((sum, read) => sum + (read.progress_percentage || 0), 0) / totalReads
    
    // Calculate total reading time
    const totalReadingTimeMinutes = reads.reduce((sum, read) => sum + (read.reading_time_minutes || 0), 0)
    const averageReadingTimeMinutes = totalReadingTimeMinutes / totalReads

    // Calculate most read genre
    const genreCounts: { [key: string]: number } = {}
    reads.forEach(read => {
      const genre = read.books?.[0]?.genre || "Unknown"
      genreCounts[genre] = (genreCounts[genre] || 0) + 1
    })

    const mostReadGenre = Object.entries(genreCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || "None"

    const result = {
      totalReads,
      averageProgress: Math.round(averageProgress),
      mostReadGenre,
      totalReadingTimeMinutes: Math.round(totalReadingTimeMinutes),
      averageReadingTimeMinutes: Math.round(averageReadingTimeMinutes)
    }

    console.log('📊 Admin Analytics: Calculated reading stats:', result)

    return result
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
    <TooltipProvider>
    <div className="space-y-6">
        {/* Dashboard Header with Description */}
      <div className="flex items-center justify-between">
          <div>
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Monitor library usage, user engagement, and reading patterns across all users
            </p>
          </div>
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

        {/* Key Metrics with Explanations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-medium">Total Books</CardTitle>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Total number of books in the library</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalBooks}</div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="secondary">{analytics.publicBooks} public</Badge>
              <Badge variant="outline">{analytics.privateBooks} private</Badge>
            </div>
              <p className="text-xs text-muted-foreground mt-1">
                Public books are visible to all users, private books require admin approval
              </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Number of registered users in the system</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Registered users
            </p>
              <p className="text-xs text-muted-foreground mt-1">
                Includes students, teachers, and administrators
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-medium">Book Requests</CardTitle>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Books requested by users that need admin approval</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalRequests}</div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="destructive">{analytics.pendingRequests} pending</Badge>
            </div>
              <p className="text-xs text-muted-foreground mt-1">
                Pending requests require your review and approval
              </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-medium">Reading Activity</CardTitle>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Total reading sessions across all users</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.readingStats.totalReads}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.readingStats.averageProgress}% avg progress
            </p>
              <p className="text-xs text-muted-foreground mt-1">
                Each time a user opens a book to read
            </p>
          </CardContent>
        </Card>
      </div>

        {/* Detailed Analytics with Better Explanations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Books */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
                Most Recently Read Books
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Books that have been opened for reading most recently</p>
                  </TooltipContent>
                </Tooltip>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
                {analytics.popularBooks.length > 0 ? (
                  analytics.popularBooks.map((item, index) => (
                <div key={item.book_id} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-muted rounded flex items-center justify-center text-sm font-medium text-foreground">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.books?.title}</p>
                    <p className="text-xs text-muted-foreground">{item.books?.author}</p>
                  </div>
                  <Badge variant="secondary">Recently read</Badge>
                </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No reading activity yet
                  </p>
                )}
            </div>
          </CardContent>
        </Card>

        {/* Reading Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Reading Statistics
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Aggregated reading data across all users</p>
                  </TooltipContent>
                </Tooltip>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                <span className="text-sm">Most Popular Genre</span>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-3 w-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Genre with the most reading sessions</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                <Badge variant="outline">{analytics.readingStats.mostReadGenre}</Badge>
              </div>
                
              <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                <span className="text-sm">Average Reading Progress</span>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-3 w-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Average completion percentage across all reading sessions</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                        className="bg-[#fe0002] h-2 rounded-full"
                      style={{ width: `${analytics.readingStats.averageProgress}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{analytics.readingStats.averageProgress}%</span>
                </div>
              </div>
                
              <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                <span className="text-sm">Total Reading Sessions</span>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-3 w-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Number of times users have opened books to read</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                <span className="text-sm font-medium">{analytics.readingStats.totalReads}</span>
              </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Total Reading Time</span>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-3 w-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Combined reading time across all users</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <span className="text-sm font-medium">{Math.round(analytics.readingStats.totalReadingTimeMinutes / 60)} hours</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Average Session Time</span>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-3 w-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Average time spent per reading session</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <span className="text-sm font-medium">{analytics.readingStats.averageReadingTimeMinutes} minutes</span>
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
                Recent System Activity
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Recent actions performed in the system</p>
                  </TooltipContent>
                </Tooltip>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
                {analytics.recentActivity.length > 0 ? (
                  analytics.recentActivity.map((activity) => {
                    // Parse actor name
                    const actor = activity.user_profiles?.full_name || activity.user_profiles?.email || "Unknown user"
                    // Parse action target
                    let target = ""
                    let changeSummary = ""
                    let newVals = {}
                    let oldVals = {}
                    try {
                      newVals = activity.new_values ? JSON.parse(activity.new_values) : {}
                    } catch {}
                    try {
                      oldVals = activity.old_values ? JSON.parse(activity.old_values) : {}
                    } catch {}
                    // Determine target and change summary
                    if (activity.action.startsWith("edit_")) {
                      // For edits, show what changed
                      const changes = []
                      for (const key in newVals) {
                        if (key === "role" && oldVals[key] !== undefined && newVals[key] !== oldVals[key]) {
                          changes.push(`Role: ${oldVals[key]} → ${newVals[key]}`)
                        } else if (key === "title" && oldVals[key] !== undefined && newVals[key] !== oldVals[key]) {
                          changes.push(`Title: "${oldVals[key]}" → "${newVals[key]}"`)
                        } else if (key === "name" && oldVals[key] !== undefined && newVals[key] !== oldVals[key]) {
                          changes.push(`Name: "${oldVals[key]}" → "${newVals[key]}"`)
                        } else if (key === "email" && oldVals[key] !== undefined && newVals[key] !== oldVals[key]) {
                          changes.push(`Email: ${oldVals[key]} → ${newVals[key]}`)
                        } else if (key === "genre" && oldVals[key] !== undefined && newVals[key] !== oldVals[key]) {
                          changes.push(`Genre: ${oldVals[key]} → ${newVals[key]}`)
                        }
                      }
                      changeSummary = changes.join(", ")
                      if (activity.table_name === "user_profiles") {
                        target = newVals.full_name || oldVals.full_name || newVals.email || oldVals.email || "user"
                      } else if (activity.table_name === "books") {
                        target = newVals.title || oldVals.title || "book"
                      } else if (activity.table_name === "courses") {
                        target = newVals.name || oldVals.name || "course"
                      } else if (activity.table_name === "videos") {
                        target = newVals.title || oldVals.title || "video"
                      }
                    } else if (activity.action.startsWith("add_")) {
                      if (activity.table_name === "user_profiles") {
                        target = newVals.full_name || newVals.email || "user"
                      } else if (activity.table_name === "books") {
                        target = newVals.title || "book"
                      } else if (activity.table_name === "courses") {
                        target = newVals.name || "course"
                      } else if (activity.table_name === "videos") {
                        target = newVals.title || "video"
                      }
                      changeSummary = "Created"
                    } else if (activity.action.startsWith("delete_")) {
                      if (activity.table_name === "user_profiles") {
                        target = oldVals.full_name || oldVals.email || "user"
                      } else if (activity.table_name === "books") {
                        target = oldVals.title || "book"
                      } else if (activity.table_name === "courses") {
                        target = oldVals.name || "course"
                      } else if (activity.table_name === "videos") {
                        target = oldVals.title || "video"
                      }
                      changeSummary = "Deleted"
                    } else if (activity.action === "change_role") {
                      target = newVals.full_name || oldVals.full_name || newVals.email || oldVals.email || "user"
                      changeSummary = `Role changed to ${newVals.role}`
                    } else {
                      target = newVals.title || newVals.name || newVals.full_name || newVals.email || oldVals.title || oldVals.name || oldVals.full_name || oldVals.email || activity.table_name
                    }
                    return (
                      <div key={activity.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">
                            {actor} {activity.action.replace(/_/g, ' ')} {target && `→ ${target}`}
                          </p>
                          {changeSummary && <p className="text-xs text-muted-foreground">{changeSummary}</p>}
                          <p className="text-xs text-muted-foreground">
                            {new Date(activity.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {activity.table_name}
                        </Badge>
                      </div>
                    )
                  })
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No recent activity
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Data Interpretation Guide */}
        <Card className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
              <Info className="h-4 w-4" />
              Understanding Your Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-blue-700 dark:text-blue-200 space-y-2">
              <p><strong>Low numbers?</strong> This is normal for a new system or during initial setup. Data builds up as users engage with the library.</p>
              <p><strong>Reading sessions:</strong> Each time a user opens a book counts as one session, regardless of how long they read.</p>
              <p><strong>Progress tracking:</strong> Shows how far users typically get through books, helping identify engagement patterns.</p>
              <p><strong>Time tracking:</strong> Actual time spent reading, not just page views, giving you real engagement metrics.</p>
            </div>
          </CardContent>
        </Card>
    </div>
    </TooltipProvider>
  )
})

export default DashboardAnalytics 