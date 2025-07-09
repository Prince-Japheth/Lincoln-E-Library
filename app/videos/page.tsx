import { createClient } from "@/lib/supabase/server"
import { EmptyVideosIllustration } from "@/components/empty-state-illustrations"

export default async function VideosPage() {
  const supabase = await createClient()
  const { data: videos } = await supabase.from("videos").select("*").order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-background pt-24">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">Video Library</h1>
        {(!videos || videos.length === 0) ? (
          <div className="flex flex-col items-center justify-center py-16">
            <EmptyVideosIllustration />
            <div className="text-muted-foreground text-lg">No videos available yet.</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {videos.map((video) => (
              <div key={video.id} className="bg-card text-card-foreground rounded-lg shadow p-4 flex flex-col items-center">
                <div className="w-full aspect-video mb-3">
                  <VideoEmbed url={video.link} />
                </div>
                <div className="font-semibold text-lg text-center break-words">{video.title}</div>
              </div>
            ))}
          </div>
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