import axios, { AxiosResponse } from 'axios'

// Client-side Axios instance (use client components only)
const API = axios.create({
  baseURL: (
    process.env.NEXT_PUBLIC_API_URL || 'https://183housingsolutions.com/api/v1'
  ).replace(/\/$/, ''),
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

// Automatically attach JWT token if available
API.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }

      const lang = localStorage.getItem('language') || 'vi'
      config.headers['Accept-Language'] = lang
    }

    // Log bulk upload requests
    if (config.url?.includes('bulk-upload')) {
      console.log('Axios Request Config:', {
        url: config.url,
        method: config.method,
        data: config.data,
        dataKeys: config.data ? Object.keys(config.data) : [],
      })
    }

    return config
  },
  (error) => Promise.reject(error)
)

// Global response interceptor
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // If 401 and NOT from the login endpoint itself, then redirect
    if (
      error.response &&
      error.response.status === 401 &&
      !error.config.url.includes('/auth/login')
    ) {
      console.warn('Session expired. Please log in again.')
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        localStorage.removeItem('userId')
        localStorage.removeItem('userName')
        localStorage.removeItem('userRole')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

/* =========================================================
   AUTH APIs
========================================================= */
export const loginUser = (data: object): Promise<AxiosResponse> => API.post('/auth/login', data)
export const registerUser = (data: object): Promise<AxiosResponse> => API.post('/auth/register', data)
export const userRegisterApi = (data: object): Promise<AxiosResponse> => API.post('/auth/user-register', data)
export const forgotPassword = (data: object): Promise<AxiosResponse> => API.post('/auth/forgot-password', data)
export const resetPassword = (data: object): Promise<AxiosResponse> => API.post('/auth/reset-password', data)
export const getMe = (): Promise<AxiosResponse> => API.get('/auth/me')
export const updatePassword = (data: object): Promise<AxiosResponse> => API.put('/auth/update-password', data)

/* =========================================================
   USER APIs
========================================================= */
export const getAllUsers = (): Promise<AxiosResponse> => API.get('/users')
export const getUserById = (id: string): Promise<AxiosResponse> => API.get(`/users/${id}`)
export const createUser = (data: object): Promise<AxiosResponse> => API.post('/users', data)
export const updateUser = (id: string, data: object): Promise<AxiosResponse> => API.put(`/users/${id}`, data)
export const deleteUser = (id: string): Promise<AxiosResponse> => API.delete(`/users/${id}`)

/* =========================================================
   PROPERTY APIs (Project / Community)
========================================================= */
export const getAllProperties = (params?: object): Promise<AxiosResponse> => API.get('/property', { params })
export const createProperty = (data: object): Promise<AxiosResponse> => API.post('/property', data)
export const updateProperty = (id: string, data: object): Promise<AxiosResponse> => API.put(`/property/${id}`, data)
export const deleteProjectCommunity = (id: string): Promise<AxiosResponse> => API.delete(`/property/${id}`)
export const getSingleListingByPropertyID = (id: string): Promise<AxiosResponse> => API.get(`/create-property/pid/${id}`)

/* =========================================================
   ZONE / SUB-AREA APIs
========================================================= */
export const getAllZoneSubAreas = (params?: object): Promise<AxiosResponse> => API.get('/zonesubarea', { params })
export const createZoneSubArea = (data: object): Promise<AxiosResponse> => API.post('/zonesubarea', data)
export const updateZoneSubArea = (id: string, data: object): Promise<AxiosResponse> => API.put(`/zonesubarea/${id}`, data)
export const deleteZoneSubArea = (id: string): Promise<AxiosResponse> => API.delete(`/zonesubarea/${id}`)

/* =========================================================
   PROPERTY TYPE APIs
========================================================= */
export const getAllPropertyTypes = (params?: object): Promise<AxiosResponse> => API.get('/propertytype', { params })
export const createPropertyType = (data: object): Promise<AxiosResponse> => API.post('/propertytype', data)
export const updatePropertyType = (id: string, data: object): Promise<AxiosResponse> => API.put(`/propertytype/${id}`, data)
export const deletePropertyType = (id: string): Promise<AxiosResponse> => API.delete(`/propertytype/${id}`)

/* =========================================================
   AVAILABILITY STATUS APIs
========================================================= */
export const getAllAvailabilityStatuses = (params?: object): Promise<AxiosResponse> => API.get('/availabilitystatus', { params })
export const createAvailabilityStatus = (data: object): Promise<AxiosResponse> => API.post('/availabilitystatus', data)
export const updateAvailabilityStatus = (id: string, data: object): Promise<AxiosResponse> => API.put(`/availabilitystatus/${id}`, data)
export const deleteAvailabilityStatus = (id: string): Promise<AxiosResponse> => API.delete(`/availabilitystatus/${id}`)

/* =========================================================
   UNIT APIs
========================================================= */
export const getAllUnits = (params?: object): Promise<AxiosResponse> => API.get('/unit', { params })
export const createUnit = (data: object): Promise<AxiosResponse> => API.post('/unit', data)
export const updateUnit = (id: string, data: object): Promise<AxiosResponse> => API.put(`/unit/${id}`, data)
export const deleteUnit = (id: string): Promise<AxiosResponse> => API.delete(`/unit/${id}`)
export const markUnitAsDefault = (id: string): Promise<AxiosResponse> => API.put(`/unit/${id}/default`)

/* =========================================================
   FURNISHING APIs
========================================================= */
export const getAllFurnishings = (params?: object): Promise<AxiosResponse> => API.get('/furnishing', { params })
export const createFurnishing = (data: object): Promise<AxiosResponse> => API.post('/furnishing', data)
export const updateFurnishing = (id: string, data: object): Promise<AxiosResponse> => API.put(`/furnishing/${id}`, data)
export const deleteFurnishing = (id: string): Promise<AxiosResponse> => API.delete(`/furnishing/${id}`)

/* =========================================================
   PARKING AVAILABILITY APIs
========================================================= */
export const getAllParkings = (params?: object): Promise<AxiosResponse> => API.get('/parking', { params })
export const createParking = (data: object): Promise<AxiosResponse> => API.post('/parking', data)
export const updateParking = (id: string, data: object): Promise<AxiosResponse> => API.put(`/parking/${id}`, data)
export const deleteParking = (id: string): Promise<AxiosResponse> => API.delete(`/parking/${id}`)

/* =========================================================
   PET POLICY APIs
========================================================= */
export const getAllPetPolicies = (params?: object): Promise<AxiosResponse> => API.get('/petpolicy', { params })
export const createPetPolicy = (data: object): Promise<AxiosResponse> => API.post('/petpolicy', data)
export const updatePetPolicy = (id: string, data: object): Promise<AxiosResponse> => API.put(`/petpolicy/${id}`, data)
export const deletePetPolicy = (id: string): Promise<AxiosResponse> => API.delete(`/petpolicy/${id}`)
export const permanentlyDeleteProperty = (id: string): Promise<AxiosResponse> => API.delete(`/create-property/permanent-delete/${id}`)

/* =========================================================
   DEPOSIT APIs
========================================================= */
export const getAllDeposits = (params?: object): Promise<AxiosResponse> => API.get('/deposit', { params })
export const createDeposit = (data: object): Promise<AxiosResponse> => API.post('/deposit', data)
export const updateDeposit = (id: string, data: object): Promise<AxiosResponse> => API.put(`/deposit/${id}`, data)
export const deleteDeposit = (id: string): Promise<AxiosResponse> => API.delete(`/deposit/${id}`)

/* =========================================================
   PAYMENT APIs
========================================================= */
export const getAllPayments = (params?: object): Promise<AxiosResponse> => API.get('/payment', { params })
export const createPayment = (data: object): Promise<AxiosResponse> => API.post('/payment', data)
export const updatePayment = (id: string, data: object): Promise<AxiosResponse> => API.put(`/payment/${id}`, data)
export const deletePayment = (id: string): Promise<AxiosResponse> => API.delete(`/payment/${id}`)

/* =========================================================
   OWNERS / LANDLORDS APIs
========================================================= */
export const getAllOwners = (params?: object): Promise<AxiosResponse> => API.get('/owners', { params })
export const createOwner = (data: object): Promise<AxiosResponse> => API.post('/owners', data)
export const updateOwner = (id: string, data: object): Promise<AxiosResponse> => API.put(`/owners/${id}`, data)
export const deleteOwner = (id: string): Promise<AxiosResponse> => API.delete(`/owners/${id}`)

/* =========================================================
   STAFFS APIs
========================================================= */
export const getAllStaffs = (): Promise<AxiosResponse> => API.get('/staffs')
export const createStaff = (data: object): Promise<AxiosResponse> => API.post('/staffs', data)
export const updateStaff = (id: string, data: object): Promise<AxiosResponse> => API.put(`/staffs/${id}`, data)
export const deleteStaff = (id: string): Promise<AxiosResponse> => API.delete(`/staffs/${id}`)

/* =========================================================
   CURRENCY APIs
========================================================= */
export const getAllCurrencies = (params?: object): Promise<AxiosResponse> => API.get('/currency', { params })
export const createCurrency = (data: object): Promise<AxiosResponse> => API.post('/currency', data)
export const updateCurrency = (id: string, data: object): Promise<AxiosResponse> => API.put(`/currency/${id}`, data)
export const deleteCurrency = (id: string): Promise<AxiosResponse> => API.delete(`/currency/${id}`)
export const markCurrencyAsDefault = (id: string): Promise<AxiosResponse> => API.put(`/currency/${id}/default`)

/* =========================================================
   BLOCK APIs
========================================================= */
export const getAllBlocks = (params?: object): Promise<AxiosResponse> => API.get('/block', { params })
export const createBlock = (data: object): Promise<AxiosResponse> => API.post('/block', data)
export const updateBlock = (id: string, data: object): Promise<AxiosResponse> => API.put(`/block/${id}`, data)
export const deleteBlock = (id: string): Promise<AxiosResponse> => API.delete(`/block/${id}`)

/* =========================================================
   FEE / TAX APIs
========================================================= */
export const getAllFeeTax = (params?: object): Promise<AxiosResponse> => API.get('/feetax', { params })
export const createFeeTax = (data: object): Promise<AxiosResponse> => API.post('/feetax', data)
export const updateFeeTax = (id: string, data: object): Promise<AxiosResponse> => API.put(`/feetax/${id}`, data)
export const deleteFeeTax = (id: string): Promise<AxiosResponse> => API.delete(`/feetax/${id}`)

/* =========================================================
   LEGAL DOCUMENT APIs
========================================================= */
export const getAllLegalDocuments = (params?: object): Promise<AxiosResponse> => API.get('/legaldocument', { params })
export const createLegalDocument = (data: object): Promise<AxiosResponse> => API.post('/legaldocument', data)
export const updateLegalDocument = (id: string, data: object): Promise<AxiosResponse> => API.put(`/legaldocument/${id}`, data)
export const deleteLegalDocument = (id: string): Promise<AxiosResponse> => API.delete(`/legaldocument/${id}`)

/* =========================================================
   FLOOR RANGE APIs
========================================================= */
export const getAllFloorRanges = (params?: object): Promise<AxiosResponse> => API.get('/floorrange', { params })
export const createFloorRange = (data: object): Promise<AxiosResponse> => API.post('/floorrange', data)
export const updateFloorRange = (id: string, data: object): Promise<AxiosResponse> => API.put(`/floorrange/${id}`, data)
export const deleteFloorRange = (id: string): Promise<AxiosResponse> => API.delete(`/floorrange/${id}`)

/* =========================================================
   PROPERTY LISTING APIs
========================================================= */
export const createPropertyListing = (data: object | FormData): Promise<AxiosResponse> => {
  console.log('Creating Property via:', API.defaults.baseURL + '/create-property')
  return API.post('/create-property', data)
}
export const getAllPropertyListings = (params?: object): Promise<AxiosResponse> => API.get('/create-property', { params })
export const getSingleProperty = (id: string): Promise<AxiosResponse> => API.get(`/create-property/${id}`)
export const updatePropertyListing = (id: string, data: object | FormData): Promise<AxiosResponse> => API.put(`/create-property/${id}`, data)
export const deletePropertyListing = (id: string): Promise<AxiosResponse> => API.delete(`/create-property/${id}`)
export const getNextPropertyId = (transactionType: string): Promise<AxiosResponse> =>
  API.get('/create-property/next-id', { params: { transactionType } })
export const validatePropertyNo = (data: object): Promise<AxiosResponse> =>
  API.post('/create-property/validate-property-no', data)

/* =========================================================
   COPY PROPERTY APIs
========================================================= */
export const copyPropertyToSale = (id: string): Promise<AxiosResponse> => API.post(`/create-property/copy/sale/${id}`)
export const copyPropertyToLease = (id: string): Promise<AxiosResponse> => API.post(`/create-property/copy/lease/${id}`)
export const copyPropertyToHomeStay = (id: string): Promise<AxiosResponse> => API.post(`/create-property/copy/homestay/${id}`)
export const restoreProperty = (id: string): Promise<AxiosResponse> => API.put(`/create-property/restore/${id}`)

export const getPropertiesByTransactionType = (params?: object): Promise<AxiosResponse> =>
  API.get('/create-property/transaction', { params })
export const getTrashProperties = (params?: object): Promise<AxiosResponse> =>
  API.get('/create-property/trash', { params })
export const getListingProperties = (params?: object): Promise<AxiosResponse> =>
  API.get('/create-property/listing', { params })

/* =========================================================
   BULK UPLOAD APIs
========================================================= */
export const bulkUploadProperties = (
  csvData: string,
  transactionType: string,
  validateOnly = false
): Promise<AxiosResponse> => {
  console.log('bulkUploadProperties called with:')
  console.log('   - csvData (length):', csvData?.length)
  console.log('   - transactionType:', transactionType)
  console.log('   - validateOnly:', validateOnly)
  return API.post('/create-property/bulk-upload', { csvData, transactionType, validateOnly })
}

/* =========================================================
   PROPERTY MEDIA UPLOAD API
========================================================= */
export const uploadPropertyMedia = (file: File, type: string): Promise<AxiosResponse> => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('type', type) // 'image', 'video', or 'floor'

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  const envURL = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '') : null
  const baseURL = envURL || 'https://183housingsolutions.com/api/v1'

  return axios.post(`${baseURL}/upload/property-media`, formData, {
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
      'Content-Type': 'multipart/form-data',
    },
    withCredentials: true,
  })
}

