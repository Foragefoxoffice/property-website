import axios from "axios";

// ✅ Create axios instance
const API = axios.create({
  baseURL: (
    (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) || "https://dev.placetest.in/api/v1"
  ).replace(/\/$/, ""),
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// ✅ Automatically attach JWT token if available
API.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    // Log bulk upload requests
    if (config.url?.includes('bulk-upload')) {
      console.log("📤 Axios Request Config:", {
        url: config.url,
        method: config.method,
        data: config.data,
        dataKeys: config.data ? Object.keys(config.data) : []
      });
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Global response interceptor (optional but useful)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // If 401 and NOT from the login endpoint itself, then redirect
    if (
      error.response &&
      error.response.status === 401 &&
      !error.config.url.includes("/auth/login")
    ) {
      console.warn("Session expired. Please log in again.");
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("userName");
        localStorage.removeItem("userRole");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

/* =========================================================
   🔐 AUTH APIs
========================================================= */
export const loginUser = (data) => API.post("/auth/login", data);
export const registerUser = (data) => API.post("/auth/register", data);
export const userRegisterApi = (data) => API.post("/auth/user-register", data);
export const forgotPassword = (data) => API.post("/auth/forgot-password", data);
export const resetPassword = (data) => API.post("/auth/reset-password", data);
export const getMe = () => API.get("/auth/me");
export const updatePassword = (data) => API.put("/auth/update-password", data);

/* =========================================================
   👤 USER APIs
========================================================= */
export const getAllUsers = () => API.get("/users");
export const getUserById = (id) => API.get(`/users/${id}`);
export const createUser = (data) => API.post("/users", data);
export const updateUser = (id, data) => API.put(`/users/${id}`, data);
export const deleteUser = (id) => API.delete(`/users/${id}`);

/* =========================================================
   🏠 PROPERTY APIs (Project / Community)
========================================================= */
export const getAllProperties = (params) => API.get("/property", { params });
export const createProperty = (data) => API.post("/property", data);
export const updateProperty = (id, data) => API.put(`/property/${id}`, data);
// ❗ FINAL, CORRECT DELETE FUNCTION
export const deleteProjectCommunity = (id) => API.delete(`/property/${id}`);
export const getSingleListingByPropertyID = (id) =>
  API.get(`/create-property/pid/${id}`);

/* =========================================================
   🗺️ ZONE / SUB-AREA APIs
========================================================= */
export const getAllZoneSubAreas = (params) =>
  API.get("/zonesubarea", { params });
export const createZoneSubArea = (data) => API.post("/zonesubarea", data);
export const updateZoneSubArea = (id, data) =>
  API.put(`/zonesubarea/${id}`, data);
export const deleteZoneSubArea = (id) => API.delete(`/zonesubarea/${id}`);

/* =========================================================
   🏢 PROPERTY TYPE APIs
========================================================= */
export const getAllPropertyTypes = (params) =>
  API.get("/propertytype", { params });
export const createPropertyType = (data) => API.post("/propertytype", data);
export const updatePropertyType = (id, data) =>
  API.put(`/propertytype/${id}`, data);
export const deletePropertyType = (id) => API.delete(`/propertytype/${id}`);

/* =========================================================
   📊 AVAILABILITY STATUS APIs
========================================================= */
export const getAllAvailabilityStatuses = (params) =>
  API.get("/availabilitystatus", { params });
export const createAvailabilityStatus = (data) =>
  API.post("/availabilitystatus", data);
export const updateAvailabilityStatus = (id, data) =>
  API.put(`/availabilitystatus/${id}`, data);
export const deleteAvailabilityStatus = (id) =>
  API.delete(`/availabilitystatus/${id}`);

/* =========================================================
   ⚙️ UNIT APIs
========================================================= */
export const getAllUnits = (params) => API.get("/unit", { params });
export const createUnit = (data) => API.post("/unit", data);
export const updateUnit = (id, data) => API.put(`/unit/${id}`, data);
export const deleteUnit = (id) => API.delete(`/unit/${id}`);
export const markUnitAsDefault = (id) => API.put(`/unit/${id}/default`);

/* =========================================================
   🪑 FURNISHING APIs
========================================================= */
export const getAllFurnishings = (params) => API.get("/furnishing", { params });
export const createFurnishing = (data) => API.post("/furnishing", data);
export const updateFurnishing = (id, data) =>
  API.put(`/furnishing/${id}`, data);
export const deleteFurnishing = (id) => API.delete(`/furnishing/${id}`);

/* =========================================================
   🚗 PARKING AVAILABILITY APIs
========================================================= */
export const getAllParkings = (params) => API.get("/parking", { params });
export const createParking = (data) => API.post("/parking", data);
export const updateParking = (id, data) => API.put(`/parking/${id}`, data);
export const deleteParking = (id) => API.delete(`/parking/${id}`);

/* =========================================================
   🐶 PET POLICY APIs
========================================================= */
export const getAllPetPolicies = (params) => API.get("/petpolicy", { params });
export const createPetPolicy = (data) => API.post("/petpolicy", data);
export const updatePetPolicy = (id, data) => API.put(`/petpolicy/${id}`, data);
export const deletePetPolicy = (id) => API.delete(`/petpolicy/${id}`);
export const permanentlyDeleteProperty = (id) =>
  API.delete(`/create-property/permanent-delete/${id}`);

//

/* =========================================================
   💰 DEPOSIT APIs
========================================================= */
export const getAllDeposits = (params) => API.get("/deposit", { params });
export const createDeposit = (data) => API.post("/deposit", data);
export const updateDeposit = (id, data) => API.put(`/deposit/${id}`, data);
export const deleteDeposit = (id) => API.delete(`/deposit/${id}`);

/* =========================================================
   💳 PAYMENT APIs
========================================================= */
export const getAllPayments = (params) => API.get("/payment", { params });
export const createPayment = (data) => API.post("/payment", data);
export const updatePayment = (id, data) => API.put(`/payment/${id}`, data);
export const deletePayment = (id) => API.delete(`/payment/${id}`);

/* =========================================================
   👥 OWNERS / LANDLORDS APIs
========================================================= */
export const getAllOwners = (params) => API.get("/owners", { params });
export const createOwner = (data) => API.post("/owners", data);
export const updateOwner = (id, data) => API.put(`/owners/${id}`, data);
export const deleteOwner = (id) => API.delete(`/owners/${id}`);

/* =========================================================
   👥 STAFFS APIs
========================================================= */
export const getAllStaffs = () => API.get("/staffs");
export const createStaff = (data) => API.post("/staffs", data);
export const updateStaff = (id, data) => API.put(`/staffs/${id}`, data);
export const deleteStaff = (id) => API.delete(`/staffs/${id}`);

/* =========================================================
   💵 CURRENCY APIs
========================================================= */
export const getAllCurrencies = (params) => API.get("/currency", { params });
export const createCurrency = (data) => API.post("/currency", data);
export const updateCurrency = (id, data) => API.put(`/currency/${id}`, data);
export const deleteCurrency = (id) => API.delete(`/currency/${id}`);
export const markCurrencyAsDefault = (id) => API.put(`/currency/${id}/default`);

// ✅ BLOCK APIs
export const getAllBlocks = (params) => API.get("/block", { params });
export const createBlock = (data) => API.post("/block", data);
export const updateBlock = (id, data) => API.put(`/block/${id}`, data);
export const deleteBlock = (id) => API.delete(`/block/${id}`);

/* =========================================================
   📌 FEE / TAX APIs
========================================================= */
export const getAllFeeTax = (params) => API.get("/feetax", { params });
export const createFeeTax = (data) => API.post("/feetax", data);
export const updateFeeTax = (id, data) => API.put(`/feetax/${id}`, data);
export const deleteFeeTax = (id) => API.delete(`/feetax/${id}`);

/* =========================================================
   📄 LEGAL DOCUMENT APIs
========================================================= */
export const getAllLegalDocuments = (params) =>
  API.get("/legaldocument", { params });
export const createLegalDocument = (data) => API.post("/legaldocument", data);
export const updateLegalDocument = (id, data) =>
  API.put(`/legaldocument/${id}`, data);
export const deleteLegalDocument = (id) => API.delete(`/legaldocument/${id}`);

/* =========================================================
   🏢 FLOOR RANGE APIs
========================================================= */
export const getAllFloorRanges = (params) => API.get("/floorrange", { params });
export const createFloorRange = (data) => API.post("/floorrange", data);
export const updateFloorRange = (id, data) =>
  API.put(`/floorrange/${id}`, data);
export const deleteFloorRange = (id) => API.delete(`/floorrange/${id}`);

export const createPropertyListing = (data) => {
  console.log(
    "🔍 Creating Property via:",
    API.defaults.baseURL + "/create-property"
  );
  return API.post("/create-property", data);
};
export const getAllPropertyListings = (params) =>
  API.get("/create-property", { params });
export const getSingleProperty = (id) =>
  API.get(`/create-property/${id}`);
export const updatePropertyListing = (id, data) =>
  API.put(`/create-property/${id}`, data);
export const deletePropertyListing = (id) =>
  API.delete(`/create-property/${id}`);
export const getNextPropertyId = (transactionType) =>
  API.get(`/create-property/next-id`, {
    params: { transactionType },
  });
export const validatePropertyNo = (data) =>
  API.post("/create-property/validate-property-no", data);

/* =========================================================
   📋 COPY PROPERTY APIs
========================================================= */
export const copyPropertyToSale = (id) =>
  API.post(`/create-property/copy/sale/${id}`);

export const copyPropertyToLease = (id) =>
  API.post(`/create-property/copy/lease/${id}`);

export const copyPropertyToHomeStay = (id) =>
  API.post(`/create-property/copy/homestay/${id}`);
export const restoreProperty = (id) =>
  API.put(`/create-property/restore/${id}`);



// NEW — Get by Transaction Type + Pagination
export const getPropertiesByTransactionType = (params) =>
  API.get("/create-property/transaction", { params });

export const getTrashProperties = (params) =>
  API.get("/create-property/trash", { params });

// NEW — Optimized Listing Page API with Filters
export const getListingProperties = (params) =>
  API.get("/create-property/listing", { params });

/* =========================================================
   📤 BULK UPLOAD APIs
========================================================= */
export const bulkUploadProperties = (csvData, transactionType, validateOnly = false) => {
  console.log("🎯 bulkUploadProperties called with:");
  console.log("   - csvData (length):", csvData?.length);
  console.log("   - transactionType:", transactionType);
  console.log("   - validateOnly:", validateOnly);
  console.log("   - Payload being sent:", { csvData: csvData?.substring(0, 30) + "...", transactionType, validateOnly });

  return API.post("/create-property/bulk-upload", { csvData, transactionType, validateOnly });
};

/* =========================================================
   📤 PROPERTY MEDIA UPLOAD API
   Upload images, videos, and floor plans to server
========================================================= */
export const uploadPropertyMedia = (file, type) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("type", type); // 'image', 'video', or 'floor'

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  // Ensure we strip trailing slash if present
  const envURL = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL)
    ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "")
    : null;
  const baseURL = envURL || "https://dev.placetest.in/api/v1";

  console.log("🚀 Uploading Media...");
  console.log("📍 Target URL:", `${baseURL}/upload/property-media`);
  console.log("🌐 Env NEXT_PUBLIC_API_URL:", typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : 'N/A');

  return axios.post(`${baseURL}/upload/property-media`, formData, {
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
      "Content-Type": "multipart/form-data",
    },
    withCredentials: true,
  });
};


