import { supabaseAdmin } from './supabase'

export async function uploadLogo(
  file: File,
  brandSlug: string,
  colorVariant: string
): Promise<string> {
  const ext = file.name.split('.').pop()
  const filename = `${Date.now()}-${file.name}`
  const path = `${brandSlug}/${colorVariant}/${filename}`

  const { error } = await supabaseAdmin.storage
    .from('logos')
    .upload(path, file, { upsert: false })

  if (error) throw error

  const { data } = supabaseAdmin.storage
    .from('logos')
    .getPublicUrl(path)

  return data.publicUrl
}