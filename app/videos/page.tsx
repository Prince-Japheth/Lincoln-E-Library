import { createClient } from "@/lib/supabase/server"
import { EmptyVideosIllustration } from "@/components/empty-state-illustrations"
import { Card } from "@/components/ui/card"
import { Play } from "lucide-react"
import ClientVideos from "./ClientVideos"

export default async function VideosPage() {
  const supabase = await createClient()
  const { data: videos } = await supabase.from("videos").select("*").order("created_at", { ascending: false })
  return <ClientVideos videos={videos || []} />
} 