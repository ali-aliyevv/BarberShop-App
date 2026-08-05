import React, { useCallback, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
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
import { Navbar } from "./layout/Navbar"; // Navbar komponentini çağırırıq

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
    className="h-full flex flex-col"
  >
    {children}
  </motion.div>
);

const AnimatedRoutes = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const userRole = localStorage.getItem("userRole");

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const closeMenu = () => setIsMobileMenuOpen(false);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    localStorage.removeItem("userPhone");
    closeMenu();
    navigate("/login", { replace: true });
  }, [navigate]);

  const isHomePage = location.pathname === "/";

  return (
    <div
      className={`min-h-screen flex flex-col font-sans overflow-x-hidden transition-colors duration-300 ${
        isHomePage ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      {/* Navbar komponentini burada istifadə edirik */}
      <Navbar
        isLoggedIn={isLoggedIn}
        userRole={userRole}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        closeMenu={closeMenu}
        handleLogout={handleLogout}
      />

      <div className="grow flex flex-col">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<AnimatedRoute><Home /></AnimatedRoute>} />
            <Route path="/services" element={<AnimatedRoute><Services /></AnimatedRoute>} />
            <Route path="/barbers" element={<AnimatedRoute><Barbers /></AnimatedRoute>} />
            <Route path="/dashboard" element={<ClientRoute><AnimatedRoute><Dashboard /></AnimatedRoute></ClientRoute>} />
            <Route path="/login" element={<AnimatedRoute><Login /></AnimatedRoute>} />
            <Route path="/signup" element={<AnimatedRoute><Signup /></AnimatedRoute>} />
            <Route path="/admin" element={<AdminRoute><AnimatedRoute><Admin /></AnimatedRoute></AdminRoute>} />
          </Routes>
        </AnimatePresence>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AnimatedRoutes />
    </Router>
  );
};

export default App;