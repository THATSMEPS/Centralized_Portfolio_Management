import api from "./index";
import { ENDPOINTS } from "./endpoints";

export const getEnquiries = async (params) => {
    return api.get(ENDPOINTS.ENQUIRIES.BASE, { params });
};

export const getEnquiryById = async (id) => {
    return api.get(ENDPOINTS.ENQUIRIES.BY_ID(id));
};

export const updateEnquiry = async (id, data) => {
    return api.put(ENDPOINTS.ENQUIRIES.BY_ID(id), data);
};

export const deleteEnquiry = async (id) => {
    return api.delete(ENDPOINTS.ENQUIRIES.BY_ID(id));
};

export const getEnquiryStats = async () => {
    return api.get(ENDPOINTS.ENQUIRIES.STATS);
};