/* =========================================================
   🏠 HOME BANNER CMS APIs
========================================================= */
export const getAllHomeBanners = (params) => API.get("/home-banner", { params });
export const getHomeBannerById = (id) => API.get(`/home-banner/${id}`);
export const createHomeBanner = (data) => API.post("/home-banner", data);
export const updateHomeBanner = (id, data) => API.put(`/home-banner/${id}`, data);
export const deleteHomeBanner = (id) => API.delete(`/home-banner/${id}`);
export const getActiveHomeBanner = () => API.get("/home-banner/active");
export const uploadBannerImage = (file) => {
  const formData = new FormData();
  formData.append("backgroundImage", file);

  // Use plain axios to avoid Content-Type conflicts
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const baseURL = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) || "https://dev.placetest.in/api/v1";

  return axios.post(`${baseURL}/home-banner/upload`, formData, {
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
    },
    withCredentials: true,
  });
};

/* =========================================================
   🏠 HOME PAGE CMS APIs
========================================================= */
export const getHomePage = () => API.get("/home-page");
export const createHomePage = (data) => API.post("/home-page", data);
export const updateHomePage = (id, data) => API.put(`/home-page/${id}`, data);
export const uploadHomePageImage = (file) => {
  const formData = new FormData();
  formData.append("image", file);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const baseURL = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) || "https://dev.placetest.in/api/v1";

  return axios.post(`${baseURL}/home-page/upload`, formData, {
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
    },
    withCredentials: true,
  });
};



