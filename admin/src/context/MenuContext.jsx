import { createContext, useEffect, useState, useContext, useCallback } from "react";
import { getCurrentUser } from "../api/auth.api";
import { AuthContext } from "./AuthContext";
import { getMenusByGroups } from "../api/menus.api";
import { getEmployeeRolesByRoleId } from "../api/employeeRoles.api";

const MenuContext = createContext();

// Cache duration in milliseconds (30 minutes)
const CACHE_DURATION = 30 * 60 * 1000;

const MenuProvider = ({ children }) => {
    const { isSuperAdmin: authIsSuperAdmin, adminData, loading: authLoading, role: authRole } = useContext(AuthContext);

    const [menuData, setMenuData] = useState([]);
    // Note: We intentionally start with empty array instead of localStorage
    // to prevent race condition where old admin menus briefly show for employee users

    // Update localStorage whenever menuData changes
    useEffect(() => {
        if (menuData && menuData.length > 0) {
            localStorage.setItem("menuData", JSON.stringify(menuData));
        }
    }, [menuData]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [employeeId, setEmployeeId] = useState(null);
    const [employeeRoleId, setEmployeeRoleId] = useState(null);
    const [isStatusFetched, setIsStatusFetched] = useState(false);
    const [employeeRoles, setEmployeeRoles] = useState(null);
    const [currentPagePermissions, setCurrentPagePermissions] = useState({
        menuId: null,
        read: false,
        write: false,
        delete: false,
        edit: false,
        print: false,
        mail: false
    });

    // Local cache to store menu data
    // Using useRef pattern with useState to persist between renders
    const [menuCache, setMenuCache] = useState({
        adminMenus: null,
        roleMenus: {},
        timestamp: null
    });

    // Check if the current user is an admin (cached and resilient)
    const [lastRoleCheckAt, setLastRoleCheckAt] = useState(0);
    const ROLE_CHECK_COOLDOWN_MS = 60 * 1000; // 60s cooldown to avoid repeated calls

    const checkUserRole = async () => {
        // If auth is still loading, wait
        if (authLoading) return false;

        // Avoid repeated checks in quick succession (protect against rate-limits)
        const now = Date.now();
        if (now - lastRoleCheckAt < ROLE_CHECK_COOLDOWN_MS) {
            // Use existing state if we recently checked
            setIsStatusFetched(true);
            return isAdmin;
        }

        setIsStatusFetched(false);
        try {
            const token = localStorage.getItem("token");
            const userId = localStorage.getItem("_id");

            if (!token || !userId) {
                setLastRoleCheckAt(now);
                return false;
            }

            // If AuthContext has adminData, prefer it (avoids extra API calls)
            if (adminData) {
                console.log("Using AuthContext adminData:", adminData);
                console.log("AuthContext Role:", authRole);
                console.log("AuthContext IsSuperAdmin:", authIsSuperAdmin);

                setIsStatusFetched(true);

                // Determine if user has admin privileges (Admin role, Company role, or SuperAdmin flag)
                const currentRole = (authRole || adminData.role || "").toUpperCase();
                const isAdminRole = currentRole === "ADMIN" || currentRole === "COMPANY" || !!authIsSuperAdmin;

                setIsAdmin(isAdminRole);
                setEmployeeId(adminData._id);
                // If it's a company/admin, they might not have a specific employee role ID, which is fine
                setEmployeeRoleId(adminData.roleId?._id || adminData.roleId || null);

                setLastRoleCheckAt(now);
                return isAdminRole;
            }

            // As a fallback, try the lightweight /auth/me endpoint
            const response = await getCurrentUser();

            if (response.data?.isOk) {
                const userData = response.data.data;
                const userRole = (response.data.role || userData.role || "").toUpperCase();

                console.log("User data from API:", userData);
                console.log("User role from API:", userRole);

                setIsStatusFetched(true);
                const isAdminRole = userRole === "ADMIN" || userRole === "COMPANY" || userData.isSuperAdmin === true;

                setIsAdmin(isAdminRole);
                setEmployeeId(userData._id);
                setEmployeeRoleId(userData.roleId?._id || userData.roleId);

                // Persist superadmin flag if it's present
                if (userData.isSuperAdmin !== undefined) {
                    localStorage.setItem("isSuperAdmin", userData.isSuperAdmin === true);
                }

                setLastRoleCheckAt(now);
                return isAdminRole;
            }

            setLastRoleCheckAt(now);
            return false;
        } catch (error) {
            console.error("Error checking user role:", error);

            // If we're being rate-limited, set a longer cooldown to avoid hammering the API
            const status = error.response?.status;
            if (status === 429) {
                setLastRoleCheckAt(Date.now() + ROLE_CHECK_COOLDOWN_MS);
            } else {
                setLastRoleCheckAt(Date.now());
            }

            // Mark as fetched to avoid repeated immediate retries
            setIsStatusFetched(true);
            return false;
        }
    };

    // Fetch employee roles based on roleId instead of employee ID
    const fetchEmployeeRoles = async (roleId) => {
        try {
            if (!roleId) return null;

            const response = await getEmployeeRolesByRoleId(roleId);

            if (response.data.isOk) {
                setEmployeeRoles(response.data.data[0]);
                return response.data.data[0];
            }

            return null;
        } catch (error) {
            console.error("Error fetching employee roles:", error);
            return null;
        }
    };

    // Helper to check if cache is valid
    const isCacheValid = useCallback(() => {
        if (!menuCache.timestamp) return false;

        const now = Date.now();
        return (now - menuCache.timestamp) < CACHE_DURATION;
    }, [menuCache.timestamp]);

    // Force clear menu cache and local storage on logout/invalidation
    const clearMenuData = useCallback(() => {
        localStorage.removeItem("menuData");
        setMenuData([]);
        setMenuCache({
            adminMenus: null,
            roleMenus: {},
            timestamp: null
        });
    }, []);

    // Invalidate the menu cache (call this when roles are updated)
    const invalidateMenuCache = useCallback(() => {
        setMenuCache({
            adminMenus: null,
            roleMenus: {},
            timestamp: null
        });
    }, []);

    // Helper function to filter menus based on user permissions
    const filterMenusByPermission = useCallback((menuGroups, roles) => {
        if (!Array.isArray(menuGroups) || !Array.isArray(roles)) {
            return [];
        }

        // Filter menu groups
        const filteredGroups = menuGroups.filter(group => {
            // Check if this is a direct link group
            if (group.isLink) {
                // Keep this group only if the user has read permission for it
                return roles.some(role =>
                    role.menuGroupId === group.groupId && role.read
                );
            }

            // For groups with menus, filter their child menus
            const filteredMenus = filterMenuItems(group.menus || [], roles);

            // If group has any visible menus, keep it
            if (filteredMenus.length > 0) {
                group.menus = filteredMenus;
                return true;
            }

            return false;
        });

        return filteredGroups;
    }, []); // No external dependencies

    // Recursive helper function to filter menu items at any nesting level
    // Moved outside or defined inside filterMenusByPermission to avoid dependency cycle
    // But since it's recursive, let's keep it here but memoize it
    const filterMenuItems = (menuItems, roles) => {
        if (!Array.isArray(menuItems) || !Array.isArray(roles)) {
            return [];
        }

        return menuItems.filter(menu => {
            // Check if user has read permission for this menu
            const hasReadPermission = roles.some(role =>
                role.menuId === menu.id && role.read
            );

            // If this item has children, recursively filter them
            if (menu.children && menu.children.length > 0) {
                menu.children = filterMenuItems(menu.children, roles);

                // If item has read permission or any visible children, keep it
                return hasReadPermission || menu.children.length > 0;
            }

            // For leaf nodes, only keep those with read permission
            return hasReadPermission;
        });
    };

    // Update the current page permissions based on menu ID
    const updateCurrentPagePermissions = useCallback((menuId) => {
        if (isAdmin) {
            // Admin has all permissions
            setCurrentPagePermissions({
                menuId,
                read: true,
                write: true,
                delete: true,
                edit: true,
                print: true,
                mail: true
            });
            return;
        }

        if (!employeeRoles || !employeeRoles.roles || !menuId) {
            // Reset permissions if no roles or menu ID
            setCurrentPagePermissions({
                menuId: null,
                read: false,
                write: false,
                delete: false,
                edit: false,
                print: false,
                mail: false
            });
            return;
        }

        // Find the permission for this menu ID
        const menuPermission = employeeRoles.roles.find(role => role.menuId === menuId);

        if (menuPermission) {
            setCurrentPagePermissions({
                menuId,
                read: menuPermission.read || false,
                write: menuPermission.write || false,
                delete: menuPermission.delete || false,
                edit: menuPermission.edit || false,
                print: menuPermission.print || false,
                mail: menuPermission.mail || false
            });
        } else {
            // No specific permissions found for this menu
            setCurrentPagePermissions({
                menuId,
                read: false,
                write: false,
                delete: false,
                edit: false,
                print: false,
                mail: false
            });
        }
    }, [isAdmin, employeeRoles]);

    // Find permissions for a specific menu ID
    const getPermissionsForMenu = useCallback((menuId) => {
        if (isAdmin) {
            // Admin has all permissions
            return {
                menuId,
                read: true,
                write: true,
                delete: true,
                edit: true,
                print: true,
                mail: true
            };
        }

        if (!employeeRoles || !employeeRoles.roles || !menuId) {
            return {
                menuId,
                read: false,
                write: false,
                delete: false,
                edit: false,
                print: false,
                mail: false
            };
        }

        const menuPermission = employeeRoles.roles.find(role => role.menuId === menuId);

        if (menuPermission) {
            return {
                menuId,
                read: menuPermission.read || false,
                write: menuPermission.write || false,
                delete: menuPermission.delete || false,
                edit: menuPermission.edit || false,
                print: menuPermission.print || false,
                mail: menuPermission.mail || false
            };
        }

        return {
            menuId,
            read: false,
            write: false,
            delete: false,
            edit: false,
            print: false,
            mail: false
        };
    }, [isAdmin, employeeRoles]);

    // Find menu ID by URL path
    const findMenuIdByUrl = useCallback((url) => {
        if (!url || !Array.isArray(menuData)) {
            return null;
        }

        // Remove trailing slash and query parameters
        const cleanUrl = url.split('?')[0].replace(/\/+$/, '');

        // Find menu with matching URL in all menu groups
        let foundMenuId = null;

        // First check direct link menu groups
        const directLinkGroup = menuData.find(group =>
            group.isLink && group.url && (group.url === cleanUrl || cleanUrl.endsWith(group.url))
        );

        if (directLinkGroup) {
            return directLinkGroup.groupId;
        }

        // Function to recursively search through menus
        const searchMenus = (menus) => {
            if (!Array.isArray(menus) || foundMenuId) return;

            for (const menu of menus) {
                if (menu.url && (menu.url === cleanUrl || cleanUrl.endsWith(menu.url))) {
                    foundMenuId = menu.id;
                    return;
                }

                // Check children menus
                if (menu.children && menu.children.length > 0) {
                    searchMenus(menu.children);
                }
            }
        };

        // Search through all menu groups
        for (const group of menuData) {
            if (group.menus && group.menus.length > 0) {
                searchMenus(group.menus);
                if (foundMenuId) break;
            }
        }

        return foundMenuId;
    }, [menuData]);

    // Update permissions based on current URL
    const updatePermissionsByCurrentUrl = useCallback(() => {
        // Get current path from window location
        const currentPath = window.location.pathname;

        // Find menu ID for current path
        const menuId = findMenuIdByUrl(currentPath);

        if (menuId) {
            updateCurrentPagePermissions(menuId);
        }
    }, [findMenuIdByUrl, updateCurrentPagePermissions]);

    const fetchMenus = useCallback(async (forceRefresh = false) => {
        // Don't fetch if auth is still loading
        if (authLoading) return;

        try {
            const token = localStorage.getItem("token");

            if (!token) {
                setError("No authentication token found");
                setLoading(false);
                return;
            }

            setLoading(true);

            // First check if user is admin
            const adminStatus = await checkUserRole();

            console.log("Admin status:", adminStatus);
            console.log("EmployeeRoleId in fetchMenus scope:", employeeRoleId);

            // Check if we have valid cached data
            if (!forceRefresh && isCacheValid()) {
                if (adminStatus && menuCache.adminMenus) {
                    console.log("Using cached admin menus");
                    setMenuData(menuCache.adminMenus);
                    setLoading(false);
                    return;
                } else if (!adminStatus && employeeRoleId && menuCache.roleMenus[employeeRoleId]) {
                    console.log(`Using cached menus for role ${employeeRoleId}`);
                    setMenuData(menuCache.roleMenus[employeeRoleId]);
                    setLoading(false);
                    return;
                }
            }

            // Get all menus
            const response = await getMenusByGroups();

            if (response.data.isOk) {
                let menuGroups = response.data.data;

                const now = Date.now();

                // If admin, store menus — but hide developer-only items for non-super-admins
                if (adminStatus) {
                    // Read isSuperAdmin from context OR localStorage (fallback for race condition during login)
                    const isSuper = !!authIsSuperAdmin || localStorage.getItem("isSuperAdmin") === "true";
                    let adminMenuGroups = menuGroups;
                    if (!isSuper) {
                        adminMenuGroups = menuGroups.map(group => {
                            if (!group.menus) return group;
                            const filtered = (group.menus || []).map(menu => {
                                if (menu.children && menu.children.length > 0) {
                                    menu.children = menu.children.filter(child => {
                                        const childUrl = (child.url || "").toLowerCase();
                                        return childUrl !== "/menu-master" && childUrl !== "/menu-group";
                                    });
                                }
                                return menu;
                            }).filter(menu => {
                                const url = (menu.url || "").toLowerCase();
                                return url !== "/menu-master" && url !== "/menu-group";
                            });
                            return { ...group, menus: filtered };
                        }).filter(g => (g.menus && g.menus.length > 0) || g.isLink);
                    }
                    // Inject Merchandise Config if it's not already there
                    const storeGroup = adminMenuGroups.find(g => g.groupName?.toLowerCase().includes("store"));
                    if (storeGroup && !storeGroup.menus.some(m => m.url === "/store-merchandise-manager")) {
                        storeGroup.menus.push({
                            id: "merchandise-config-injected",
                            name: "Merchandise Config",
                            url: "/store-merchandise-manager",
                            sequence: 99,
                            isParent: false,
                            icon: "ri-shopping-bag-3-line"
                        });
                    }

                    setMenuData(adminMenuGroups);

                    setMenuCache(prev => ({
                        ...prev,
                        adminMenus: adminMenuGroups,
                        timestamp: now
                    }));
                }
                // If not admin, filter menus based on employee roles
                else if (employeeRoleId) {
                    console.log("Fetching roles for employeeRoleId:", employeeRoleId);
                    const roles = await fetchEmployeeRoles(employeeRoleId);

                    if (roles && roles.roles) {
                        console.log("Roles fetched:", roles.roles);
                        // Filter menu groups and their menus based on permissions
                        menuGroups = filterMenusByPermission(menuGroups, roles.roles);
                        console.log("Filtered menu groups:", menuGroups);

                        // Cache the filtered menus for this role
                        setMenuData(menuGroups);
                        setMenuCache(prev => ({
                            ...prev,
                            roleMenus: {
                                ...prev.roleMenus,
                                [employeeRoleId]: menuGroups
                            },
                            timestamp: now
                        }));
                    } else {
                        console.warn("No roles found for employee:", roles);
                    }
                } else {
                    console.warn("Skipping employee fetch: employeeRoleId is null/false");
                }

                // Update permissions is called via useEffect on menuData change
            } else {
                setError(response?.data?.message || "Failed to get menu data");
            }
        } catch (error) {
            console.error("Error fetching menus:", error);
            setError(error.message || "Failed to fetch menus");
        } finally {
            setLoading(false);
        }
    }, [authLoading, checkUserRole, isCacheValid, menuCache.adminMenus, menuCache.roleMenus, employeeRoleId, authIsSuperAdmin, fetchEmployeeRoles, filterMenusByPermission]);

    // Re-run checks only when loading finishes or auth state changes
    useEffect(() => {
        if (!authLoading && localStorage.getItem("token")) {
            checkUserRole();
        }
    }, [authLoading, adminData, authRole]);

    // Refetch menus when role ID changes or when loading finishes
    useEffect(() => {
        if (!authLoading && localStorage.getItem("token") && isStatusFetched) {
            fetchMenus();
        }
    }, [employeeRoleId, authLoading, isStatusFetched]);

    // Refetch menus when super-admin status changes (e.g., after login or promotion)
    useEffect(() => {
        if (!authLoading && localStorage.getItem("token") && isStatusFetched) {
            fetchMenus(true);
        }
    }, [authIsSuperAdmin, isStatusFetched, authLoading]);

    // Listen for URL changes to update permissions
    useEffect(() => {
        // Update permissions based on URL when menus are loaded
        if (!loading && menuData.length > 0) {
            updatePermissionsByCurrentUrl();
        }
    }, [loading, menuData]);

    return (
        <MenuContext.Provider value={{
            menuData,
            loading, // This is menu loading state, distinct from authLoading
            error,
            fetchMenus,
            isAdmin,
            employeeRoles,
            invalidateMenuCache,
            currentPagePermissions,
            updateCurrentPagePermissions,
            getPermissionsForMenu,
            findMenuIdByUrl,
            updatePermissionsByCurrentUrl
        }}>
            {children}
        </MenuContext.Provider>
    );
};

export { MenuContext, MenuProvider }; 