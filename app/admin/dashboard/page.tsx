import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import AdminDashboard from "@/components/admin-dashboard"
import DashboardAnalytics from "@/components/dashboard-analytics"
import { AdminDashboardIllustration } from "@/components/empty-state-illustrations"

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Check if user is admin
  const { data: profile } = await supabase.from("user_profiles").select("role").eq("user_id", user.id).single()

  if (profile?.role !== "admin") {
    redirect("/student/dashboard")
  }

  // Get admin data
  const { data: books } = await supabase
    .from("books")
    .select(`
      *,
      courses(name)
    `)
    .order("created_at", { ascending: false })

  const { data: bookRequests } = await supabase
    .from("book_requests")
    .select(`
      *,
      user_profiles(full_name, email),
      books(title)
    `)
    .order("created_at", { ascending: false })

  const { data: courses } = await supabase.from("courses").select("*").order("name")

  const { data: users } = await supabase.from("user_profiles").select("*").order("created_at", { ascending: false })

  // Get notifications
  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10)

  // Get reading progress data
  const { data: readingProgress } = await supabase
    .from("reading_progress")
    .select(`
      *,
      books(title, genre),
      user_profiles(full_name)
    `)
    .order("last_read_at", { ascending: false })
    .limit(20)

  return (
    <div className="min-h-screen bg-background">
      <main className="pt-20 pb-8">
        <div className="container mx-auto px-6">
          <div className="mb-8 animate-slide-up">
            <div className="glassmorphism-card rounded-3xl px-5">
              <div className="flex flex-col md:flex-row items-center md:items-center gap-6">
                <AdminDashboardIllustration />
                <div className="text-center md:text-left">
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Admin Dashboard</h1>
                  <p className="text-muted-foreground text-lg">
                    Manage books, requests, users, and monitor system analytics from your centralized admin panel.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Analytics Section */}
          <div className="mb-8">
            <DashboardAnalytics userRole="admin" />
          </div>

          <AdminDashboard
            books={books || []}
            bookRequests={bookRequests || []}
            courses={courses || []}
            users={users || []}
          />
        </div>
      </main>
    </div>
  )
} 