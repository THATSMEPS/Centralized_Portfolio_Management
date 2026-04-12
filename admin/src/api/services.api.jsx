import api from "./index";
import { ENDPOINTS } from "./endpoints";

export const getServices = async (params) => {
    return api.get(ENDPOINTS.SERVICES.BASE, { params: { ...params, activeOnly: "false" } });
};

export const createService = async (data) => {
    return api.post(ENDPOINTS.SERVICES.BASE, data);
};

export const updateService = async (id, data) => {
    return api.put(ENDPOINTS.SERVICES.BY_ID(id), data);
};

export const deleteService = async (id) => {
    return api.delete(ENDPOINTS.SERVICES.BY_ID(id));
};