/* =========================================================
   HOME BANNER CMS APIs
========================================================= */
export const getAllHomeBanners = (params?: object): Promise<AxiosResponse> => API.get('/home-banner', { params })
export const getHomeBannerById = (id: string): Promise<AxiosResponse> => API.get(`/home-banner/${id}`)
export const createHomeBanner = (data: object): Promise<AxiosResponse> => API.post('/home-banner', data)
export const updateHomeBanner = (id: string, data: object): Promise<AxiosResponse> => API.put(`/home-banner/${id}`, data)
export const deleteHomeBanner = (id: string): Promise<AxiosResponse> => API.delete(`/home-banner/${id}`)
export const getActiveHomeBanner = (): Promise<AxiosResponse> => API.get('/home-banner/active')
export const uploadBannerImage = (file: File): Promise<AxiosResponse> => {
  const formData = new FormData()
  formData.append('backgroundImage', file)

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  const baseURL = process.env.NEXT_PUBLIC_API_URL || 'https://183housingsolutions.com/api/v1'

  return axios.post(`${baseURL}/home-banner/upload`, formData, {
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
    },
    withCredentials: true,
  })
}

/* =========================================================
   HOME PAGE CMS APIs
========================================================= */
export const getHomePage = (): Promise<AxiosResponse> => API.get('/home-page')
export const createHomePage = (data: object): Promise<AxiosResponse> => API.post('/home-page', data)
export const updateHomePage = (id: string, data: object): Promise<AxiosResponse> => API.put(`/home-page/${id}`, data)
export const uploadHomePageImage = (file: File): Promise<AxiosResponse> => {
  const formData = new FormData()
  formData.append('image', file)

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  const baseURL = process.env.NEXT_PUBLIC_API_URL || 'https://183housingsolutions.com/api/v1'

  return axios.post(`${baseURL}/home-page/upload`, formData, {
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
    },
    withCredentials: true,
  })
}

