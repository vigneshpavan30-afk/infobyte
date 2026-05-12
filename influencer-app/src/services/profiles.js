import { supabase } from './supabaseClient'

export async function getProfileRole({ userId }) {
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle()

  if (error) throw error
  return data?.role ?? null
}

export async function upsertProfileRole({ userId, role }) {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ id: userId, role }, { onConflict: 'id' })
    .select()
    .single()

  if (error) throw error
  return data
}

