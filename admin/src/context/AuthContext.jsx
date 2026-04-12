import { createContext, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getCompanyById } from "../api/companies.api";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [adminData, setAdminData] = useState(() => {
        try {
            const storedData = localStorage.getItem("adminData");
            return storedData ? JSON.parse(storedData) : null;
        } catch (error) {
            console.error("Error parsing adminData from localStorage", error);
            return null;
        }
    });
    const [loading, setLoading] = useState(false);
    const [role, setRole] = useState(localStorage.getItem("role") || null);
    const [isSuperAdmin, setIsSuperAdmin] = useState(
        localStorage.getItem("isSuperAdmin") === "true" || false
    );

    // Sync isSuperAdmin whenever adminData changes (e.g. after login sets adminData directly)
    useEffect(() => {
        if (adminData && adminData.isSuperAdmin !== undefined) {
            const superAdminFlag = adminData.isSuperAdmin === true;
            setIsSuperAdmin(superAdminFlag);
            localStorage.setItem("isSuperAdmin", superAdminFlag);
        }
    }, [adminData]);

    const navigate = useNavigate();

    const getAdmin = useCallback(async () => {
        const _id = localStorage.getItem("_id");
        const token = localStorage.getItem("token");

        // Don't fetch if no ID or no token (user is logged out)
        if (!_id || !token || _id === "null" || _id === "undefined") {
            setLoading(false);
            setAdminData(null);
            return;
        }

        setLoading(true);
        try {
            // Using getCurrentUser instead of getCompanyById handles both company and employee admins
            const { getCurrentUser } = await import("../api/auth.api");
            const res = await getCurrentUser();
            console.log("Admin/User data fetched successfully", res.data?.data);

            // Handle different API response structures (sometimes it's res.data, sometimes res.data.data)
            const userData = res.data?.data || res.data;
            const actualRole = res.data?.role || userData?.role || localStorage.getItem("role");

            setAdminData(userData);
            setRole(actualRole);
            setIsSuperAdmin(userData?.isSuperAdmin || false);

            // Persist to local storage
            localStorage.setItem("adminData", JSON.stringify(userData));
            if (actualRole) localStorage.setItem("role", actualRole);
            localStorage.setItem("isSuperAdmin", userData?.isSuperAdmin || false);
        } catch (error) {
            console.log("error fetching current user", error);
            // Only navigate to login if we get an auth error
            if (error.response?.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("_id");
                localStorage.removeItem("role");
                localStorage.removeItem("isSuperAdmin");
                localStorage.removeItem("adminData");
                setAdminData(null);
                setIsSuperAdmin(false);
                navigate("/");
            } else if (error.response?.status === 403) {
                console.error("Access forbidden for this user info request");
                // Don't logout on 403, just maybe show an error or use existing data
            }
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            getAdmin();
        }
    }, [getAdmin]);

    return (
        <AuthContext.Provider value={{ adminData, setAdminData, getAdmin, role, setRole, isSuperAdmin, setIsSuperAdmin, loading, setLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export { AuthContext, AuthProvider };