/* =========================================================
   ABOUT PAGE CMS APIs
========================================================= */
export const getAboutPage = (): Promise<AxiosResponse> => API.get('/about-page')
export const createAboutPage = (data: object): Promise<AxiosResponse> => API.post('/about-page', data)
export const updateAboutPage = (id: string, data: object): Promise<AxiosResponse> => API.put(`/about-page/${id}`, data)
export const uploadAboutPageImage = (file: File): Promise<AxiosResponse> => {
  const formData = new FormData()
  formData.append('image', file)

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  const baseURL = process.env.NEXT_PUBLIC_API_URL || 'https://183housingsolutions.com/api/v1'

  return axios.post(`${baseURL}/about-page/upload`, formData, {
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
    },
    withCredentials: true,
  })
}

/* =========================================================
   CONTACT PAGE CMS APIs
========================================================= */
export const getContactPage = (): Promise<AxiosResponse> => API.get('/contact-page')
export const createContactPage = (data: object): Promise<AxiosResponse> => API.post('/contact-page', data)
export const updateContactPage = (id: string, data: object): Promise<AxiosResponse> => API.put(`/contact-page/${id}`, data)
export const uploadContactPageImage = (file: File): Promise<AxiosResponse> => {
  const formData = new FormData()
  formData.append('image', file)

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  const baseURL = process.env.NEXT_PUBLIC_API_URL || 'https://183housingsolutions.com/api/v1'

  return axios.post(`${baseURL}/contact-page/upload`, formData, {
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
    },
    withCredentials: true,
  })
}

