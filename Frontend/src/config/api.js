const productionApiUrl = "https://resume-check-4qlt.onrender.com"

// Local development uses the local API by default. Set VITE_API_URL when a
// different backend deployment should be used.
export const API_BASE_URL = import.meta.env.VITE_API_URL
  || (import.meta.env.DEV ? "http://localhost:3000" : productionApiUrl)
