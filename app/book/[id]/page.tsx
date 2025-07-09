import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import BookDetails from "@/components/book-details"
import PDFViewer from "@/components/pdf-viewer"
import { BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import OpenInNewTabButton from "@/components/read-online-button"
import { BookDetailsSkeleton, PDFViewerSkeleton } from "@/components/loading-skeleton"

interface BookPageProps {
  params: Promise<{ id: string }>
}

export default async function BookPage({ params }: BookPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: book } = await supabase
    .from("books")
    .select(`
      *,
      courses(name)
    `)
    .eq("id", id)
    .single()

  if (!book) {
    notFound()
  }

  // Check if user is logged in for private books
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!book.is_public && !user) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Access Restricted</h1>
            <p className="text-muted-foreground mb-6">
              This book is only available to registered users. Please sign in to access it.
            </p>
            <a
              href="/auth/login"
              className="inline-flex items-center px-4 py-2 bg-[#fe0002] text-white rounded-md hover:bg-[#fe0002]/90"
            >
              Sign In
            </a>
          </div>
        </main>
      </div>
    )
  }

  // Get user profile for role-based access
  let userRole = "student"
  if (user) {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("user_id", user.id)
      .single()
    userRole = profile?.role || "student"
  }

  // Check if user is admin (admins shouldn't have AI tutor access)
  const showAIButton = user && userRole === "student"

  return (
    <div className="min-h-screen bg-background pt-16">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Book Details Section */}
          <div className="mb-8">
        <BookDetails book={book} />
          </div>

          {/* PDF Viewer Section - Only for authenticated users */}
          {user && (
            <div id="pdf-viewer" className="glassmorphism-card rounded-lg p-6 hidden md:block border border-gray-200 dark:border-gray-700 shadow-none">
              <h2 className="text-2xl font-bold mb-6 text-foreground">Read Book</h2>
              
              {/* Read Online Button */}
              <div className="mb-4">
                <OpenInNewTabButton bookId={book.id} />
              </div>
              
              <PDFViewer
                fileUrl={book.file_url}
                bookId={book.id}
                userId={user.id}
                title={book.title}
              />
            </div>
          )}

          {/* AI Tutor Button - Only for students */}
          {showAIButton && (
            <div className="mt-8 text-center">
              <a
                href={`/student/ai-tutor?book=${encodeURIComponent(book.title)}&author=${encodeURIComponent(book.author)}&genre=${encodeURIComponent(book.genre)}`}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#fe0002] to-[#ff4444] text-white rounded-lg hover:from-[#fe0002]/90 hover:to-[#ff4444]/90 transition-all duration-300"
              >
                <BookOpen className="h-5 w-5 mr-2" />
                Get AI Tutor Help
              </a>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