/* =========================================================
   📄 ABOUT PAGE CMS APIs
========================================================= */
export const getAboutPage = () => API.get("/about-page");
export const createAboutPage = (data) => API.post("/about-page", data);
export const updateAboutPage = (id, data) => API.put(`/about-page/${id}`, data);
export const uploadAboutPageImage = (file) => {
  const formData = new FormData();
  formData.append("image", file);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const baseURL = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) || "https://dev.placetest.in/api/v1";

  return axios.post(`${baseURL}/about-page/upload`, formData, {
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
    },
    withCredentials: true,
  });
};

/* =========================================================
   📞 CONTACT PAGE CMS APIs
========================================================= */
export const getContactPage = () => API.get("/contact-page");
export const createContactPage = (data) => API.post("/contact-page", data);
export const updateContactPage = (id, data) => API.put(`/contact-page/${id}`, data);
export const uploadContactPageImage = (file) => {
  const formData = new FormData();
  formData.append("image", file);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const baseURL = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) || "https://dev.placetest.in/api/v1";

  return axios.post(`${baseURL}/contact-page/upload`, formData, {
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
    },
    withCredentials: true,
  });
};

/* =========================================================
   📝 BLOG CMS APIs
   ========================================================= */
export const getBlogs = () => API.get("/blogs"); // Public
export const getBlogBySlug = (slug) => API.get(`/blogs/${slug}`); // Public
export const getAdminBlogs = () => API.get("/blogs/admin/all"); // Admin
export const getBlogById = (id) => API.get(`/blogs/admin/${id}`); // Admin
export const createBlog = (data) => API.post("/blogs", data);
export const updateBlog = (id, data) => API.put(`/blogs/${id}`, data);
export const deleteBlog = (id) => API.delete(`/blogs/${id}`);

