export function getPostLoginPath({ role }) {
  if (role === 'brand') return '/brand-dashboard'
  if (role === 'influencer') return '/influencer-dashboard'
  return '/dashboard'
}

