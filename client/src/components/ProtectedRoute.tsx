import { ReactNode, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
}

export default function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // If not loading and not authenticated, redirect to login
    if (!isLoading && !isAuthenticated) {
      setLocation("/login");
    }
    
    // If admin route but user is not an admin, redirect to home
    if (!isLoading && isAuthenticated && adminOnly && user?.role !== "admin") {
      setLocation("/");
    }
  }, [isLoading, isAuthenticated, user, adminOnly, setLocation]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#36393F]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#5865F2]" />
          <p className="mt-4 text-white">Loading...</p>
        </div>
      </div>
    );
  }

  // If admin route and user is not admin
  if (adminOnly && user?.role !== "admin") {
    return null; // This will be redirected in the useEffect
  }

  // If authenticated, render the children
  return isAuthenticated ? <>{children}</> : null;
}