// Blog Page CMS APIs
export const getBlogPage = () => API.get("/blog-page");
export const createBlogPage = (data) => API.post("/blog-page", data);
export const updateBlogPage = (id, data) => API.put(`/blog-page/${id}`, data);

// Category API
export const getCategories = () => API.get("/categories");
export const getCategory = (id) => API.get(`/categories/${id}`);
export const createCategory = (data) => API.post("/categories", data);
export const updateCategory = (id, data) => API.put(`/categories/${id}`, data);
export const deleteCategory = (id) => API.delete(`/categories/${id}`);

export const uploadBlogImage = (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const baseURL = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) || "https://dev.placetest.in/api/v1";

  return axios.post(`${baseURL}/upload`, formData, {
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
    },
    withCredentials: true,
  });
};

/* =========================================================
   🎯 HEADER CMS APIs
========================================================= */
export const getHeader = () => API.get("/header/get-header");
export const updateHeader = (data) => API.put("/header/update-header", data);
export const uploadHeaderImage = (file) => {
  const formData = new FormData();
  formData.append("image", file);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const baseURL = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) || "https://dev.placetest.in/api/v1";

  return axios.post(`${baseURL}/header/upload`, formData, {
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
    },
    withCredentials: true,
  });
};

/* =========================================================
   🦶 FOOTER CMS APIs
========================================================= */
export const getFooter = () => API.get("/footer/get-footer");
export const updateFooter = (data) => API.put("/footer/update-footer", data);
export const uploadFooterImage = (file) => {
  const formData = new FormData();
  formData.append("image", file);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const baseURL = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) || "https://dev.placetest.in/api/v1";

  return axios.post(`${baseURL}/footer/upload`, formData, {
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
    },
    withCredentials: true,
  });
};

