
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import SpaceBackground from "@/components/SpaceBackground";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
      <SpaceBackground />
      <div className="relative z-10 text-center text-white">
        <h1 className="mb-4 text-9xl font-bold">404</h1>
        <p className="mb-8 text-2xl text-gray-300">Oops! Page not found</p>
        <Link
          to="/"
          className="rounded-md bg-purple-600/50 px-6 py-3 text-lg text-white hover:bg-purple-600/70 border border-purple-400/50 transition-colors"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
