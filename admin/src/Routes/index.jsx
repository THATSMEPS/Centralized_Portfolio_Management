import React, { useContext } from 'react';
import { Routes, Route } from "react-router-dom";

//Layouts
import NonAuthLayout from "../Layouts/NonAuthLayout";
import VerticalLayout from "../Layouts/index";

//routes
import { authProtectedRoutes, publicRoutes } from "./allRoutes";
import { AuthProtected } from './AuthProtected';
import { AuthContext } from '../context/AuthContext';
// import LoadingScreen from '../Components/Common/LoadingScreen';

import PublicRoute from './PublicRoute';

const Index = () => {

    const { adminData, setAdminData } = useContext(AuthContext);

    return (
        <React.Fragment>
            {/* {loading && <LoadingScreen />} */}
            <Routes>
                <Route element={<NonAuthLayout />}>
                    {publicRoutes.map((route, idx) => (
                        <Route
                            path={route.path}
                            element={
                                <PublicRoute>
                                    {route.component}
                                </PublicRoute>
                            }
                            key={idx}
                            exact={true}
                        />
                    ))}
                </Route>

                <Route element={<VerticalLayout />}>
                    {authProtectedRoutes.map((route, idx) => (
                        <Route
                            path={route.path}
                            element={
                                <AuthProtected allowedRoles={route.allowedRoles}>
                                    {route.component}
                                </AuthProtected>
                            }
                            key={idx}
                            exact={true}
                        />
                    ))}
                </Route>
            </Routes>
        </React.Fragment>
    );
};

export default Index;