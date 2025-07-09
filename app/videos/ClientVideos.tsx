"use client"
import React, { useState, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Play } from "lucide-react"
import { EmptyVideosIllustration } from "@/components/empty-state-illustrations"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"

export default function ClientVideos({ videos, courses }: { videos: any[], courses: any[] }) {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [filterCourse, setFilterCourse] = useState("all")
  const [courseSearch, setCourseSearch] = useState("")
  const perPage = 9

  // Filter videos by search and course
  const filtered = useMemo(() => {
    return videos.filter(v =>
      v.title.toLowerCase().includes(search.toLowerCase()) &&
      (filterCourse === "all" || v.course_id === filterCourse)
    )
  }, [videos, search, filterCourse])

  // Paginate
  const totalPages = Math.ceil(filtered.length / perPage)
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  // Reset to page 1 on search or filter change
  React.useEffect(() => { setPage(1) }, [search, filterCourse])

  return (
    <div className="min-h-screen bg-background pt-24">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">Video Library</h1>
        <div className="flex flex-row gap-4 mb-8 w-full justify-center items-center">
          <div className="flex-1 min-w-[220px] max-w-md">
            <Input
              type="text"
              placeholder="Search videos..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-12 bg-card text-card-foreground border border-border text-base"
            />
          </div>
          <div className="w-[220px]">
            <Select value={filterCourse} onValueChange={setFilterCourse}>
              <SelectTrigger className="w-full h-12 bg-card text-card-foreground border border-border">
                <SelectValue placeholder="Course" />
              </SelectTrigger>
              <SelectContent className="bg-card text-card-foreground border border-border">
                <div className="p-2">
                  <Input
                    placeholder="Search courses..."
                    value={courseSearch}
                    onChange={e => setCourseSearch(e.target.value)}
                    className="mb-2 h-8 text-sm bg-card text-card-foreground border border-border"
                  />
                </div>
                <SelectItem value="all">All Courses</SelectItem>
                {courses
                  .filter((c: any) => c.name.toLowerCase().includes(courseSearch.toLowerCase()))
                  .map((course: any) => (
                    <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <EmptyVideosIllustration />
            <div className="text-muted-foreground text-lg">No videos found.</div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {paginated.map((video) => (
                <Card key={video.id} className="glassmorphism-card border-0 hover-lift flex flex-col items-center p-4">
                  <div className="w-full aspect-video mb-3 rounded-md overflow-hidden">
                    <VideoEmbed url={video.link} />
                  </div>
                  <div className="font-semibold text-lg text-center break-words">{video.title}</div>
                  {video.course_id && courses.length > 0 && (
                    <div className="text-xs text-muted-foreground mt-1 mb-2">
                      {courses.find((c: any) => c.id === video.course_id)?.name || "Unknown Course"}
                    </div>
                  )}
                  <a
                    href={video.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center px-3 py-1.5 rounded bg-[#fe0002] text-white text-sm font-medium hover:bg-[#fe0002]/90 transition-colors"
                  >
                    <Play className="h-4 w-4 mr-1" /> Watch in New Tab
                  </a>
                </Card>
              ))}
            </div>
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-10">
                <button
                  className="px-4 py-2 rounded bg-muted text-foreground disabled:opacity-50"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </button>
                <span className="text-base font-medium">
                  Page {page} of {totalPages}
                </span>
                <button
                  className="px-4 py-2 rounded bg-muted text-foreground disabled:opacity-50"
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function VideoEmbed({ url }: { url: string }) {
  // Basic YouTube/Vimeo embed detection
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