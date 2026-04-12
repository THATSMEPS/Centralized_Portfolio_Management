import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const AuthProtected = (props) => {
    const { role, loading } = useContext(AuthContext);
    const userId = localStorage.getItem("_id");
    const token = localStorage.getItem("token");

    // If still fetching user data, you might want to show a spinner
    // For now, only redirect if we definitely don't have a token
    if (!userId || !token) {
        return <Navigate to="/" />;
    }

    // Note: We intentionally do NOT check `props.allowedRoles` here anymore.
    // The backend uses a combination of 'ADMIN' and 'EMPLOYEE' JWT roles, and 
    // fine-grained permissions are managed by `RoleMaster` and enforced primarily
    // by not rendering inaccessible menus in `MenuContext.js`, and natively by 
    // backend 401/403 API responses. Filtering here based on a hardcoded array
    // inadvertently blocks employees who were legitimately granted access via RoleMaster.

    return <>{props.children}</>;
};

export { AuthProtected };
