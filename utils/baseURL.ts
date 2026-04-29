export const getBaseURL = () => {
  return process.env.NEXT_PUBLIC_API_URL || 'https://183housingsolutions.com/api/v1'
}

export const getAssetBaseURL = () => {
  return getBaseURL().replace(/\/api\/v1$/, '').replace(/\/$/, '')
}
