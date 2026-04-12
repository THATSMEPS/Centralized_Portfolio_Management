import React from "react";

const Navdata = () => {
    const menuItems = [
        {
            label: "Menu",
            isHeader: true,
        },
        {
            id: "dashboard",
            label: "Dashboard",
            icon: "ri-dashboard-2-line",
            link: "/dashboard",
        },
        {
            label: "Portfolio",
            isHeader: true,
        },
        {
            id: "site-settings",
            label: "Site Settings",
            icon: "ri-settings-3-line",
            link: "/site-settings",
        },
        {
            id: "team-members",
            label: "Team Members",
            icon: "ri-team-line",
            link: "/team-members",
        },
        {
            id: "services",
            label: "Services",
            icon: "ri-service-line",
            link: "/services",
        },
        {
            id: "projects",
            label: "Projects",
            icon: "ri-code-s-slash-line",
            link: "/projects",
        },
        {
            id: "enquiries",
            label: "Enquiries",
            icon: "ri-mail-line",
            link: "/enquiries",
        },
        {
            label: "System",
            isHeader: true,
        },
        {
            id: "company-details",
            label: "Company Details",
            icon: "ri-building-line",
            link: "/company-details",
        },
        {
            id: "employees",
            label: "Employees",
            icon: "ri-user-settings-line",
            link: "/employee",
        },
        {
            id: "profile",
            label: "My Profile",
            icon: "ri-user-line",
            link: "/profile",
        },
    ];
    return <React.Fragment>{menuItems}</React.Fragment>;
};
export default Navdata;
