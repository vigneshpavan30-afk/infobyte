import { supabase } from './supabaseClient'

export async function getCampaignTitlesByIds({ ids }) {
  if (!ids || ids.length === 0) return new Map()

  const { data, error } = await supabase.from('campaigns').select('id, title').in('id', ids)
  if (error) throw error

  const map = new Map()
  for (const row of data ?? []) map.set(String(row.id), row.title)
  return map
}

export async function listMyCampaigns({ userId }) {
  const { data, error } = await supabase
    .from('campaigns')
    .select('id, title, budget')
    .eq('user_id', userId)
    .order('id', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function createCampaign({ userId, title, budget, description }) {
  const { data, error } = await supabase
    .from('campaigns')
    .insert({
      user_id: userId,
      title,
      budget,
      description,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

