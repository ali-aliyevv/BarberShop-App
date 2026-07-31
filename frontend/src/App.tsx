import React, { useCallback } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import Home from "./components/Home";
import Services from "./components/Services";
import Barbers from "./components/Barbers";
import Dashboard from "./components/Dashboard";
import Admin from "./components/Admin";
import Login from "./components/Login";
import Signup from "./components/SignUp";

const ClientRoute = ({ children }: { children: React.ReactNode }) => {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const userRole = localStorage.getItem("userRole");
  return isLoggedIn && userRole === "client" ? (
    <>{children}</>
  ) : (
    <Navigate to="/login" replace />
  );
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const userRole = localStorage.getItem("userRole");
  return isLoggedIn && (userRole === "admin" || userRole === "barber") ? (
    <>{children}</>
  ) : (
    <Navigate to="/login" replace />
  );
};

const AnimatedRoute = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.25, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);

const AnimatedRoutes = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const userRole = localStorage.getItem("userRole");

  const handleLogout = useCallback(() => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    localStorage.removeItem("userPhone");
    navigate("/login", { replace: true });
  }, [navigate]);

  return (
    <>
      <nav className="bg-gray-900 text-white p-4 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-extrabold text-amber-500">
            <Link to="/">✂️ Deluxe BarberShop</Link>
          </h1>
          <div className="space-x-6 font-semibold flex items-center">
            {userRole !== "barber" && (
              <>
                <Link
                  to="/services"
                  className="hover:text-amber-400 transition"
                >
                  Xidmətlər
                </Link>
                <Link to="/barbers" className="hover:text-amber-400 transition">
                  Bərbərlər
                </Link>
              </>
            )}

            {isLoggedIn && userRole === "client" && (
              <Link to="/dashboard" className="hover:text-amber-400 transition">
                Kabinet
              </Link>
            )}

            {isLoggedIn && (userRole === "admin" || userRole === "barber") && (
              <Link to="/admin" className="text-amber-400 hover:underline">
                İdarəetmə Paneli
              </Link>
            )}

            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="bg-red-600 px-4 py-1.5 rounded-lg text-sm hover:bg-red-700 transition"
              >
                Çıxış
              </button>
            ) : (
              <Link
                to="/login"
                className="bg-amber-500 text-gray-900 px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-amber-400 transition"
              >
                Giriş
              </Link>
            )}
          </div>
        </div>
      </nav>

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route
            path="/"
            element={
              <AnimatedRoute>
                <Home />
              </AnimatedRoute>
            }
          />
          <Route
            path="/services"
            element={
              <AnimatedRoute>
                <Services />
              </AnimatedRoute>
            }
          />
          <Route
            path="/barbers"
            element={
              <AnimatedRoute>
                <Barbers />
              </AnimatedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ClientRoute>
                <AnimatedRoute>
                  <Dashboard />
                </AnimatedRoute>
              </ClientRoute>
            }
          />
          <Route
            path="/login"
            element={
              <AnimatedRoute>
                <Login />
              </AnimatedRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <AnimatedRoute>
                <Signup />
              </AnimatedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AnimatedRoute>
                  <Admin />
                </AnimatedRoute>
              </AdminRoute>
            }
          />
        </Routes>
      </AnimatePresence>
    </>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans overflow-x-hidden">
        <div className="grow">
          <AnimatedRoutes />
        </div>
      </div>
    </Router>
  );
};

export default App;