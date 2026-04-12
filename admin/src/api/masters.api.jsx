/**
 * Masters API Service
 * Handles Categories, AddOns, Groups, Combos
 */
import api from "./index";
import { ENDPOINTS } from "./endpoints";

// --- Categories ---
export const getAllCategories = async (type) => {
    let url = ENDPOINTS.CATEGORIES.BASE;
    if (type) url += `?type=${type}`;
    return api.get(url);
};
export const createCategory = async (data) => api.post(ENDPOINTS.CATEGORIES.BASE, data);
export const updateCategory = async (id, data) => api.put(ENDPOINTS.CATEGORIES.BY_ID(id), data);
export const deleteCategory = async (id) => api.delete(ENDPOINTS.CATEGORIES.BY_ID(id));
export const bulkCreateCategory = async (data) => api.post(ENDPOINTS.CATEGORIES.BULK, data);

// --- Sub Categories ---
export const getAllSubCategories = async (categoryId) => {
    let url = ENDPOINTS.SUB_CATEGORIES.BASE;
    if (categoryId) url += `?categoryId=${categoryId}`;
    return api.get(url);
};
export const createSubCategory = async (data) => api.post(ENDPOINTS.SUB_CATEGORIES.BASE, data);
export const updateSubCategory = async (id, data) => api.put(ENDPOINTS.SUB_CATEGORIES.BY_ID(id), data);
export const deleteSubCategory = async (id) => api.delete(ENDPOINTS.SUB_CATEGORIES.BY_ID(id));
export const bulkCreateSubCategory = async (data) => api.post(ENDPOINTS.SUB_CATEGORIES.BULK, data);

// --- AddOns ---
export const getAllAddOns = async () => api.get(ENDPOINTS.ADDONS.BASE);
export const createAddOn = async (data) => api.post(ENDPOINTS.ADDONS.BASE, data);
export const updateAddOn = async (id, data) => api.put(ENDPOINTS.ADDONS.BY_ID(id), data);
export const deleteAddOn = async (id) => api.delete(ENDPOINTS.ADDONS.BY_ID(id));
export const bulkCreateAddOn = async (data) => api.post(ENDPOINTS.ADDONS.BULK, data);

// --- AddOn Groups ---
export const getAllAddOnGroups = async () => api.get(ENDPOINTS.ADDON_GROUPS.BASE);
export const createAddOnGroup = async (data) => api.post(ENDPOINTS.ADDON_GROUPS.BASE, data);
export const updateAddOnGroup = async (id, data) => api.put(ENDPOINTS.ADDON_GROUPS.BY_ID(id), data);
export const deleteAddOnGroup = async (id) => api.delete(ENDPOINTS.ADDON_GROUPS.BY_ID(id));
export const bulkCreateAddOnGroup = async (data) => api.post(ENDPOINTS.ADDON_GROUPS.BULK, data);

// --- Combos ---
export const getAllCombos = async () => api.get(ENDPOINTS.COMBOS.BASE);
export const createCombo = async (data) => api.post(ENDPOINTS.COMBOS.BASE, data);
export const updateCombo = async (id, data) => api.put(ENDPOINTS.COMBOS.BY_ID(id), data);
export const deleteCombo = async (id) => api.delete(ENDPOINTS.COMBOS.BY_ID(id));
export const bulkCreateCombo = async (data) => api.post(ENDPOINTS.COMBOS.BULK, data);