/* =========================================================
   👤 AGENT CMS APIs
========================================================= */
export const getAgent = () => API.get("/agent/get-agent");
export const updateAgent = (data) => API.put("/agent/update-agent", data);
export const uploadAgentImage = (file) => {
  const formData = new FormData();
  formData.append("image", file);

  const token = localStorage.getItem("token");
  const baseURL = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) || "https://dev.placetest.in/api/v1";

  return axios.post(`${baseURL}/agent/upload`, formData, {
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
    },
    withCredentials: true,
  });
};

/* =========================================================
   🛡️ ROLE MANAGEMENT APIs
========================================================= */
export const getRoles = () => API.get("/roles");
export const getRoleById = (id) => API.get(`/roles/${id}`);
export const createRole = (data) => API.post("/roles", data);
export const updateRole = (id, data) => API.put(`/roles/${id}`, data);
export const deleteRole = (id) => API.delete(`/roles/${id}`);

/* =========================================================
   📧 SUBSCRIPTION APIs
========================================================= */
export const createSubscription = (data) => API.post("/subscription", data);
export const getSubscriptions = () => API.get("/subscription");
export const deleteSubscription = (id) => API.delete(`/subscription/${id}`);

/* =========================================================
   🔔 NOTIFICATION SETTINGS APIs
========================================================= */
export const getNotificationSettings = () => API.get("/notification-settings");
export const updateNotificationSettings = (data) => API.put("/notification-settings", data);


/* =========================================================
   ✨ EXPORT DEFAULT
========================================================= */
/* =========================================================
   ❤️ FAVORITES APIs
========================================================= */
export const addFavorite = (data, message = "") => API.post("/favorites/add", {
  propertyIds: Array.isArray(data) ? data : [data],
  message
});
export const removeFavorite = (propertyId) => API.delete(`/favorites/remove/${propertyId}`);
export const getFavorites = () => API.get("/favorites");
export const getAllEnquiries = () => API.get("/favorites/admin/all");
export const markEnquiryAsRead = (id, isRead) => API.put(`/favorites/admin/mark-read/${id}`, { isRead });
export const deleteEnquiry = (id) => API.delete(`/favorites/admin/delete/${id}`);
export const bulkDeleteEnquiries = (ids) => API.delete("/favorites/admin/bulk-delete", { data: { ids } });

/* =========================================================
   📜 TERMS CONDITIONS PAGE CMS APIs
   ========================================================= */
export const getTermsConditionsPage = () => API.get("/terms-conditions-page");
export const updateTermsConditionsPage = (data) => API.post("/terms-conditions-page", data);
export const uploadTermsConditionsPageImage = (file) => {
  const formData = new FormData();
  formData.append("image", file);

  const token = localStorage.getItem("token");
  const baseURL = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) || "https://dev.placetest.in/api/v1";

  return axios.post(`${baseURL}/terms-conditions-page/upload-image`, formData, {
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
    },
    withCredentials: true,
  });
};

/* =========================================================
   🔒 PRIVACY POLICY PAGE CMS APIs
   ========================================================= */
export const getPrivacyPolicyPage = () => API.get("/privacy-policy-page");
export const updatePrivacyPolicyPage = (data) => API.post("/privacy-policy-page", data);
export const uploadPrivacyPolicyPageImage = (file) => {
  const formData = new FormData();
  formData.append("image", file);

  const token = localStorage.getItem("token");
  const baseURL = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) || "https://dev.placetest.in/api/v1";

  return axios.post(`${baseURL}/privacy-policy-page/upload-image`, formData, {
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
    },
    withCredentials: true,
  });
};

/* =========================================================
   🌟 TESTIMONIAL APIs
========================================================= */
export const getAdminTestimonials = () => API.get("/testimonials/admin");
export const getVisibleTestimonials = () => API.get("/testimonials");
export const createTestimonial = (data) => API.post("/testimonials", data);
export const submitTestimonial = (data) => API.post("/testimonials/submit", data);
export const toggleTestimonialVisibility = (id) => API.put(`/testimonials/${id}/visibility`);
export const deleteTestimonial = (id) => API.delete(`/testimonials/${id}`);
export const uploadTestimonialImage = (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const token = localStorage.getItem("token");
  const baseURL = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) || "https://dev.placetest.in/api/v1";

  return axios.post(`${baseURL}/upload`, formData, {
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
    },
    withCredentials: true,
  });
};


export default API;

