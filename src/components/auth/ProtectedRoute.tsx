import React from "react";
import { Navigate } from "react-router";
import { getToken } from "../../api/token";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const token = getToken();

    if (!token) {
        // Redirect to signin if no token is found
        return <Navigate to="/signin" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