/* =========================================================
   BLOG CMS APIs
========================================================= */
export const getBlogs = (): Promise<AxiosResponse> => API.get('/blogs') // Public
export const getBlogBySlug = (slug: string): Promise<AxiosResponse> => API.get(`/blogs/${slug}`) // Public
export const getAdminBlogs = (): Promise<AxiosResponse> => API.get('/blogs/admin/all') // Admin
export const getBlogById = (id: string): Promise<AxiosResponse> => API.get(`/blogs/admin/${id}`) // Admin
export const createBlog = (data: object): Promise<AxiosResponse> => API.post('/blogs', data)
export const updateBlog = (id: string, data: object): Promise<AxiosResponse> => API.put(`/blogs/${id}`, data)
export const deleteBlog = (id: string): Promise<AxiosResponse> => API.delete(`/blogs/${id}`)

// News Page CMS APIs
export const getBlogPage = (): Promise<AxiosResponse> => API.get('/blog-page')
export const createBlogPage = (data: object): Promise<AxiosResponse> => API.post('/blog-page', data)
export const updateBlogPage = (id: string, data: object): Promise<AxiosResponse> => API.put(`/blog-page/${id}`, data)

// Category API
export const getCategories = (): Promise<AxiosResponse> => API.get('/categories')
export const getCategory = (id: string): Promise<AxiosResponse> => API.get(`/categories/${id}`)
export const createCategory = (data: object): Promise<AxiosResponse> => API.post('/categories', data)
export const updateCategory = (id: string, data: object): Promise<AxiosResponse> => API.put(`/categories/${id}`, data)
export const deleteCategory = (id: string): Promise<AxiosResponse> => API.delete(`/categories/${id}`)

