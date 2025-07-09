import { createClient } from "@/lib/supabase/client"

export const uploadFile = async (
  file: File,
  bucket: string,
  path: string
): Promise<{ url: string; error: any }> => {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      return { url: '', error }
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(path)

    return { url: publicUrl, error: null }
  } catch (error) {
    return { url: '', error }
  }
}

export const deleteFile = async (
  bucket: string,
  path: string
): Promise<{ error: any }> => {
  const supabase = createClient()
  
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])

    return { error }
  } catch (error) {
    return { error }
  }
}

export const getFileUrl = (bucket: string, path: string): string => {
  const supabase = createClient()
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)
  
  return publicUrl
} 