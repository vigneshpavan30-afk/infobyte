import { supabase } from './supabaseClient'

export async function getBrandProfile({ userId }) {
  const { data, error } = await supabase
    .from('brand_profiles')
    .select('company_name')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error
  return data ?? null
}

export async function upsertBrandProfile({ userId, companyName }) {
  const { data, error } = await supabase
    .from('brand_profiles')
    .upsert({ user_id: userId, company_name: companyName }, { onConflict: 'user_id' })
    .select('company_name')
    .single()

  if (error) throw error
  return data
}