export const uploadBlogImage = (file: File): Promise<AxiosResponse> => {
  const formData = new FormData()
  formData.append('file', file)

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  const baseURL = process.env.NEXT_PUBLIC_API_URL || 'https://183housingsolutions.com/api/v1'

  return axios.post(`${baseURL}/upload`, formData, {
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
    },
    withCredentials: true,
  })
}

export const uploadGeneralImage = (file: File): Promise<AxiosResponse> => {
  const formData = new FormData()
  formData.append('file', file)

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  const baseURL = process.env.NEXT_PUBLIC_API_URL || 'https://183housingsolutions.com/api/v1'

  return axios.post(`${baseURL}/upload`, formData, {
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
    },
    withCredentials: true,
  })
}

/* =========================================================
   HEADER CMS APIs
========================================================= */
export const getHeader = (): Promise<AxiosResponse> => API.get('/header/get-header')
export const updateHeader = (data: object): Promise<AxiosResponse> => API.put('/header/update-header', data)
export const uploadHeaderImage = (file: File): Promise<AxiosResponse> => {
  const formData = new FormData()
  formData.append('image', file)

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  const baseURL = process.env.NEXT_PUBLIC_API_URL || 'https://183housingsolutions.com/api/v1'

  return axios.post(`${baseURL}/header/upload`, formData, {
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
    },
    withCredentials: true,
  })
}

