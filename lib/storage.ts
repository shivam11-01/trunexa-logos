import { supabase } from './supabase'

export async function uploadLogo(
  file: File,
  brandSlug: string,
  colorVariant: string
): Promise<{ publicUrl: string; storagePath: string }> {
  const ext = file.name.split('.').pop()
  const filename = `${Date.now()}-${file.name}`
  const path = `${brandSlug}/${colorVariant}/${filename}`

  const { error } = await supabase.storage
    .from('logos')
    .upload(path, file, { upsert: false })

  if (error) throw error

  const { data } = supabase.storage
    .from('logos')
    .getPublicUrl(path)

  return { publicUrl: data.publicUrl, storagePath: path }
}