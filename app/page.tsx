import { createClient } from "@/lib/supabase/server"
import PublicBookGrid from "@/components/public-book-grid"
import Hero from "@/components/hero"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Lock, Users, Filter, ArrowRight, CheckCircle } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { AnimatedBook, AnimatedLock, AnimatedFilter, AnimatedCap } from "@/components/animated-illustrations"
import { Badge } from "@/components/ui/badge"

export default async function HomePage() {
  const supabase = await createClient()

  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser()
  
  // Get user profile if authenticated
  let profile = null
  if (user) {
    const { data: userProfile } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single()
    profile = userProfile
  }

  // Get public books only - handle both string and boolean values
  let publicBooks = []
  let booksError = null
  
  try {
    const result = await supabase
    .from("books")
    .select(`
      *,
      courses(name)
    `)
      .or('is_public.eq.true,is_public.eq."true"')
    .order("created_at", { ascending: false })
    
    publicBooks = result.data || []
    booksError = result.error
  } catch (error) {
    console.error("Exception fetching public books:", error)
    booksError = error
  }

  if (booksError) {
    console.error("Error fetching public books:", booksError)
  }

  // Get courses for filtering
  const { data: courses } = await supabase.from("courses").select("*").order("name")

  // Get total book count for comparison
  const { count: totalBooks } = await supabase
    .from("books")
    .select("*", { count: "exact", head: true })

  const publicBookCount = publicBooks?.length || 0
  const privateBookCount = (totalBooks || 0) - publicBookCount

  // Debug logging
  // console.log("Public books found:", publicBookCount)
  // console.log("Total books:", totalBooks)
  // console.log("Public books data:", publicBooks?.slice(0, 3)) // Show first 3 for debugging

  const { data: videos } = await supabase.from("videos").select("*").order("created_at", { ascending: false }).limit(3)

  // Limit publicBooks to 12 for homepage
  const limitedBooks = publicBooks.slice(0, 12)
  const showSeeAllBooks = publicBooks.length > 12

  return (
    <div className="min-h-screen bg-background">
      <Hero user={user} />

      <main className="container mx-auto px-4 py-20">
        {user ? (
          // Logged-in user content
          <section className="mb-16 animate-slide-up">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
                <h2 className="text-4xl md:text-5xl font-bold text-foreground">Welcome back, {profile?.full_name || 'Student'}!</h2>
              </div>
              <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                You have access to our complete library. Explore all {totalBooks} books including private and draft content.
              </p>
            </div>

            {/* Quick Access Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              <Card className="glassmorphism-card border-0 hover-lift">
                <CardHeader className="text-center pb-2">
                  <AnimatedBook />
                  <CardTitle className="text-lg">Complete Library</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    Access all {totalBooks} books in our collection
                  </p>
                  <Button asChild className="w-full bg-[#fe0002] hover:bg-[#fe0002]/90">
                    <Link href={profile?.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'}>
                      Go to Dashboard
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="glassmorphism-card border-0 hover-lift">
                <CardHeader className="text-center pb-2">
                  <AnimatedLock />
                  <CardTitle className="text-lg">Private Books</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    {privateBookCount} exclusive books for members
                  </p>
                  <Button asChild variant="outline" className="w-full">
                    <Link href={profile?.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'}>
                      Browse Private
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="glassmorphism-card border-0 hover-lift">
                <CardHeader className="text-center pb-2">
                  <AnimatedCap />
                  <CardTitle className="text-lg">Course-Based Learning</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    Filter by course, genre, and status
                  </p>
                  <Button asChild variant="outline" className="w-full">
                    <Link href={profile?.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'}>
                      Start Filtering
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats */}
            <div className="glassmorphism-card rounded-3xl p-8 max-w-4xl mx-auto text-center">
              <h3 className="text-2xl font-bold text-foreground mb-6">Your Library Access</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="text-3xl font-bold text-[#fe0002]">{publicBookCount}</div>
                  <div className="text-muted-foreground">Public Books</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-[#fe0002]">{privateBookCount}</div>
                  <div className="text-muted-foreground">Private Books</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-[#fe0002]">{totalBooks}</div>
                  <div className="text-muted-foreground">Total Books</div>
                </div>
              </div>
            </div>
          </section>
        ) : (
          // Non-logged-in user content
          <section className="mb-16 animate-slide-up">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">Welcome to Lincoln E-Library</h2>
              <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                Discover our extensive collection of educational resources. Start with our public books below, 
                then <span className="text-[#fe0002] font-semibold">sign up</span> to unlock access to our complete library!
              </p>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <Card className="glassmorphism-card border-0">
                <CardHeader className="text-center pb-2">
                  <AnimatedBook />
                  <CardTitle className="text-lg">Public Access</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-muted-foreground">
                    {publicBookCount} books available to everyone
                  </p>
                </CardContent>
              </Card>

              <Card className="glassmorphism-card border-0">
                <CardHeader className="text-center pb-2">
                  <AnimatedLock />
                  <CardTitle className="text-lg">Premium Library</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-muted-foreground">
                    {privateBookCount} additional books for members
                  </p>
                </CardContent>
              </Card>

              <Card className="glassmorphism-card border-0">
                <CardHeader className="text-center pb-2">
                  <AnimatedCap />
                  <CardTitle className="text-lg">Course Filtering</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Filter books by course name
                  </p>
                </CardContent>
              </Card>

              <Card className="glassmorphism-card border-0">
                <CardHeader className="text-center pb-2">
                  <Users className="h-8 w-8 text-[#fe0002] mx-auto mb-2" />
                  <CardTitle className="text-lg">Student Features</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Request books and track your reading
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Call to Action */}
            <div className="text-center">
              <div className="glassmorphism-card rounded-3xl p-8 max-w-2xl mx-auto">
                <h3 className="text-2xl font-bold text-foreground mb-4">Ready to Access More?</h3>
                <p className="text-muted-foreground mb-6">
                  Sign up as a student to access our complete library, filter books by course, 
                  and request books that aren't currently available.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild className="bg-[#fe0002] hover:bg-[#fe0002]/90">
                    <Link href="/auth/signup">
                      Sign Up as Student
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/auth/login">
                      Already have an account? Sign In
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Public Books Section */}
        <section className="animate-slide-up delay-200">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {user ? 'Public Library Collection' : 'Public Library Collection'}
            </h2>
            <p className="text-lg text-muted-foreground">
              {user 
                ? 'Explore our freely available books. You can access all books from your dashboard.'
                : 'Explore our freely available books. Filter by course to find what you need.'
              }
            </p>
          </div>
          <PublicBookGrid books={limitedBooks} courses={courses || []} />
          {showSeeAllBooks && (
            <div className="text-center mt-8">
              <a href="/student/dashboard" className="inline-block px-6 py-2 bg-[#fe0002] text-white rounded hover:bg-[#fe0002]/90 font-semibold transition">See all books</a>
            </div>
          )}
        </section>

        {videos && videos.length > 0 && (
          <section className="py-16 bg-card">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold mb-6 text-center text-card-foreground">Newest Videos</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-6">
                {videos.map((video) => (
                  <div key={video.id} className="glassmorphism-card border-0 rounded-lg shadow p-4 flex flex-col items-center text-card-foreground">
                    <div className="w-full aspect-video mb-3 rounded-md overflow-hidden">
                      <VideoEmbed url={video.link} />
                    </div>
                    <div className="font-semibold text-lg text-center break-words">{video.title}</div>
                    {video.course_id && courses && courses.length > 0 && (
                      <Badge className="mt-1 mb-2" variant="secondary">
                        {courses.find((c: any) => c.id === video.course_id)?.name || "Unknown Course"}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
              <div className="text-center">
                <a href="/videos" className="inline-block px-6 py-2 bg-[#fe0002] text-white rounded hover:bg-[#fe0002]/90 font-semibold transition">See all videos</a>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  )
}

function VideoEmbed({ url }: { url: string }) {
  let embedUrl = ""
  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/)
    if (match) embedUrl = `https://www.youtube.com/embed/${match[1]}`
  } else if (url.includes("vimeo.com")) {
    const match = url.match(/vimeo\.com\/(\d+)/)
    if (match) embedUrl = `https://player.vimeo.com/video/${match[1]}`
  }
  if (!embedUrl) return <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Watch Video</a>
  return <iframe src={embedUrl} className="w-full h-full rounded" allowFullScreen title="Video" />
}
