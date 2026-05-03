import { getBaseURL } from '../utils/baseURL'

const BASE = getBaseURL().replace(/\/$/, '')

export async function serverGet<T>(path: string, revalidate = 300): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    next: { revalidate },
    headers: { 'Content-Type': 'application/json' },
  })
  if (!res.ok) throw new Error(`Server fetch failed: ${path} — ${res.status}`)
  const json = await res.json()
  return json
}

export const fetchAllProperties = (params?: Record<string, string>) => {
  const qs = params ? '?' + new URLSearchParams(params).toString() : ''
  return serverGet<{ success: boolean; data: unknown[] }>(`/properties${qs}`)
}

export const fetchPropertyById = (id: string) =>
  serverGet<{ success: boolean; data: Record<string, unknown> }>(`/create-property/pid/${encodeURIComponent(id)}`)

export const fetchAllBlogs = () =>
  serverGet<{ success: boolean; data: unknown[] }>('/blogs')

export const fetchBlogPage = () =>
  serverGet<{ success: boolean; data: Record<string, unknown> }>('/blog-page')

export const fetchBlogBySlug = (slug: string) =>
  serverGet<{ success: boolean; data: Record<string, unknown> }>(`/blogs/${slug}`)

export const fetchAllProjects = () =>
  serverGet<{ success: boolean; data: unknown[] }>('/projects')

export const fetchProjectPage = () =>
  serverGet<{ success: boolean; data: Record<string, unknown> }>('/project-page')

export const fetchProjectCategories = () =>
  serverGet<{ success: boolean; data: unknown[] }>('/project-categories')

export const fetchProjectBySlug = (slug: string) =>
  serverGet<{ success: boolean; data: Record<string, unknown> }>(`/projects/${slug}`)

export const fetchHomeCms = () =>
  serverGet<{ success: boolean; data: Record<string, unknown> }>('/home-page')

export const fetchListingProperties = (params?: Record<string, string>) => {
  const qs = params ? '?' + new URLSearchParams(params).toString() : ''
  return serverGet<{ success: boolean; data: unknown[] }>(`/create-property/listing${qs}`)
}

export const fetchAboutCms = () =>
  serverGet<{ success: boolean; data: Record<string, unknown> }>('/about-page')

export const fetchContactCms = () =>
  serverGet<{ success: boolean; data: Record<string, unknown> }>('/contact-page')

export const fetchTermsConditions = () =>
  serverGet<{ success: boolean; data: Record<string, unknown> }>('/terms-conditions-page')

export const fetchPrivacyPolicy = () =>
  serverGet<{ success: boolean; data: Record<string, unknown> }>('/privacy-policy-page')
