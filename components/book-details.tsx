import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Download, Eye, ArrowLeft } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface BookDetailsProps {
  book: {
    id: string
    title: string
    author: string
    genre: string
    description: string
    cover_image_url: string
    file_url: string
    is_public: boolean
    courses?: { name: string }
  }
}

export default function BookDetails({ book }: BookDetailsProps) {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <Link href="/student/dashboard" className="inline-flex items-center text-[#fe0002] hover:underline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Library
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Book Cover */}
        <div className="md:col-span-1">
          <Card className="glassmorphism-card overflow-hidden">
            <div className="aspect-[3/4] relative">
              <Image
                src={book.cover_image_url || "/placeholder.svg?height=600&width=450"}
                alt={book.title}
                fill
                className="object-cover"
              />
            </div>
          </Card>
        </div>

        {/* Book Information */}
        <div className="md:col-span-2 space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">{book.title}</h1>
            <p className="text-xl text-muted-foreground mb-4">by {book.author}</p>

            <div className="flex flex-wrap gap-2 mb-6">
              <Badge variant="secondary" className="text-sm">
                {book.genre}
              </Badge>
              {book.courses && (
                <Badge variant="outline" className="text-sm border-[#fe0002] text-[#fe0002]">
                  {book.courses.name}
                </Badge>
              )}
              <Badge variant={book.is_public ? "default" : "secondary"} className="text-sm">
                {book.is_public ? "Public" : "Private"}
              </Badge>
            </div>

            <div className="flex gap-4 mb-6">
              <Button size="lg" className="bg-[#fe0002] hover:bg-[#fe0002]/90" asChild>
                <a href={book.file_url} target="_blank" rel="noopener noreferrer">
                  <Eye className="h-5 w-5 mr-2" />
                  Read Online
                </a>
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="border-[#fe0002] text-[#fe0002] hover:bg-[#fe0002] hover:text-white bg-transparent"
                asChild
              >
                <a href={book.file_url} download>
                  <Download className="h-5 w-5 mr-2" />
                  Download
                </a>
              </Button>
            </div>
          </div>

          <Card className="glassmorphism-card">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-foreground">About this book</h2>
              <p className="text-muted-foreground leading-relaxed">
                {book.description || "No description available for this book."}
              </p>
            </CardContent>
          </Card>

          <Card className="glassmorphism-card">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-foreground">Book Details</h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <dt className="font-medium text-foreground">Author</dt>
                  <dd className="text-muted-foreground">{book.author}</dd>
                </div>
                <div>
                  <dt className="font-medium text-foreground">Genre</dt>
                  <dd className="text-muted-foreground">{book.genre}</dd>
                </div>
                {book.courses && (
                  <div>
                    <dt className="font-medium text-foreground">Course</dt>
                    <dd className="text-muted-foreground">{book.courses.name}</dd>
                  </div>
                )}
                <div>
                  <dt className="font-medium text-foreground">Availability</dt>
                  <dd className="text-muted-foreground">{book.is_public ? "Public" : "Private"}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
