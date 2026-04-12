import api from "./index";
import { ENDPOINTS } from "./endpoints";

export const getSiteSettings = async () => {
    return api.get(ENDPOINTS.SITE_SETTINGS.ADMIN);
};

export const updateSiteSettings = async (data) => {
    return api.put(ENDPOINTS.SITE_SETTINGS.BASE, data);
};
