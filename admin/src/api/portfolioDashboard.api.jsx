import api from "./index";
import { ENDPOINTS } from "./endpoints";

export const getDashboardAnalytics = async () => {
    return api.get(ENDPOINTS.DASHBOARD.ANALYTICS);
};
