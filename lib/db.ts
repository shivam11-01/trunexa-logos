import { supabase } from './supabase'

export async function getBrands() {
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .order('display_order', { ascending: true })
  if (error) throw error
  return data
}

export async function getLogosByBrand(brandId: string) {
  const { data, error } = await supabase
    .from('logos')
    .select('*')
    .eq('brand_id', brandId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export async function addLogo(logoData: {
  brand_id: string
  name: string
  variant: string
  color: string
  file_type: string
  storage_path: string
  public_url: string
}) {
  const { data, error } = await supabase
    .from('logos')
    .insert([logoData])
    .select()
  if (error) throw error
  return data[0]
}