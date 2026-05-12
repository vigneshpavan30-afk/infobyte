import { supabase } from './supabaseClient'

export async function getInfluencerProfile({ userId }) {
  const { data, error } = await supabase
    .from('influencer_profiles')
    .select('niche, followers, price, platform')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error
  return data ?? null
}

export async function listInfluencerProfiles() {
  const { data, error } = await supabase
    .from('influencer_profiles')
    .select('user_id, niche, followers, price')
    .order('followers', { ascending: false, nullsFirst: false })

  if (error) throw error
  return data ?? []
}

export async function upsertInfluencerProfile({
  userId,
  niche,
  followers,
  price,
  platform,
}) {
  const { data, error } = await supabase
    .from('influencer_profiles')
    .upsert(
      {
        user_id: userId,
        niche,
        followers,
        price,
        platform,
      },
      { onConflict: 'user_id' },
    )
    .select('niche, followers, price, platform')
    .single()

  if (error) throw error
  return data
}

