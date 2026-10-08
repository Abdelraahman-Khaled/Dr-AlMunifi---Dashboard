import React from "react";
import { Navigate } from "react-router";
import { getToken } from "../../api/token";

interface GuestRouteProps {
    children: React.ReactNode;
}

// Keeps signed-in users away from the sign-in page
const GuestRoute: React.FC<GuestRouteProps> = ({ children }) => {
    if (getToken()) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

export default GuestRoute;
