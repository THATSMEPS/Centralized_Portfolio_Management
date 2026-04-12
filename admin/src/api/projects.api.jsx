import api from "./index";
import { ENDPOINTS } from "./endpoints";

export const getProjects = async (params) => {
    return api.get(ENDPOINTS.PROJECTS.BASE, { params: { ...params, activeOnly: "false" } });
};

export const createProject = async (formData) => {
    return api.post(ENDPOINTS.PROJECTS.BASE, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
};

export const updateProject = async (id, formData) => {
    return api.put(ENDPOINTS.PROJECTS.BY_ID(id), formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
};

export const deleteProject = async (id) => {
    return api.delete(ENDPOINTS.PROJECTS.BY_ID(id));
};

export const getProjectFilters = async () => {
    return api.get(ENDPOINTS.PROJECTS.FILTERS);
};
