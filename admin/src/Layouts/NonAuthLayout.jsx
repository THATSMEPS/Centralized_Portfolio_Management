import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import withRouter from "../Components/Common/withRouter";
import { applyTheme } from "../common/themeConfig";

const NonAuthLayout = ({ children }) => {
    useEffect(() => {
        // Set default to light mode for auth pages
        document.body.setAttribute("data-layout-mode", "light");

        // Apply central theme
        applyTheme();

        return () => {
            document.body.removeAttribute("data-layout-mode");
        };
    }, []);

    return <div>{children || <Outlet />}</div>;
};

export default withRouter(NonAuthLayout);
