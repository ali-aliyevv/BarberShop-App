import React, { useCallback, useState } from "react";
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
import { Menu, X } from "lucide-react";

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

  // Mobil menyunun vəziyyətini idarə edən state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Linkə kliklədikdə mobil menyunu bağlamaq üçün funksiya
  const closeMenu = () => setIsMobileMenuOpen(false);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    localStorage.removeItem("userPhone");
    closeMenu();
    navigate("/login", { replace: true });
  }, [navigate]);

  // 🚀 AĞILLI YOXLANIŞ: Səhifə "Home" (/)-dirsə tünd rəng, deyilsə açıq rəng ver!
  const isHomePage = location.pathname === "/";

  return (
    <div
      className={`min-h-screen flex flex-col font-sans overflow-x-hidden transition-colors duration-300 ${
        isHomePage ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      <nav className="bg-gray-900 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto p-4 flex justify-between items-center">
          <h1 className="text-2xl font-extrabold text-amber-500">
            <Link to="/" onClick={closeMenu}>
              ✂️ Deluxe BarberShop
            </Link>
          </h1>

          {/* Desktop Naviqasiya (Böyük ekranlar üçün) */}
          <div className="hidden md:flex space-x-6 font-semibold items-center">
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

          {/* Mobil Menyu Düyməsi */}
          <button
            className="md:hidden text-amber-500 hover:text-amber-400 focus:outline-none"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobil Menyu Açılan Panel (Kiçik ekranlar üçün) */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden bg-gray-800 border-t border-gray-700 overflow-hidden"
            >
              <div className="flex flex-col px-6 py-4 space-y-4 font-semibold text-center">
                {userRole !== "barber" && (
                  <>
                    <Link
                      to="/services"
                      onClick={closeMenu}
                      className="block hover:text-amber-400 transition"
                    >
                      Xidmətlər
                    </Link>
                    <Link
                      to="/barbers"
                      onClick={closeMenu}
                      className="block hover:text-amber-400 transition"
                    >
                      Bərbərlər
                    </Link>
                  </>
                )}

                {isLoggedIn && userRole === "client" && (
                  <Link
                    to="/dashboard"
                    onClick={closeMenu}
                    className="block hover:text-amber-400 transition"
                  >
                    Kabinet
                  </Link>
                )}

                {isLoggedIn &&
                  (userRole === "admin" || userRole === "barber") && (
                    <Link
                      to="/admin"
                      onClick={closeMenu}
                      className="block text-amber-400 hover:underline"
                    >
                      İdarəetmə Paneli
                    </Link>
                  )}

                <div className="pt-2 border-t border-gray-700">
                  {isLoggedIn ? (
                    <button
                      onClick={handleLogout}
                      className="w-full bg-red-600 px-4 py-2.5 rounded-lg text-sm hover:bg-red-700 transition"
                    >
                      Çıxış
                    </button>
                  ) : (
                    <Link
                      to="/login"
                      onClick={closeMenu}
                      className="block w-full bg-amber-500 text-gray-900 px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-amber-400 transition"
                    >
                      Giriş
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <div className="grow flex flex-col">
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