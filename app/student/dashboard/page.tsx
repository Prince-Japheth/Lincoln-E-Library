import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import StudentDashboard from "@/components/student-dashboard"

export default async function StudentDashboardPage() {
  const supabase = await createClient()

  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Check if user is a student
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single()

  if (!profile || profile.role !== "student") {
    redirect("/admin/dashboard")
  }

  // Get all books (public, private, and draft) for students
  const { data: books } = await supabase
    .from("books")
    .select(`
      *,
      courses(name)
    `)
    .order("created_at", { ascending: false })

  // Get courses for filtering
  const { data: courses } = await supabase.from("courses").select("*").order("name")

  // Get user's book requests
  const { data: bookRequests } = await supabase
    .from("book_requests")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  // Get user's reading statistics from reading_progress table
  const { data: readingProgress } = await supabase
    .from("reading_progress")
    .select(`
      *,
      books(title, genre)
    `)
    .eq("user_id", user.id)
    .order("last_read_at", { ascending: false })

  console.log('📊 Student Dashboard: Retrieved reading progress data:', {
    userId: user.id,
    totalRecords: readingProgress?.length || 0,
    records: readingProgress?.map(rp => ({
      bookTitle: rp.books?.title,
      progressPercentage: rp.progress_percentage,
      readingTimeMinutes: rp.reading_time_minutes,
      lastReadAt: rp.last_read_at
    }))
  })

  // Calculate reading statistics
  const totalBooksRead = readingProgress?.length || 0
  
  // Calculate books read this month
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const booksThisMonth = readingProgress?.filter(progress => {
    const readDate = new Date(progress.last_read_at)
    return readDate.getMonth() === currentMonth && readDate.getFullYear() === currentYear
  }).length || 0

  // Calculate favorite genre
  const genreCounts: { [key: string]: number } = {}
  readingProgress?.forEach(progress => {
    const genre = progress.books?.genre || "Unknown"
    genreCounts[genre] = (genreCounts[genre] || 0) + 1
  })
  const favoriteGenre = Object.entries(genreCounts)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || "None"

  // Calculate total reading time (actual time from database)
  const totalReadingTimeMinutes = readingProgress?.reduce((total, progress) => {
    return total + (progress.reading_time_minutes || 0)
  }, 0) || 0

  const readingStats = {
    totalBooksRead,
    booksThisMonth,
    favoriteGenre,
    totalReadingTime: `${Math.round(totalReadingTimeMinutes / 60)} hours`
  }

  console.log('📊 Student Dashboard: Calculated reading stats:', {
    totalBooksRead,
    booksThisMonth,
    favoriteGenre,
    totalReadingTimeMinutes,
    totalReadingTimeHours: Math.round(totalReadingTimeMinutes / 60)
  })

  return (
    <StudentDashboard 
      books={books || []} 
      courses={courses || []} 
      bookRequests={bookRequests || []}
      readingStats={readingStats}
      user={profile}
    />
  )
} 