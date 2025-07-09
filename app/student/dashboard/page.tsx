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

  // Get user's reading statistics (placeholder for now)
  const readingStats = {
    totalBooksRead: 0,
    booksThisMonth: 0,
    favoriteGenre: "None",
    totalReadingTime: "0 hours"
  }

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