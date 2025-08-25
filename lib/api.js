import http from "./http";

const getUserPincode = () => localStorage.getItem("userPincode");

// Homepage
export const getHomepageBrands = (params = {}) =>
  http.get("/homepage/brands", { params: { ...params, pincode: getUserPincode() } });

export const getHomepageCategories = (params = {}) =>
  http.get("/homepage/categories", { params: { ...params, pincode: getUserPincode() } });

export const getHomepageFeaturedProducts = (params = {}) =>
  http.get("/homepage/featured_products", { params: { ...params, pincode: getUserPincode() } });

// Login
export const generateLoginOtp = (payload) => http.post("/login/login_otp", payload);
export const validateLoginOtp = (payload) => http.post("/login/validate_otp", payload);
export const googleLogin = (payload) => http.post("/login/google_login", payload);
export const validateUserToken = () => http.post("/login/validate_user");

// Product
export const getProductInfo = (params) => http.get("/product/product_info", { params });

// User Address
export const getAddresses = () => http.get("/user/address/all");
export const addNewAddress = (payload) => {
    http.post("/user/address/new", payload)};
export const updateAddress = (payload) => http.put("/user/address/new", payload);
export const getStateDistrict = (params = {}) =>
  http.get("/user/address/state_district", { params: { ...params, pincode: getUserPincode() } });

// Virtual Demo Slots
export const getAvailableVirtualSlots = (params) => http.get("/demo/slots/available_vs", { params });


