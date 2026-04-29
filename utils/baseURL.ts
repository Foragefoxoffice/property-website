export const getBaseURL = () => {
  return typeof window === 'undefined'
    ? 'http://127.0.0.1:5000/api/v1'
    : (process.env.NEXT_PUBLIC_API_URL || 'https://183housingsolutions.com/api/v1')
}

export const getAssetBaseURL = () => {
  return getBaseURL().replace(/\/api\/v1$/, '').replace(/\/$/, '')
}
