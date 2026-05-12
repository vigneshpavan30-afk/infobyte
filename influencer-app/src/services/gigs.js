import { supabase } from './supabaseClient'

export async function listInfluencerGigs({ influencerId }) {
  const { data, error } = await supabase
    .from('gigs')
    .select('id, campaign_id, brand_id, status, created_at')
    .eq('influencer_id', influencerId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function listBrandGigs({ brandId }) {
  const { data, error } = await supabase
    .from('gigs')
    .select('id, campaign_id, influencer_id, status, created_at')
    .eq('brand_id', brandId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function createGig({ brandId, influencerId, campaignId }) {
  const { data, error } = await supabase
    .from('gigs')
    .insert({
      brand_id: brandId,
      influencer_id: influencerId,
      campaign_id: campaignId,
      status: 'pending',
    })
    .select()
    .single()

  if (error) throw error
  return data
}