/* =========================================================
   FOOTER CMS APIs
========================================================= */
export const getFooter = (): Promise<AxiosResponse> => API.get('/footer/get-footer')
export const updateFooter = (data: object): Promise<AxiosResponse> => API.put('/footer/update-footer', data)
export const uploadFooterImage = (file: File): Promise<AxiosResponse> => {
  const formData = new FormData()
  formData.append('image', file)

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  const baseURL = process.env.NEXT_PUBLIC_API_URL || 'https://183housingsolutions.com/api/v1'

  return axios.post(`${baseURL}/footer/upload`, formData, {
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
    },
    withCredentials: true,
  })
}

/* =========================================================
   AGENT CMS APIs
========================================================= */
export const getAgent = (): Promise<AxiosResponse> => API.get('/agent/get-agent')
export const updateAgent = (data: object): Promise<AxiosResponse> => API.put('/agent/update-agent', data)
export const uploadAgentImage = (file: File): Promise<AxiosResponse> => {
  const formData = new FormData()
  formData.append('image', file)

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  const baseURL = process.env.NEXT_PUBLIC_API_URL || 'https://183housingsolutions.com/api/v1'

  return axios.post(`${baseURL}/agent/upload`, formData, {
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
    },
    withCredentials: true,
  })
}

/* =========================================================
   ROLE MANAGEMENT APIs
========================================================= */
export const getRoles = (): Promise<AxiosResponse> => API.get('/roles')
export const getRoleById = (id: string): Promise<AxiosResponse> => API.get(`/roles/${id}`)
export const createRole = (data: object): Promise<AxiosResponse> => API.post('/roles', data)
export const updateRole = (id: string, data: object): Promise<AxiosResponse> => API.put(`/roles/${id}`, data)
export const deleteRole = (id: string): Promise<AxiosResponse> => API.delete(`/roles/${id}`)

