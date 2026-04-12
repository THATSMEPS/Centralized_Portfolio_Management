import api from "./index";
import { ENDPOINTS } from "./endpoints";

export const getTeamMembers = async (params) => {
    return api.get(ENDPOINTS.TEAM_MEMBERS.BASE, { params: { ...params, activeOnly: "false" } });
};

export const getTeamMemberById = async (id) => {
    return api.get(ENDPOINTS.TEAM_MEMBERS.BY_ID(id));
};

export const createTeamMember = async (formData) => {
    return api.post(ENDPOINTS.TEAM_MEMBERS.BASE, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
};

export const updateTeamMember = async (id, formData) => {
    return api.put(ENDPOINTS.TEAM_MEMBERS.BY_ID(id), formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
};

export const deleteTeamMember = async (id) => {
    return api.delete(ENDPOINTS.TEAM_MEMBERS.BY_ID(id));
};

export const reorderTeamMembers = async (items) => {
    return api.post(ENDPOINTS.TEAM_MEMBERS.REORDER, { items });
};