/* =========================================================
   SUBSCRIPTION APIs
========================================================= */
export const createSubscription = (data: object): Promise<AxiosResponse> => API.post('/subscription', data)
export const getSubscriptions = (): Promise<AxiosResponse> => API.get('/subscription')
export const deleteSubscription = (id: string): Promise<AxiosResponse> => API.delete(`/subscription/${id}`)

/* =========================================================
   NOTIFICATION SETTINGS APIs
========================================================= */
export const getNotificationSettings = (): Promise<AxiosResponse> => API.get('/notification-settings')
export const updateNotificationSettings = (data: object): Promise<AxiosResponse> => API.put('/notification-settings', data)

/* =========================================================
   FAVORITES APIs
========================================================= */
export const addFavorite = (data: string[] | string, message = ''): Promise<AxiosResponse> =>
  API.post('/favorites/add', {
    propertyIds: Array.isArray(data) ? data : [data],
    message,
  })
export const removeFavorite = (propertyId: string): Promise<AxiosResponse> =>
  API.delete(`/favorites/remove/${propertyId}`)
export const getFavorites = (): Promise<AxiosResponse> => API.get('/favorites')
export const getAllEnquiries = (): Promise<AxiosResponse> => API.get('/favorites/admin/all')
export const markEnquiryAsRead = (id: string, isRead: boolean): Promise<AxiosResponse> =>
  API.put(`/favorites/admin/mark-read/${id}`, { isRead })
export const deleteEnquiry = (id: string): Promise<AxiosResponse> =>
  API.delete(`/favorites/admin/delete/${id}`)
export const bulkDeleteEnquiries = (ids: string[]): Promise<AxiosResponse> =>
  API.delete('/favorites/admin/bulk-delete', { data: { ids } })

/* =========================================================
   TERMS CONDITIONS PAGE CMS APIs
========================================================= */
export const getTermsConditionsPage = (): Promise<AxiosResponse> => API.get('/terms-conditions-page')
export const updateTermsConditionsPage = (data: object): Promise<AxiosResponse> =>
  API.post('/terms-conditions-page', data)
export const uploadTermsConditionsPageImage = (file: File): Promise<AxiosResponse> => {
  const formData = new FormData()
  formData.append('image', file)

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  const baseURL = process.env.NEXT_PUBLIC_API_URL || 'https://183housingsolutions.com/api/v1'

  return axios.post(`${baseURL}/terms-conditions-page/upload-image`, formData, {
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
    },
    withCredentials: true,
  })
}

/* =========================================================
   PRIVACY POLICY PAGE CMS APIs
========================================================= */
export const getPrivacyPolicyPage = (): Promise<AxiosResponse> => API.get('/privacy-policy-page')
export const updatePrivacyPolicyPage = (data: object): Promise<AxiosResponse> =>
  API.post('/privacy-policy-page', data)
export const uploadPrivacyPolicyPageImage = (file: File): Promise<AxiosResponse> => {
  const formData = new FormData()
  formData.append('image', file)

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  const baseURL = process.env.NEXT_PUBLIC_API_URL || 'https://183housingsolutions.com/api/v1'

  return axios.post(`${baseURL}/privacy-policy-page/upload-image`, formData, {
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
    },
    withCredentials: true,
  })
}

/* =========================================================
   TESTIMONIAL APIs
========================================================= */
export const getAdminTestimonials = (): Promise<AxiosResponse> => API.get('/testimonials/admin')
export const getVisibleTestimonials = (): Promise<AxiosResponse> => API.get('/testimonials')
export const createTestimonial = (data: object): Promise<AxiosResponse> => API.post('/testimonials', data)
export const submitTestimonial = (data: object): Promise<AxiosResponse> => API.post('/testimonials/submit', data)
export const toggleTestimonialVisibility = (id: string): Promise<AxiosResponse> =>
  API.put(`/testimonials/${id}/visibility`)
export const deleteTestimonial = (id: string): Promise<AxiosResponse> => API.delete(`/testimonials/${id}`)
export const uploadTestimonialImage = (file: File): Promise<AxiosResponse> => {
  const formData = new FormData()
  formData.append('file', file)

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  const baseURL = process.env.NEXT_PUBLIC_API_URL || 'https://183housingsolutions.com/api/v1'

  return axios.post(`${baseURL}/upload`, formData, {
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
    },
    withCredentials: true,
  })
}

/* =========================================================
   PROJECT BANNER CMS APIs
========================================================= */
export const getProjectBanner = (): Promise<AxiosResponse> => API.get('/project-banner')
export const createProjectBanner = (data: object): Promise<AxiosResponse> => API.post('/project-banner', data)
export const updateProjectBanner = (id: string, data: object): Promise<AxiosResponse> =>
  API.put(`/project-banner/${id}`, data)
export const uploadProjectBannerImage = (file: File): Promise<AxiosResponse> => {
  const formData = new FormData()
  formData.append('file', file)

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  const baseURL = process.env.NEXT_PUBLIC_API_URL || 'https://183housingsolutions.com/api/v1'

  return axios.post(`${baseURL}/upload`, formData, {
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
    },
    withCredentials: true,
  })
}

/* =========================================================
   PROJECT INTRO CMS APIs
========================================================= */
export const getProjectIntro = (): Promise<AxiosResponse> => API.get('/project-intro')
export const createProjectIntro = (data: object): Promise<AxiosResponse> => API.post('/project-intro', data)
export const updateProjectIntro = (id: string, data: object): Promise<AxiosResponse> =>
  API.put(`/project-intro/${id}`, data)
export const uploadProjectIntroImage = (file: File): Promise<AxiosResponse> => {
  const formData = new FormData()
  formData.append('file', file)

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  const baseURL = process.env.NEXT_PUBLIC_API_URL || 'https://183housingsolutions.com/api/v1'

  return axios.post(`${baseURL}/upload`, formData, {
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
    },
    withCredentials: true,
  })
}

/* =========================================================
   PROJECT PAGE CMS APIs
========================================================= */
export const getProjectPage = (): Promise<AxiosResponse> => API.get('/project-page')
export const createProjectPage = (data: object): Promise<AxiosResponse> => API.post('/project-page', data)
export const updateProjectPage = (id: string, data: object): Promise<AxiosResponse> =>
  API.put(`/project-page/${id}`, data)

/* =========================================================
   PROJECT MANAGEMENT APIs
========================================================= */
export const getAllProjectsAdmin = (): Promise<AxiosResponse> => API.get('/projects/admin/all')
export const getAllProjects = (): Promise<AxiosResponse> => API.get('/projects')
export const getProjectById = (id: string): Promise<AxiosResponse> => API.get(`/projects/${id}`)
export const createProject = (data: object): Promise<AxiosResponse> => API.post('/projects', data)
export const updateProject = (id: string, data: object): Promise<AxiosResponse> => API.put(`/projects/${id}`, data)
export const deleteProject = (id: string): Promise<AxiosResponse> => API.delete(`/projects/${id}`)

export const getProjectCategories = (): Promise<AxiosResponse> => API.get('/project-categories')
export const getProjectCategory = (id: string): Promise<AxiosResponse> => API.get(`/project-categories/${id}`)
export const createProjectCategory = (data: object): Promise<AxiosResponse> => API.post('/project-categories', data)
export const updateProjectCategory = (id: string, data: object): Promise<AxiosResponse> =>
  API.put(`/project-categories/${id}`, data)
export const deleteProjectCategory = (id: string): Promise<AxiosResponse> =>
  API.delete(`/project-categories/${id}`)

/* =========================================================
   ENQUIRIES APIs (Next.js additions)
========================================================= */
export const getUserEnquiries = (): Promise<AxiosResponse> => API.get('/favorites')
export const createEnquiry = (data: object): Promise<AxiosResponse> => API.post('/favorites/add', data)

export default API
